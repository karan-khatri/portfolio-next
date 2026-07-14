import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { createPageAction } from "./actions";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminPagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.page.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Pages</h1>

      <Card>
        <CardContent className={styles.listContent}>
          <ul className={styles.list}>
            {pages.map((page) => (
              <li key={page.id}>
                <Link href={`/admin/pages/${page.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.title}>{page.title}</span>
                    <span className={styles.meta}>
                      {page.slug}/{page.locale} · updated{" "}
                      <time dateTime={page.updatedAt.toISOString()}>
                        {formatRelativeTime(page.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <StatusBadge status={page.status} />
                </Link>
              </li>
            ))}
            {pages.length === 0 ? <li className={styles.empty}>No pages yet.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/pages" />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <PlusIcon className={styles.createIcon} />
          New page
        </summary>
        <div className={styles.createBody}>
          <CreateSlugContentForm action={createPageAction} submitLabel="Create page" slugPlaceholder="home" />
        </div>
      </details>
    </div>
  );
}
