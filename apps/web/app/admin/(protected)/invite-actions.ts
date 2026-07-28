"use server";

import { revalidatePath } from "next/cache";
import { createInvite, prisma } from "@portfolio/db/server";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { sendEmail, escapeHtml } from "@/lib/email";
import type { ActionResult } from "@/lib/admin/action-result";

export interface CreateInviteResult extends ActionResult {
  token?: string;
  expiresAt?: string;
}

export async function createInviteAction(
  email: string,
  roleId: string,
  expiresInDays: number | null,
): Promise<CreateInviteResult> {
  try {
    const currentUser = await requireAdminRole();

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return { error: "Unknown role" };
    }

    const roleExpiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

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

    revalidatePath("/admin");
    return { token: invite.token, expiresAt: invite.expiresAt.toISOString() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create invite" };
  }
}
