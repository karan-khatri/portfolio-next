"use server";

import { revalidatePath } from "next/cache";
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

export async function createNavigationItemAction(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.navigationItem.count();
    const created = await prisma.navigationItem.create({
      data: {
        locale: "en",
        label: String(values.label ?? ""),
        href: String(values.href ?? ""),
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "navigationItem.created",
      entity: "NavigationItem",
      entityId: created.id,
    });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateNavigationItemAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.navigationItem.update({
      where: { id },
      data: {
        label: String(values.label ?? ""),
        href: String(values.href ?? ""),
      },
    });
    await logAudit({
      userId: user.id,
      action: "navigationItem.updated",
      entity: "NavigationItem",
      entityId: id,
    });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteNavigationItemAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.navigationItem.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "navigationItem.deleted",
      entity: "NavigationItem",
      entityId: id,
    });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderNavigationItemAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.navigationItem.update({ where: { id }, data: { order: index } }),
      ),
    );
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
