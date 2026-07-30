import type { Metadata } from "next";
import { prisma, Locale, getSiteSettings } from "@portfolio/db/server";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";

const LOCALE: Locale = "en";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getStandalonePage(slug: string[]) {
  if (slug.length !== 1 || slug[0] === "home") return null;
  return prisma.page.findFirst({
    where: { slug: slug[0], locale: LOCALE, status: "PUBLISHED" },
    include: { sections: true, seo: { include: { ogImage: true } } },
  });
}

// Only the known, published standalone pages get prerendered — anything else
// (including Redirect-only paths, which aren't enumerable up front) still
// renders on demand, since dynamicParams defaults to true.
export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { locale: LOCALE, status: "PUBLISHED", slug: { not: "home" } },
    select: { slug: true },
  });
  return pages.map((page) => ({ slug: [page.slug] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getStandalonePage(slug), getSiteSettings()]);
  if (!page) return {};

  const title = page.seo?.metaTitle ?? page.title;
  const description = page.seo?.metaDescription ?? settings.description;
  const image = page.seo?.ogImage?.url;
  const url = page.seo?.canonicalUrl ?? `${siteUrl}/${slug.join("/")}`;

  return {
    title,
    description,
    alternates: page.seo?.canonicalUrl ? { canonical: page.seo.canonicalUrl } : undefined,
    robots: page.seo
      ? { index: !page.seo.noindex, follow: !page.seo.nofollow }
      : undefined,
    openGraph: { url, title, description, images: image ? [{ url: image }] : undefined },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const page = await getStandalonePage(slug);
  if (page) {
    const { navItems, settings } = await getPublicNav();
    return (
      <PublicShell
        title={settings.title}
        navItems={navItems}
        resumeUrl={settings.resumeUrl}
        githubUrl={settings.githubUrl}
        linkedinUrl={settings.linkedinUrl}
      >
        {page.seo?.structuredData ? (
          <JsonLd data={page.seo.structuredData as Record<string, unknown>} />
        ) : null}
        <SectionRenderer sections={page.sections} locale={LOCALE} />
      </PublicShell>
    );
  }

  const fromPath = `/${slug.join("/")}`;
  redirectOrNotFound(await findRedirect(fromPath));
}
