import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma, resolvePreviewToken } from "@portfolio/db/server";
import { flatRevisionDataSchema, pageRevisionDataSchema } from "@/lib/revision-data";
import { SectionRenderer, getSectionNavItems } from "@/components/sections/section-renderer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

async function entityLocale(entityType: string, entityId: string): Promise<AppLocale> {
  const select = { locale: true };
  const row =
    entityType === "Page"
      ? await prisma.page.findUnique({ where: { id: entityId }, select })
      : entityType === "Project"
        ? await prisma.project.findUnique({ where: { id: entityId }, select })
        : await prisma.post.findUnique({ where: { id: entityId }, select });
  return row?.locale ?? DEFAULT_LOCALE;
}

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

  const locale = await entityLocale(preview.revision.entityType, preview.revision.entityId);

  if (preview.revision.entityType === "Page") {
    const data = pageRevisionDataSchema.parse(preview.revision.data);
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
        <SiteHeader locale={locale} title={data.title} navItems={navItems} />
        <main id="main-content">
          <SectionRenderer sections={sections} locale={locale} />
        </main>
        <SiteFooter locale={locale} title={data.title} />
      </div>
    );
  }

  if (preview.revision.entityType === "Project" || preview.revision.entityType === "Post") {
    const data = flatRevisionDataSchema.parse(preview.revision.data);
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
        <SiteHeader locale={locale} title={data.title} navItems={[]} />
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
        <SiteFooter locale={locale} title={data.title} />
      </div>
    );
  }

  notFound();
}
