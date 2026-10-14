"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { revalidatePublicSite } from "@/lib/admin/revalidate";

export async function createNavigationItemAction(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const parentId = values.parentId ? String(values.parentId) : null;
    const locale: AppLocale = isAppLocale(String(values.locale)) ? (String(values.locale) as AppLocale) : DEFAULT_LOCALE;

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

    const count = await prisma.navigationItem.count({ where: { parentId, locale } });
    const created = await prisma.navigationItem.create({
      data: {
        locale,
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
    revalidatePublicSite();
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
    revalidatePublicSite();
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
    revalidatePublicSite();
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
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}

export async function copyNavigationFromDefaultAction(targetLocale: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    if (!isAppLocale(targetLocale) || targetLocale === DEFAULT_LOCALE) {
      return { error: "Choose a non-default language to copy into" };
    }
    const locale: AppLocale = targetLocale;

    const existing = await prisma.navigationItem.count({ where: { locale } });
    if (existing > 0) return { error: "This language already has navigation links" };

    const source = await prisma.navigationItem.findMany({
      where: { locale: DEFAULT_LOCALE, parentId: null },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    });
    if (source.length === 0) return { error: "There are no default-language links to copy" };

    for (const item of source) {
      const parent = await prisma.navigationItem.create({
        data: { locale, label: item.label, href: item.href, order: item.order },
      });
      for (const child of item.children) {
        await prisma.navigationItem.create({
          data: { locale, label: child.label, href: child.href, order: child.order, parentId: parent.id },
        });
      }
    }

    await logAudit({
      userId: user.id,
      action: "navigationItem.copied",
      entity: "NavigationItem",
      entityId: locale,
    });
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not copy" };
  }
}
