import { cookies } from "next/headers";
import { StatusCodes } from "http-status-codes";
import { prisma, verifyPassword, createSession, getActiveRoleAssignment } from "@portfolio/db/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !password) {
    return apiError("Email and password are required", { status: StatusCodes.BAD_REQUEST });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return apiError("Invalid credentials", { status: StatusCodes.UNAUTHORIZED });
  }

  const { token, expiresAt } = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  const activeRole = await getActiveRoleAssignment(user.id);
  return apiSuccess({ email: user.email, role: activeRole?.role.name ?? null }, "Signed in");
}
