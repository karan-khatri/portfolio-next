"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface ActionResult {
  error?: string;
}

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createSkillAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.skill.count();
    const created = await prisma.skill.create({
      data: {
        locale: "en",
        name: String(values.name ?? ""),
        category: (values.category as string) || null,
        level: (values.level as number | null) ?? null,
        order: count,
      },
    });
    await logAudit({ userId: user.id, action: "skill.created", entity: "Skill", entityId: created.id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateSkillAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.skill.update({
      where: { id },
      data: {
        name: String(values.name ?? ""),
        category: (values.category as string) || null,
        level: (values.level as number | null) ?? null,
      },
    });
    await logAudit({ userId: user.id, action: "skill.updated", entity: "Skill", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.skill.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "skill.deleted", entity: "Skill", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderSkillAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.skill.update({ where: { id }, data: { order: index } })),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
