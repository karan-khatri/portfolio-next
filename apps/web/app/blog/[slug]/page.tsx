import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { prisma, Locale } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";
import { formatDate } from "@/lib/format-date";
import { ProseContent } from "@/components/prose-content";

const LOCALE: Locale = "en";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, locale: LOCALE, status: "PUBLISHED" },
    include: {
      coverImage: true,
      author: true,
      tags: { select: { name: true } },
      seo: { include: { ogImage: true } },
    },
  });
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { locale: LOCALE, status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.seo?.metaTitle ?? post.title;
  const description = post.seo?.metaDescription ?? post.excerpt ?? undefined;
  const image = post.seo?.ogImage?.url ?? post.coverImage?.url;
  const url = post.seo?.canonicalUrl ?? `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: post.seo?.canonicalUrl ? { canonical: post.seo.canonicalUrl } : undefined,
    robots: post.seo ? { index: !post.seo.noindex, follow: !post.seo.nofollow } : undefined,
    openGraph: { type: "article", url, title, description, images: image ? [{ url: image }] : undefined },
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) redirectOrNotFound(await findRedirect(`/blog/${slug}`));

  const { navItems, settings } = await getPublicNav();
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt ?? undefined,
              url: postUrl,
              image: post.coverImage?.url,
              datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
              dateModified: post.updatedAt.toISOString(),
              author: { "@type": "Person", name: post.author?.name ?? settings.title },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Writing", item: `${siteUrl}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
              ],
            },
          ],
        }}
      />
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back home
        </Link>

        {post.coverImage ? (
          <div className="glass-panel relative mt-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.altText ?? ""}
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
              <Link href={`/authors/${post.author.slug}`} className="text-primary hover:underline">
                {post.author.name}
              </Link>{" "}
              ·{" "}
            </>
          ) : null}
          {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
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
