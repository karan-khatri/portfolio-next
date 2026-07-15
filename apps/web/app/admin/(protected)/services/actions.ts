"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface ActionResult {
  error?: string;
}

export async function createServiceAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.service.count();
    const created = await prisma.service.create({
      data: {
        locale: "en",
        title: String(values.title ?? ""),
        description: (values.description as string) || null,
        order: count,
      },
    });
    await logAudit({ userId: user.id, action: "service.created", entity: "Service", entityId: created.id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateServiceAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.service.update({
      where: { id },
      data: {
        title: String(values.title ?? ""),
        description: (values.description as string) || null,
      },
    });
    await logAudit({ userId: user.id, action: "service.updated", entity: "Service", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.service.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "service.deleted", entity: "Service", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderServiceAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.service.update({ where: { id }, data: { order: index } })),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
