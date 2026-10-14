import type { Metadata } from "next";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { PostCard } from "@/components/sections/post-card";
import { EmptyState } from "@/components/sections/empty-state";
import { Pagination } from "@/components/pagination";
import { LOCALE_META, resolveAppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";
import { alternateUrls, staticAlternates } from "@/lib/i18n/alternates";
import { localesToQuery, pickLocalized } from "@/lib/i18n/content";

const PAGE_SIZE = 9;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const locale = resolveAppLocale((await params).locale);
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const base = absoluteUrl(siteUrl, localizePath("/blog", locale));
  const canonical = currentPage > 1 ? `${base}?page=${currentPage}` : base;
  const t = getDictionary(locale);
  const title = t.blog.metaTitle;
  const description = t.blog.metaDescription;

  return {
    title,
    description,
    alternates: { canonical, languages: alternateUrls(siteUrl, staticAlternates("/blog")) },
    openGraph: { url: canonical, title, description, locale: LOCALE_META[locale].ogLocale },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = resolveAppLocale((await params).locale);
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const t = getDictionary(locale);

  const [rows, { navItems, settings }] = await Promise.all([
    prisma.post.findMany({
      where: { locale: { in: localesToQuery(locale) }, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        locale: true,
        translationGroupId: true,
        publishedAt: true,
        coverImage: {
          select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
        },
      },
    }),
    getPublicNav(locale),
  ]);

  const localized = pickLocalized(rows, locale);
  const posts = localized.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(localized.length / PAGE_SIZE));

  return (
    <PublicShell
      locale={locale}
      path="/blog"
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <span className="mb-4 block font-mono text-xs text-primary">{`// ${t.eyebrow.writing.toLowerCase()}`}</span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.blog.allPosts}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t.blog.allPostsIntro}
        </p>

        <div className="mt-14">
          {posts.length === 0 ? (
            <EmptyState message={t.empty.posts} />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard locale={locale} post={post} />
                </li>
              ))}
            </ul>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" locale={locale} />
        </div>
      </div>
    </PublicShell>
  );
}
