import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePreviewToken, type PageRevisionData } from "@portfolio/db/server";
import { SectionRenderer, getSectionNavItems } from "@/components/sections/section-renderer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Draft content must never be cached or crawled — every request re-resolves
// the token, and the noindex here backs up the robots.ts disallow (defense
// in depth: a disallow alone doesn't stop indexing of an already-shared URL).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await resolvePreviewToken(token);
  if (!preview || preview.entityType !== "Page") {
    notFound();
  }

  const data = preview.revision.data as unknown as PageRevisionData;
  const sections = data.sections.map((section, index) => ({
    id: `draft-${index}`,
    type: section.type,
    order: section.order,
    enabled: section.enabled,
    content: section.content,
  }));
  const navItems = getSectionNavItems(sections);

  return (
    <div id="top" className="theme-site min-h-screen bg-background text-foreground">
      <p
        role="status"
        className="bg-accent px-4 py-1.5 text-center font-mono text-xs tracking-wide text-accent-foreground uppercase"
      >
        Preview — not published
      </p>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <SiteHeader title={data.title} navItems={navItems} />
      <MotionProvider>
        <main id="main-content">
          <SectionRenderer sections={sections} locale="en" />
        </main>
      </MotionProvider>
      <SiteFooter title={data.title} />
    </div>
  );
}
