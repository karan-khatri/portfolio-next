import { StatusCodes } from "http-status-codes";
import { createInvite, type UserRole } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

const VALID_ROLES: UserRole[] = ["ADMIN", "EDITOR"];

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return apiError("Unauthorized", { status: StatusCodes.UNAUTHORIZED });
  }
  if (currentUser.role !== "ADMIN") {
    return apiError("Only admins can send invites", { status: StatusCodes.FORBIDDEN });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : null;
  const role = VALID_ROLES.includes(body?.role) ? (body.role as UserRole) : "EDITOR";

  if (!email) {
    return apiError("Email is required", { status: StatusCodes.BAD_REQUEST });
  }

  const invite = await createInvite({ email, role, invitedById: currentUser.id });
  return apiSuccess({ token: invite.token, expiresAt: invite.expiresAt }, "Invite sent");
}
