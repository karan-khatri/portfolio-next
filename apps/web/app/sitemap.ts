import type { MetadataRoute } from "next";
import { prisma } from "@portfolio/db/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Only published, indexable rows ever reach this list — draft/scheduled/
// archived content and anything under /admin is structurally excluded by
// this query, not filtered out after the fact.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects, posts, authors] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLISHED", OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, locale: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED", OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, locale: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, locale: true, updatedAt: true },
    }),
    prisma.author.findMany({ select: { slug: true } }),
  ]);

  const pageEntries = pages.map((page) => ({
    url: page.slug === "home" ? siteUrl : `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly" as const,
    priority: page.slug === "home" ? 1 : 0.7,
  }));

  const projectEntries = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const postEntries = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const authorEntries = authors.map((author) => ({
    url: `${siteUrl}/authors/${author.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  // Index/listing pages, not tied to any single row's updatedAt.
  const indexEntries = [
    { url: `${siteUrl}/projects`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.5 },
  ];

  return [...pageEntries, ...projectEntries, ...postEntries, ...authorEntries, ...indexEntries];
}
