import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma, getSiteSettings } from "@portfolio/db/server";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";
import { DEFAULT_LOCALE, LOCALE_META, resolveAppLocale, type AppLocale } from "@/lib/i18n/config";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";
import { alternateUrls } from "@/lib/i18n/alternates";
import { resolveLocalized } from "@/lib/i18n/content";
import { alternatePaths, findTranslationSlug } from "@/lib/i18n/translations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getStandalonePage(slug: string[], locale: AppLocale) {
  if (slug.length !== 1 || slug[0] === "home") return { kind: "missing" as const };
  return resolveLocalized(
    locale,
    (target) =>
      prisma.page.findFirst({
        where: { slug: slug[0], locale: target, status: "PUBLISHED" },
        include: { sections: true, seo: { include: { ogImage: true } } },
      }),
    (groupId, target) => findTranslationSlug("page", groupId, target),
  );
}

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", slug: { not: "home" } },
    select: { slug: true, locale: true },
  });
  return pages.map((page) => ({ locale: page.locale, slug: [page.slug] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);
  const [result, settings] = await Promise.all([getStandalonePage(slug, locale), getSiteSettings(locale)]);
  if (result.kind !== "found") return {};

  const { row: page, isFallback } = result;
  const title = page.seo?.metaTitle ?? page.title;
  const description = page.seo?.metaDescription ?? settings.description;
  const image = page.seo?.ogImage?.url;
  const ownPath = localizePath(`/${page.slug}`, isFallback ? DEFAULT_LOCALE : locale);
  const url = page.seo?.canonicalUrl ?? absoluteUrl(siteUrl, ownPath);
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

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);

  const result = await getStandalonePage(slug, locale);

  if (result.kind === "translated") {
    redirect(localizePath(`/${result.slug}`, locale));
  }

  if (result.kind === "found") {
    const { row: page, isFallback } = result;
    const [{ navItems, settings }, alternates] = await Promise.all([
      getPublicNav(locale),
      alternatePaths("page", page.translationGroupId),
    ]);
    return (
      <PublicShell
        locale={locale}
        path={`/${page.slug}`}
        alternates={alternates}
        isFallback={isFallback}
        title={settings.title}
        navItems={navItems}
        resumeUrl={settings.resumeUrl}
        githubUrl={settings.githubUrl}
        linkedinUrl={settings.linkedinUrl}
      >
        {page.seo?.structuredData ? (
          <JsonLd data={page.seo.structuredData as Record<string, unknown>} />
        ) : null}
        <SectionRenderer sections={page.sections} locale={locale} />
      </PublicShell>
    );
  }

  const fromPath = localizePath(`/${slug.join("/")}`, locale);
  redirectOrNotFound(await findRedirect(fromPath));
}
