import { cookies } from "next/headers";
import { StatusCodes } from "http-status-codes";
import { acceptInvite, createSession, getActiveRoleAssignment } from "@portfolio/db/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!token || !password || password.length < 8) {
    return apiError("A token and a password of at least 8 characters are required", {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  const user = await acceptInvite(token, password);
  if (!user) {
    return apiError("Invite is invalid or expired", { status: StatusCodes.BAD_REQUEST });
  }

  const { token: sessionToken, expiresAt } = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  const activeRole = await getActiveRoleAssignment(user.id);
  return apiSuccess({ email: user.email, role: activeRole?.role?.name ?? null }, "Invite accepted");
}
