"use server";

import { revalidatePath } from "next/cache";
import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createNavigationItemAction(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const parentId = values.parentId ? String(values.parentId) : null;

    // Nav is documented/designed as one level of nesting — the schema can't
    // express "no deeper than 1" or "no cycles" as a constraint, so guard it
    // here: a parent must itself be a top-level item.
    if (parentId) {
      const parent = await prisma.navigationItem.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      });
      if (!parent || parent.parentId) {
        return { error: "Sub-links can only be one level deep" };
      }
    }

    const count = await prisma.navigationItem.count({ where: { parentId } });
    const created = await prisma.navigationItem.create({
      data: {
        locale: "en",
        label: String(values.label ?? ""),
        href: String(values.href ?? ""),
        parentId,
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
    await prisma.$transaction([
      prisma.navigationItem.deleteMany({ where: { parentId: id } }),
      prisma.navigationItem.delete({ where: { id } }),
    ]);
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

export async function reorderNavigationItemAction(
  parentId: string | null,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.navigationItem.update({ where: { id, parentId }, data: { order: index } }),
      ),
    );
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
