import { StatusCodes } from "http-status-codes";
import { createInvite, prisma } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

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
  const roleId = typeof body?.roleId === "string" ? body.roleId : null;
  const expiresInDays =
    typeof body?.expiresInDays === "number" && Number.isFinite(body.expiresInDays)
      ? body.expiresInDays
      : null;

  if (!email || !roleId) {
    return apiError("Email and role are required", { status: StatusCodes.BAD_REQUEST });
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return apiError("Unknown role", { status: StatusCodes.BAD_REQUEST });
  }

  // Pass the client's intent through as-is (don't silently normalize a
  // mismatch away) — createInvite's assertRoleTimeFrame is the single
  // source of truth for "permanent roles can't have an expiry, everything
  // else must," and it rejects a bad combination with a clear error.
  const roleExpiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    const invite = await createInvite({ email, roleId, roleExpiresAt, invitedById: currentUser.id });
    return apiSuccess({ token: invite.token, expiresAt: invite.expiresAt }, "Invite sent");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Could not create invite", {
      status: StatusCodes.BAD_REQUEST,
    });
  }
}
