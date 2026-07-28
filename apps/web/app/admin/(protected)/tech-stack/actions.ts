"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createTechStackItemAction(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.techStackItem.count();
    const created = await prisma.techStackItem.create({
      data: {
        name: String(values.name ?? ""),
        imageUrl: (values.imageUrl as string) || null,
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "techStackItem.created",
      entity: "TechStackItem",
      entityId: created.id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateTechStackItemAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.techStackItem.update({
      where: { id },
      data: {
        name: String(values.name ?? ""),
        imageUrl: (values.imageUrl as string) || null,
      },
    });
    await logAudit({
      userId: user.id,
      action: "techStackItem.updated",
      entity: "TechStackItem",
      entityId: id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteTechStackItemAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.techStackItem.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "techStackItem.deleted",
      entity: "TechStackItem",
      entityId: id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderTechStackItemAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.techStackItem.update({ where: { id }, data: { order: index } }),
      ),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
