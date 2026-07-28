"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createLanguageAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.language.count();
    const created = await prisma.language.create({
      data: {
        locale: "en",
        name: String(values.name ?? ""),
        proficiency: String(values.proficiency ?? ""),
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "language.created",
      entity: "Language",
      entityId: created.id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateLanguageAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.language.update({
      where: { id },
      data: {
        name: String(values.name ?? ""),
        proficiency: String(values.proficiency ?? ""),
      },
    });
    await logAudit({ userId: user.id, action: "language.updated", entity: "Language", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteLanguageAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.language.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "language.deleted", entity: "Language", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderLanguageAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.language.update({ where: { id }, data: { order: index } }),
      ),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
