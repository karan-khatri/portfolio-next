import { StatusCodes } from "http-status-codes";
import { createInvite, prisma } from "@portfolio/db/server";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { apiSuccess, apiError } from "@/lib/api/response";
import { sendEmail, escapeHtml } from "@/lib/email";

export async function POST(request: Request) {
  let currentUser;
  try {
    currentUser = await requireAdminRole();
  } catch {
    return apiError("Unauthorized", { status: StatusCodes.UNAUTHORIZED });
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

  const roleExpiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    const invite = await createInvite({ email, roleId, roleExpiresAt, invitedById: currentUser.id });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const inviteUrl = `${siteUrl}/admin/accept-invite/${invite.token}`;
    await sendEmail({
      to: email,
      subject: "You've been invited to the admin dashboard",
      html: `
        <p>You've been invited to join as <strong>${escapeHtml(role.name)}</strong>.</p>
        <p><a href="${inviteUrl}">Accept the invite</a></p>
        <p>This link expires on ${invite.expiresAt.toLocaleString()}.</p>
      `,
    });

    return apiSuccess({ token: invite.token, expiresAt: invite.expiresAt }, "Invite sent");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Could not create invite", {
      status: StatusCodes.BAD_REQUEST,
    });
  }
}
