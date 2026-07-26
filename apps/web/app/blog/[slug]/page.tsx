import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { formatDate } from "@/lib/format-date";
import { ProseContent } from "@/components/prose-content";

const LOCALE = "en";

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, locale: LOCALE, status: "PUBLISHED" },
    include: {
      coverImage: true,
      author: true,
      tags: { select: { name: true } },
      seo: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt ?? undefined,
    alternates: post.seo?.canonicalUrl ? { canonical: post.seo.canonicalUrl } : undefined,
    robots: post.seo ? { index: !post.seo.noindex, follow: !post.seo.nofollow } : undefined,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { navItems, settings } = await getPublicNav();

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <a
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back home
        </a>

        {post.coverImage ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.altText ?? ""}
            className="glass-panel mt-8 aspect-video w-full rounded-xl object-cover"
          />
        ) : null}

        <h1 className="font-heading mt-8 text-4xl font-semibold tracking-tight">{post.title}</h1>

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {post.author ? (
            <>
              <a href={`/authors/${post.author.slug}`} className="text-primary hover:underline">
                {post.author.name}
              </a>{" "}
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
