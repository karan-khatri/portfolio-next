import type { Metadata } from "next";
import { LuLink } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";
import { PostCard } from "@/components/sections/post-card";
import { EmptyState } from "@/components/sections/empty-state";
import { LOCALES, LOCALE_META, resolveAppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";
import { alternateUrls, staticAlternates } from "@/lib/i18n/alternates";
import { localesToQuery, pickLocalized } from "@/lib/i18n/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getAuthor(slug: string) {
  return prisma.author.findFirst({ where: { slug } });
}

export async function generateStaticParams() {
  const authors = await prisma.author.findMany({ select: { slug: true } });
  return authors.flatMap((author) => LOCALES.map((locale) => ({ locale, slug: author.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);
  const author = await getAuthor(slug);
  if (!author) return {};

  const description = author.bio ?? undefined;
  const url = absoluteUrl(siteUrl, localizePath(`/authors/${author.slug}`, locale));

  return {
    title: author.name,
    description,
    alternates: { canonical: url, languages: alternateUrls(siteUrl, staticAlternates(`/authors/${author.slug}`)) },
    openGraph: {
      type: "profile",
      url,
      locale: LOCALE_META[locale].ogLocale,
      title: author.name,
      description,
      images: author.imageUrl ? [{ url: author.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title: author.name,
      description,
      images: author.imageUrl ? [author.imageUrl] : undefined,
    },
  };
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveAppLocale(rawLocale);
  const t = getDictionary(locale);
  const author = await getAuthor(slug);
  if (!author) redirectOrNotFound(await findRedirect(localizePath(`/authors/${slug}`, locale)));

  const [postRows, { navItems, settings }] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: author.id, locale: { in: localesToQuery(locale) }, status: "PUBLISHED" },
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
  const posts = pickLocalized(postRows, locale);

  return (
    <PublicShell
      locale={locale}
      path={`/authors/${author.slug}`}
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          description: author.bio ?? undefined,
          image: author.imageUrl ?? undefined,
          url: absoluteUrl(siteUrl, localizePath(`/authors/${author.slug}`, locale)),
          ...(author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
        }}
      />
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="flex items-center gap-5">
          {author.imageUrl ? (
            // Author.imageUrl is a plain admin-pasted external URL (see authorFields in
            // simple-content-fields.ts), not routed through the Media upload pipeline, so
            // there's no fixed set of hosts to allowlist via next/image's remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.imageUrl}
              alt={author.name}
              className="glass-panel size-20 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div>
            <span className="mb-1 block font-mono text-xs text-primary">{`// ${t.eyebrow.author.toLowerCase()}`}</span>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">{author.name}</h1>
          </div>
        </div>

        {author.bio ? (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{author.bio}</p>
        ) : null}

        {author.sameAs.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-4">
            {author.sameAs.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
              >
                <LuLink className="size-3.5" />
                {url.replace(/^https?:\/\//, "")}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-7xl border-t border-border px-6 py-16 sm:px-8 lg:px-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{t.blog.posts}</h2>
        <div className="mt-10">
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
        </div>
      </div>
    </PublicShell>
  );
}
