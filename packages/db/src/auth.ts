import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./client";

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const DUMMY_PASSWORD_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

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
  const windowStart = new Date(Date.now() - LOGIN_RATE_LIMIT_WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: windowStart } },
  });
  return recentFailures >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
}

export async function verifyLoginCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  const success = Boolean(user) && valid;
  await prisma.loginAttempt.create({ data: { email, success } });
  return success ? user : null;
}

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
