import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";
import { formatDate } from "@/lib/format-date";
import { ProseContent } from "@/components/prose-content";
import { DEFAULT_LOCALE, LOCALE_META, resolveAppLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";
import { alternateUrls } from "@/lib/i18n/alternates";
import { resolveLocalized } from "@/lib/i18n/content";
import { alternatePaths, findTranslationSlug } from "@/lib/i18n/translations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getPost(slug: string, locale: AppLocale) {
  return resolveLocalized(
    locale,
    (target) =>
      prisma.post.findFirst({
        where: { slug, locale: target, status: "PUBLISHED" },
        include: {
          coverImage: true,
          author: true,
          tags: { select: { name: true } },
          seo: { include: { ogImage: true } },
        },
      }),
    (groupId, target) => findTranslationSlug("post", groupId, target),
  );
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, locale: true },
  });
  return posts.map((post) => ({ locale: post.locale, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);
  const result = await getPost(slug, locale);
  if (result.kind !== "found") return {};

  const { row: post, isFallback } = result;
  const title = post.seo?.metaTitle ?? post.title;
  const description = post.seo?.metaDescription ?? post.excerpt ?? undefined;
  const image = post.seo?.ogImage?.url ?? post.coverImage?.url;
  const ownPath = localizePath(`/blog/${post.slug}`, isFallback ? DEFAULT_LOCALE : locale);
  const url = post.seo?.canonicalUrl ?? absoluteUrl(siteUrl, ownPath);
  const languages = alternateUrls(siteUrl, await alternatePaths("post", post.translationGroupId));

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    robots: post.seo ? { index: !post.seo.noindex, follow: !post.seo.nofollow } : undefined,
    openGraph: {
      type: "article",
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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);
  const result = await getPost(slug, locale);

  if (result.kind === "translated") redirect(localizePath(`/blog/${result.slug}`, locale));
  if (result.kind === "missing") {
    redirectOrNotFound(await findRedirect(localizePath(`/blog/${slug}`, locale)));
  }

  const { row: post, isFallback } = result;
  const t = getDictionary(locale);
  const [{ navItems, settings }, alternates] = await Promise.all([
    getPublicNav(locale),
    alternatePaths("post", post.translationGroupId),
  ]);
  const postUrl = absoluteUrl(siteUrl, localizePath(`/blog/${post.slug}`, isFallback ? DEFAULT_LOCALE : locale));

  return (
    <PublicShell
      locale={locale}
      path={`/blog/${post.slug}`}
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
          (post.seo?.structuredData as Record<string, unknown> | null) ?? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt ?? undefined,
                url: postUrl,
                inLanguage: LOCALE_META[post.locale].htmlLang,
                image: post.seo?.ogImage?.url ?? post.coverImage?.url,
                datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
                dateModified: post.updatedAt.toISOString(),
                author: { "@type": "Person", name: post.author?.name ?? settings.title },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: t.breadcrumb.home, item: absoluteUrl(siteUrl, localizePath("/", locale)) },
                  { "@type": "ListItem", position: 2, name: t.blog.metaTitle, item: absoluteUrl(siteUrl, localizePath("/blog", locale)) },
                  { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
                ],
              },
            ],
          }
        }
      />
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <Link
          href={localizePath("/", locale)}
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          {t.common.backHome}
        </Link>

        {post.coverImage ? (
          <div className="glass-panel relative mt-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.altText || post.title}
              fill
              sizes="(min-width: 640px) 48rem, 100vw"
              placeholder={post.coverImage.blurDataUrl ? "blur" : undefined}
              blurDataURL={post.coverImage.blurDataUrl ?? undefined}
              className="object-cover"
            />
          </div>
        ) : null}

        <h1 className="font-heading mt-8 text-4xl font-semibold tracking-tight">{post.title}</h1>

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {post.author ? (
            <>
              <Link
                href={localizePath(`/authors/${post.author.slug}`, locale)}
                className="text-primary hover:underline"
              >
                {post.author.name}
              </Link>{" "}
              ·{" "}
            </>
          ) : null}
          {post.publishedAt ? formatDate(post.publishedAt, locale) : formatDate(post.createdAt, locale)}
        </p>

        {post.excerpt ? <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p> : null}

        {post.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-xs text-primary"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {post.body ? (
          <div className="mt-10 border-t border-border pt-10">
            <ProseContent html={post.body} />
          </div>
        ) : null}
      </article>
    </PublicShell>
  );
}
