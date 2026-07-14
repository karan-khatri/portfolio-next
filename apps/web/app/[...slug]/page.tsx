import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { prisma } from "@portfolio/db/server";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";

const LOCALE = "en";

// "home" is reserved for `/` (app/page.tsx) — a Page with that slug is never
// rendered again at /home, matching sitemap.ts's own special-casing of it.
async function getStandalonePage(slug: string[]) {
  if (slug.length !== 1 || slug[0] === "home") return null;
  return prisma.page.findFirst({
    where: { slug: slug[0], locale: LOCALE, status: "PUBLISHED" },
    include: { sections: true, seo: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStandalonePage(slug);
  if (!page) return {};

  return {
    title: page.seo?.metaTitle ?? page.title,
    description: page.seo?.metaDescription ?? undefined,
    alternates: page.seo?.canonicalUrl ? { canonical: page.seo.canonicalUrl } : undefined,
    robots: page.seo
      ? { index: !page.seo.noindex, follow: !page.seo.nofollow }
      : undefined,
  };
}

// Only reached for paths that don't match any more-specific route (admin/,
// api/, preview/, projects/, blog/, and / all take priority automatically).
// Node runtime, so it can query Postgres directly — unlike proxy.ts, which
// is edge-only.
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
        <SectionRenderer sections={page.sections} locale={LOCALE} />
      </PublicShell>
    );
  }

  const fromPath = `/${slug.join("/")}`;
  const match = await prisma.redirect.findUnique({ where: { fromPath } });
  if (!match) notFound();

  if (match.statusCode === 308) {
    permanentRedirect(match.toPath);
  } else {
    redirect(match.toPath);
  }
}
