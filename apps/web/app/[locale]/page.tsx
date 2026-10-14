import type { Metadata } from "next";
import { prisma, getSiteSettings } from "@portfolio/db/server";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, resolveAppLocale, type AppLocale } from "@/lib/i18n/config";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";
import { alternateUrls } from "@/lib/i18n/alternates";
import { alternatePaths } from "@/lib/i18n/translations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getHomePage(locale: AppLocale) {
  const load = (target: AppLocale) =>
    prisma.page.findFirst({
      where: { slug: "home", locale: target, status: "PUBLISHED" },
      include: { sections: true, seo: { include: { ogImage: true } } },
    });

  const exact = await load(locale);
  if (exact || locale === DEFAULT_LOCALE) return { page: exact, isFallback: false };

  const fallback = await load(DEFAULT_LOCALE);
  return { page: fallback, isFallback: fallback !== null };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveAppLocale((await params).locale);
  const [{ page, isFallback }, settings] = await Promise.all([getHomePage(locale), getSiteSettings(locale)]);
  if (!page) return {};

  const title = page.seo?.metaTitle ?? page.title;
  const description = page.seo?.metaDescription ?? settings.description;
  const image = page.seo?.ogImage?.url;
  const ownUrl = absoluteUrl(siteUrl, localizePath("/", isFallback ? DEFAULT_LOCALE : locale));
  const url = page.seo?.canonicalUrl ?? ownUrl;
  const languages = alternateUrls(siteUrl, await alternatePaths("page", page.translationGroupId));

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    robots: page.seo
      ? { index: !page.seo.noindex, follow: !page.seo.nofollow }
      : undefined,
    openGraph: {
      url,
      title,
      description,
      locale: LOCALE_META[locale].ogLocale,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveAppLocale((await params).locale);
  const { page, isFallback } = await getHomePage(locale);

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

  const [{ navItems, settings }, alternates] = await Promise.all([
    getPublicNav(locale),
    alternatePaths("page", page.translationGroupId),
  ]);

  const homeUrl = absoluteUrl(siteUrl, localizePath("/", locale));
  const sameAs = [settings.githubUrl, settings.linkedinUrl, settings.upworkUrl, settings.fiverrUrl, settings.instagramUrl].filter(
    (url): url is string => Boolean(url),
  );

  return (
    <PublicShell
      locale={locale}
      path="/"
      alternates={alternates}
      isFallback={isFallback}
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <JsonLd
        data={
          (page.seo?.structuredData as Record<string, unknown> | null) ?? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                name: settings.title,
                url: homeUrl,
                description: settings.description,
                inLanguage: LOCALE_META[locale].htmlLang,
              },
              {
                "@type": "Person",
                name: settings.title,
                url: homeUrl,
                description: settings.description,
                ...(sameAs.length > 0 ? { sameAs } : {}),
              },
            ],
          }
        }
      />
      <SectionRenderer sections={page.sections} locale={locale} />
    </PublicShell>
  );
}
