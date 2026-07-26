import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  resolvePreviewToken,
  type PageRevisionData,
  type FlatRevisionData,
} from "@portfolio/db/server";
import { SectionRenderer, getSectionNavItems } from "@/components/sections/section-renderer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

function PreviewChrome({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="bg-accent px-4 py-1.5 text-center font-mono text-xs tracking-wide text-accent-foreground uppercase"
    >
      {children}
    </p>
  );
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await resolvePreviewToken(token);
  if (!preview) {
    notFound();
  }

  if (preview.revision.entityType === "Page") {
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
        <PreviewChrome>Preview — not published</PreviewChrome>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteHeader title={data.title} navItems={navItems} />
        <main id="main-content">
          <SectionRenderer sections={sections} locale="en" />
        </main>
        <SiteFooter title={data.title} />
      </div>
    );
  }

  if (preview.revision.entityType === "Project" || preview.revision.entityType === "Post") {
    const data = preview.revision.data as unknown as FlatRevisionData;
    const paragraphs = (data.body ?? "").split(/\n{2,}/).filter(Boolean);

    return (
      <div id="top" className="theme-site min-h-screen bg-background text-foreground">
        <PreviewChrome>Preview — not published</PreviewChrome>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteHeader title={data.title} navItems={[]} />
        <main id="main-content">
          <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
            <h1 className="text-4xl font-semibold tracking-tight">{data.title}</h1>
            {data.excerpt ? (
              <p className="mt-4 text-lg text-muted-foreground">{data.excerpt}</p>
            ) : null}
            {paragraphs.length > 0 ? (
              <div className="mt-8 space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-lg leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        </main>
        <SiteFooter title={data.title} />
      </div>
    );
  }

  notFound();
}
