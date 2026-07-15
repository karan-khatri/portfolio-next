"use server";

import { revalidatePath } from "next/cache";
import { assignRole, revokeRole, logAudit } from "@portfolio/db/server";
import { requireAdminRole } from "@/lib/auth/require-admin";

export interface ActionResult {
  error?: string;
}

export async function assignRoleAction(
  targetUserId: string,
  roleId: string,
  expiresInDays: number | null,
): Promise<ActionResult> {
  try {
    const user = await requireAdminRole();
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;
    const assignment = await assignRole({
      userId: targetUserId,
      roleId,
      expiresAt,
      grantedById: user.id,
    });
    await logAudit({
      userId: user.id,
      action: "user.role_assigned",
      entity: "User",
      entityId: targetUserId,
      metadata: { roleId, assignmentId: assignment.id },
    });
    revalidatePath("/admin/users");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not assign role" };
  }
}

export async function revokeRoleAction(
  targetUserId: string,
  assignmentId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAdminRole();
    if (targetUserId === user.id) return { error: "You can't revoke your own role." };
    await revokeRole(assignmentId);
    await logAudit({
      userId: user.id,
      action: "user.role_revoked",
      entity: "User",
      entityId: targetUserId,
      metadata: { assignmentId },
    });
    revalidatePath("/admin/users");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not revoke role" };
  }
}
