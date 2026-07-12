import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./client";

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// Session tokens are 256 bits of CSPRNG entropy already, so a fast
// cryptographic hash (not scrypt) is the right tool here — scrypt's slowness
// exists to blunt brute-forcing low-entropy secrets like passwords, and
// would only add latency to every authenticated request without a matching
// security benefit for a token this large.
function hashToken(token: string): string {
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

// A user's "current role" is whichever assignment's window covers now() —
// not a cached/scalar value — so a timed grant expiring requires no
// separate cleanup job: the next lookup simply stops finding it.
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

export async function verifySessionToken(token: string) {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const activeRole = await getActiveRoleAssignment(session.userId);
  return { ...session.user, role: activeRole?.role.name ?? null };
}

// Every non-permanent role grant must carry an expiry; a permanent role
// (ADMIN) must not. Enforced here so both the invite flow and any future
// direct role-assignment path share one rule instead of duplicating it.
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

export async function createInvite(params: {
  email: string;
  roleId: string;
  roleExpiresAt: Date | null;
  invitedById: string;
}) {
  await assertRoleTimeFrame(params.roleId, params.roleExpiresAt);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  return prisma.inviteToken.create({
    data: {
      email: params.email,
      roleId: params.roleId,
      roleExpiresAt: params.roleExpiresAt,
      invitedById: params.invitedById,
      expiresAt,
    },
  });
}

export async function acceptInvite(token: string, password: string) {
  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return null;
  }

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
    await tx.inviteToken.update({
      where: { token },
      data: { acceptedAt: new Date() },
    });
    return user;
  });
}
