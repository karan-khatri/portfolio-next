"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createEducationAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.education.count();
    const created = await prisma.education.create({
      data: {
        locale: "en",
        institution: String(values.institution ?? ""),
        degree: String(values.degree ?? ""),
        location: (values.location as string) || null,
        startDate: (values.startDate as Date | null) ?? new Date(),
        endDate: (values.endDate as Date | null) ?? null,
        description: (values.description as string) || null,
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "education.created",
      entity: "Education",
      entityId: created.id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateEducationAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.education.update({
      where: { id },
      data: {
        institution: String(values.institution ?? ""),
        degree: String(values.degree ?? ""),
        location: (values.location as string) || null,
        startDate: (values.startDate as Date | null) ?? undefined,
        endDate: (values.endDate as Date | null) ?? null,
        description: (values.description as string) || null,
      },
    });
    await logAudit({ userId: user.id, action: "education.updated", entity: "Education", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteEducationAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.education.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "education.deleted", entity: "Education", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderEducationAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.education.update({ where: { id }, data: { order: index } }),
      ),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
