import type { Metadata } from "next";
import { prisma } from "@portfolio/db/server";
import { SectionRenderer, getSectionNavItems } from "@/components/sections/section-renderer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const LOCALE = "en";

// Placeholder until Phase 4 wires real on-demand revalidation
// (revalidatePath/revalidateTag called from admin publish/unpublish server
// actions, per the SEO plan's rendering strategy). Without a caller to fire
// that yet, staying fully static would silently serve stale content after
// every publish — safer to render per-request until that lands, then swap
// this for ISR + tag-based revalidation.
export const revalidate = 0;

async function getHomePage() {
  return prisma.page.findFirst({
    where: { slug: "home", locale: LOCALE, status: "PUBLISHED" },
    include: { sections: true, seo: true },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
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

export default async function HomePage() {
  const page = await getHomePage();

  if (!page) {
    return (
      <div className="theme-site flex min-h-screen flex-col items-center justify-center bg-background p-8 text-foreground">
        <h1 className="text-xl font-semibold">No published home page yet</h1>
        <p className="mt-2 text-muted-foreground">
          Run the seed script, then publish a &quot;home&quot; page from admin.
        </p>
      </div>
    );
  }

  const configuredNav = await prisma.navigationItem.findMany({
    where: { locale: LOCALE, parentId: null },
    orderBy: { order: "asc" },
  });
  const navItems =
    configuredNav.length > 0
      ? configuredNav.map((item) => ({ id: item.id, label: item.label, href: item.href }))
      : getSectionNavItems(page.sections);

  return (
    <div id="top" className="theme-site min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <SiteHeader title={page.title} navItems={navItems} />
      <MotionProvider>
        <main id="main-content">
          <SectionRenderer sections={page.sections} locale={LOCALE} />
        </main>
      </MotionProvider>
      <SiteFooter title={page.title} />
    </div>
  );
}
