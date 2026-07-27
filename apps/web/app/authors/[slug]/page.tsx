import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuLink } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { PostCard } from "@/components/sections/post-card";
import { EmptyState } from "@/components/sections/empty-state";

const LOCALE = "en";

async function getAuthor(slug: string) {
  return prisma.author.findFirst({ where: { slug } });
}

export async function generateStaticParams() {
  const authors = await prisma.author.findMany({ select: { slug: true } });
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};

  return {
    title: author.name,
    description: author.bio ?? undefined,
  };
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) notFound();

  const [posts, { navItems, settings }] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: author.id, locale: LOCALE, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: {
          select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
        },
      },
    }),
    getPublicNav(),
  ]);

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="flex items-center gap-5">
          {author.imageUrl ? (
            // Author.imageUrl is a plain admin-pasted external URL (see authorFields in
            // simple-content-fields.ts), not routed through the Media upload pipeline, so
            // there's no fixed set of hosts to allowlist via next/image's remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.imageUrl}
              alt=""
              className="glass-panel size-20 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes -- deliberate "styled like a comment" display text, not a real comment */}
            <span className="mb-1 block font-mono text-xs text-primary">// author</span>
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
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Posts</h2>
        <div className="mt-10">
          {posts.length === 0 ? (
            <EmptyState message="No posts published yet." />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
