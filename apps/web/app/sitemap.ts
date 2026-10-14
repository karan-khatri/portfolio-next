import type { MetadataRoute } from "next";
import { prisma } from "@portfolio/db/server";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "@/lib/i18n/config";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Entry = MetadataRoute.Sitemap[number];

interface TranslatedRow {
  slug: string;
  locale: AppLocale;
  translationGroupId: string;
  updatedAt: Date;
}

function urlFor(path: string, locale: AppLocale): string {
  return absoluteUrl(siteUrl, localizePath(path, locale));
}

function translatedEntries(
  rows: TranslatedRow[],
  pathFor: (slug: string) => string,
  changeFrequency: Entry["changeFrequency"],
  priorityFor: (slug: string) => number,
): Entry[] {
  const groups = new Map<string, TranslatedRow[]>();
  for (const row of rows) {
    groups.set(row.translationGroupId, [...(groups.get(row.translationGroupId) ?? []), row]);
  }

  return rows.map((row) => {
    const siblings = groups.get(row.translationGroupId) ?? [row];
    const languages: Record<string, string> = Object.fromEntries(
      siblings.map((sibling) => [sibling.locale, urlFor(pathFor(sibling.slug), sibling.locale)]),
    );
    const defaultSibling = siblings.find((sibling) => sibling.locale === DEFAULT_LOCALE);
    if (defaultSibling) languages["x-default"] = urlFor(pathFor(defaultSibling.slug), DEFAULT_LOCALE);

    return {
      url: urlFor(pathFor(row.slug), row.locale),
      lastModified: row.updatedAt,
      changeFrequency,
      priority: priorityFor(row.slug),
      alternates: siblings.length > 1 ? { languages } : undefined,
    };
  });
}

function indexEntries(path: string, changeFrequency: Entry["changeFrequency"], priority: number): Entry[] {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((locale) => [locale, urlFor(path, locale)]),
  );
  languages["x-default"] = urlFor(path, DEFAULT_LOCALE);
  return LOCALES.map((locale) => ({
    url: urlFor(path, locale),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const where = { status: "PUBLISHED" as const, OR: [{ seo: null }, { seo: { noindex: false } }] };
  const select = { slug: true, locale: true, translationGroupId: true, updatedAt: true };

  const [pages, projects, posts, authors] = await Promise.all([
    prisma.page.findMany({ where, select }),
    prisma.project.findMany({ where, select }),
    prisma.post.findMany({ where, select }),
    prisma.author.findMany({ select: { slug: true } }),
  ]);

  const authorEntries = authors.flatMap((author) =>
    LOCALES.map((locale) => ({
      url: urlFor(`/authors/${author.slug}`, locale),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  );

  return [
    ...translatedEntries(pages, (slug) => (slug === "home" ? "/" : `/${slug}`), "weekly", (slug) => (slug === "home" ? 1 : 0.7)),
    ...translatedEntries(projects, (slug) => `/projects/${slug}`, "monthly", () => 0.6),
    ...translatedEntries(posts, (slug) => `/blog/${slug}`, "monthly", () => 0.5),
    ...authorEntries,
    ...indexEntries("/projects", "weekly", 0.6),
    ...indexEntries("/blog", "weekly", 0.5),
  ];
}
