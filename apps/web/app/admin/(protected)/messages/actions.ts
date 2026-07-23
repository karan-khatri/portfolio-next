"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface ActionResult {
  error?: string;
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.contactMessage.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "contactMessage.deleted", entity: "ContactMessage", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function toggleMessageReadAction(id: string, read: boolean): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.contactMessage.update({ where: { id }, data: { read } });
    await logAudit({
      userId: user.id,
      action: read ? "contactMessage.read" : "contactMessage.unread",
      entity: "ContactMessage",
      entityId: id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update" };
  }
}
