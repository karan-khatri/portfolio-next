import type { Metadata } from "next";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { PostCard } from "@/components/sections/post-card";
import { EmptyState } from "@/components/sections/empty-state";
import { Pagination } from "@/components/pagination";

const LOCALE = "en";
const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Writing",
  description: "All published posts.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [posts, total, { navItems, settings }] = await Promise.all([
    prisma.post.findMany({
      where: { locale: LOCALE, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
    prisma.post.count({ where: { locale: LOCALE, status: "PUBLISHED" } }),
    getPublicNav(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes -- deliberate "styled like a comment" display text, not a real comment */}
        <span className="mb-4 block font-mono text-xs text-primary">// writing</span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          All posts
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Notes, write-ups, and things I&rsquo;ve learned along the way.
        </p>

        <div className="mt-14">
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

          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
        </div>
      </div>
    </PublicShell>
  );
}
