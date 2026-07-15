"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface ActionResult {
  error?: string;
}

export async function createExperienceAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.experience.count();
    const created = await prisma.experience.create({
      data: {
        locale: "en",
        company: String(values.company ?? ""),
        title: String(values.title ?? ""),
        startDate: (values.startDate as Date | null) ?? new Date(),
        endDate: (values.endDate as Date | null) ?? null,
        description: (values.description as string) || null,
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "experience.created",
      entity: "Experience",
      entityId: created.id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateExperienceAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.experience.update({
      where: { id },
      data: {
        company: String(values.company ?? ""),
        title: String(values.title ?? ""),
        startDate: (values.startDate as Date | null) ?? undefined,
        endDate: (values.endDate as Date | null) ?? null,
        description: (values.description as string) || null,
      },
    });
    await logAudit({ userId: user.id, action: "experience.updated", entity: "Experience", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteExperienceAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.experience.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "experience.deleted", entity: "Experience", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderExperienceAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.experience.update({ where: { id }, data: { order: index } }),
      ),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
