import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { TranslationChips } from "@/components/admin/translation-chips";
import type { AppLocale } from "@/lib/i18n/config";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import { createPostAction } from "./actions";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminPostsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = q?.trim() ?? "";

  const where = query ? { title: { contains: query, mode: "insensitive" as const } } : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const siblingRows = await prisma.post.findMany({
    where: { translationGroupId: { in: posts.map((row) => row.translationGroupId) } },
    select: { translationGroupId: true, locale: true },
  });
  const presentByGroup = new Map<string, AppLocale[]>();
  for (const sibling of siblingRows) {
    presentByGroup.set(sibling.translationGroupId, [
      ...(presentByGroup.get(sibling.translationGroupId) ?? []),
      sibling.locale,
    ]);
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Posts</h1>
        <SearchInput basePath="/admin/posts" initialQuery={query} placeholder="Search posts…" />
      </div>

      <Card>
        <CardContent className={styles.listContent}>
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${post.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.title}>{post.title}</span>
                    <span className={styles.meta}>
                      {post.slug} · updated{" "}
                      <time dateTime={post.updatedAt.toISOString()}>
                        {formatRelativeTime(post.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <span className={styles.rowBadges}>
                    <TranslationChips
                      present={presentByGroup.get(post.translationGroupId) ?? [post.locale]}
                      current={post.locale}
                    />
                    <StatusBadge status={post.status} />
                  </span>
                </Link>
              </li>
            ))}
            {posts.length === 0 ? (
              <li className={styles.empty}>{query ? "No posts match your search." : "No posts yet."}</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/posts"
        query={{ q: query }}
        variant="admin"
      />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <LuPlus className={styles.createIcon} />
          New post
        </summary>
        <div className={styles.createBody}>
          <CreateSlugContentForm
            action={createPostAction}
            submitLabel="Create post"
            slugPlaceholder="my-post"
          />
        </div>
      </details>
    </div>
  );
}
