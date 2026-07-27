import type { Metadata } from "next";
import { prisma } from "@portfolio/db/server";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";

const LOCALE = "en";

async function getHomePage() {
  return prisma.page.findFirst({
    where: { slug: "home", locale: LOCALE, status: "PUBLISHED" },
    include: { sections: true, seo: { include: { ogImage: true } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  if (!page) return {};

  const title = page.seo?.metaTitle ?? page.title;
  const description = page.seo?.metaDescription ?? undefined;
  const image = page.seo?.ogImage?.url;

  return {
    title,
    description,
    alternates: page.seo?.canonicalUrl ? { canonical: page.seo.canonicalUrl } : undefined,
    robots: page.seo
      ? { index: !page.seo.noindex, follow: !page.seo.nofollow }
      : undefined,
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
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
