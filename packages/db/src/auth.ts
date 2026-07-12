import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./client";
import type { UserRole } from "./generated/client";

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

export async function verifySessionToken(token: string) {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroySessionToken(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function createInvite(params: {
  email: string;
  role: UserRole;
  invitedById: string;
}) {
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  return prisma.inviteToken.create({
    data: {
      email: params.email,
      role: params.role,
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

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: invite.email,
        role: invite.role,
        invitedById: invite.invitedById,
        passwordHash: hashPassword(password),
      },
    }),
    prisma.inviteToken.update({
      where: { token },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return user;
}
