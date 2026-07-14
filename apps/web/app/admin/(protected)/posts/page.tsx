import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import { createPostAction } from "./actions";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminPostsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Posts</h1>

      <Card>
        <CardContent className={styles.listContent}>
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${post.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.title}>{post.title}</span>
                    <span className={styles.meta}>
                      {post.slug}/{post.locale} · updated{" "}
                      <time dateTime={post.updatedAt.toISOString()}>
                        {formatRelativeTime(post.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <StatusBadge status={post.status} />
                </Link>
              </li>
            ))}
            {posts.length === 0 ? <li className={styles.empty}>No posts yet.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/posts" />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <PlusIcon className={styles.createIcon} />
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
