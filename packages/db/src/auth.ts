import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./client";

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const DUMMY_PASSWORD_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

// User.email's uniqueness is case-sensitive at the DB level (Postgres text
// comparison), so without normalizing at every read/write site, "Foo@Bar.com"
// and "foo@bar.com" would be treated as different accounts. Normalizing here
// — the single choke point every lookup/creation already goes through —
// makes the @unique constraint behave as case-insensitive in practice.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function isLoginRateLimited(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const windowStart = new Date(Date.now() - LOGIN_RATE_LIMIT_WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { email: normalizedEmail, success: false, createdAt: { gte: windowStart } },
  });
  return recentFailures >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
}

export async function verifyLoginCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const valid = verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  const success = Boolean(user) && valid;
  await prisma.loginAttempt.create({ data: { email: normalizedEmail, success } });
  return success ? user : null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });
  return { token, expiresAt };
}

export async function destroySessionToken(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getActiveRoleAssignment(userId: string) {
  const now = new Date();
  return prisma.userRoleAssignment.findFirst({
    where: {
      userId,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { startsAt: "desc" },
    include: { role: true },
  });
}

/**
 * Defense-in-depth for the CMS mutation functions (saveDraft, publishRevision,
 * unpublishEntity, restoreRevision, createPreviewToken): today every real
 * caller already passes through requireEditor()/requireAdminRole() at the
 * apps/web route layer first, so this is redundant there — but these
 * `packages/db` functions otherwise take a userId purely for audit-log
 * attribution and would silently trust *any* string. This makes them check
 * for themselves, so a future API route or webhook that forgets the
 * layout-level gate still can't call through as an unprivileged user.
 */
export async function assertHasActiveRole(userId: string): Promise<void> {
  const assignment = await getActiveRoleAssignment(userId);
  // assignment.role is null if the Role it pointed at was since deleted
  // (SetNull) — that's no longer a live permission grant, so treat it the
  // same as having no assignment at all.
  if (!assignment || !assignment.role) {
    throw new Error("Unauthorized: no active role assignment");
  }
}

export async function verifySessionToken(token: string) {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const activeRole = await getActiveRoleAssignment(session.userId);
  return { ...session.user, role: activeRole?.role?.name ?? null };
}

async function assertRoleTimeFrame(roleId: string, expiresAt: Date | null) {
  const role = await prisma.role.findUniqueOrThrow({ where: { id: roleId } });
  if (role.isPermanent && expiresAt) {
    throw new Error(`Role "${role.name}" is permanent and cannot have an expiry`);
  }
  if (!role.isPermanent && !expiresAt) {
    throw new Error(`Role "${role.name}" requires an expiry time frame`);
  }
  return role;
}

export async function assignRole(params: {
  userId: string;
  roleId: string;
  expiresAt: Date | null;
  grantedById?: string;
}) {
  await assertRoleTimeFrame(params.roleId, params.expiresAt);
  return prisma.userRoleAssignment.create({
    data: {
      userId: params.userId,
      roleId: params.roleId,
      expiresAt: params.expiresAt,
      grantedById: params.grantedById,
    },
  });
}

export async function revokeRole(assignmentId: string) {
  return prisma.userRoleAssignment.update({
    where: { id: assignmentId },
    data: { expiresAt: new Date() },
  });
}

export async function createInvite(params: {
  email: string;
  roleId: string;
  roleExpiresAt: Date | null;
  invitedById: string;
}) {
  await assertRoleTimeFrame(params.roleId, params.roleExpiresAt);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const created = await prisma.inviteToken.create({
    data: {
      tokenHash,
      email: normalizeEmail(params.email),
      roleId: params.roleId,
      roleExpiresAt: params.roleExpiresAt,
      invitedById: params.invitedById,
      expiresAt,
    },
  });
  return { ...created, token };
}

export async function acceptInvite(token: string, password: string) {
  const tokenHash = hashToken(token);

  // Atomically claim the invite: the `acceptedAt: null` / not-expired conditions
  // are enforced *in* the update's WHERE clause, not checked separately beforehand,
  // so two concurrent requests for the same token can't both pass a read-then-write
  // race — only one `updateMany` can match and flip the still-null row.
  const claimed = await prisma.inviteToken.updateMany({
    where: { tokenHash, acceptedAt: null, expiresAt: { gt: new Date() } },
    data: { acceptedAt: new Date() },
  });
  if (claimed.count === 0) return null;

  const invite = await prisma.inviteToken.findUniqueOrThrow({ where: { tokenHash } });

  // roleId is nullable (SetNull on the referenced Role being deleted) — if the
  // role this invite was for no longer exists, the invite is no longer
  // completable. It's already been claimed above, so this treats it the same
  // as an expired one: single-use, now permanently invalid.
  if (!invite.roleId) return null;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invite.email,
        invitedById: invite.invitedById,
        passwordHash: hashPassword(password),
      },
    });
    await tx.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: invite.roleId,
        expiresAt: invite.roleExpiresAt,
        grantedById: invite.invitedById,
      },
    });
    return user;
  });
}
