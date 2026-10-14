import { prisma } from "@portfolio/db/server";
import type { AppLocale } from "./config";
import type { AlternatePaths } from "./alternates";

type Entity = "page" | "project" | "post";

function pathFor(entity: Entity, slug: string): string {
  if (entity === "page") return slug === "home" ? "/" : `/${slug}`;
  return entity === "project" ? `/projects/${slug}` : `/blog/${slug}`;
}

async function publishedTranslations(entity: Entity, groupId: string) {
  const where = { translationGroupId: groupId, status: "PUBLISHED" as const };
  const select = { slug: true, locale: true };
  if (entity === "page") return prisma.page.findMany({ where, select });
  if (entity === "project") return prisma.project.findMany({ where, select });
  return prisma.post.findMany({ where, select });
}

export async function alternatePaths(entity: Entity, groupId: string): Promise<AlternatePaths> {
  const rows = await publishedTranslations(entity, groupId);
  return Object.fromEntries(rows.map((row) => [row.locale, pathFor(entity, row.slug)]));
}

export async function findTranslationSlug(
  entity: Entity,
  groupId: string,
  locale: AppLocale,
): Promise<string | null> {
  const where = { translationGroupId: groupId, locale, status: "PUBLISHED" as const };
  const select = { slug: true };
  const row =
    entity === "page"
      ? await prisma.page.findFirst({ where, select })
      : entity === "project"
        ? await prisma.project.findFirst({ where, select })
        : await prisma.post.findFirst({ where, select });
  return row?.slug ?? null;
}

export function translationRedirectPath(entity: Entity, slug: string): string {
  return pathFor(entity, slug);
}
