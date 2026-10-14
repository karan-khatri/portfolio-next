import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { TranslationChips } from "@/components/admin/translation-chips";
import type { AppLocale } from "@/lib/i18n/config";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { createPageAction } from "./actions";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminPagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = q?.trim() ?? "";

  const where = query ? { title: { contains: query, mode: "insensitive" as const } } : {};

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.page.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const siblingRows = await prisma.page.findMany({
    where: { translationGroupId: { in: pages.map((row) => row.translationGroupId) } },
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
        <h1 className={styles.heading}>Pages</h1>
        <SearchInput basePath="/admin/pages" initialQuery={query} placeholder="Search pages…" />
      </div>

      <Card>
        <CardContent className={styles.listContent}>
          <ul className={styles.list}>
            {pages.map((page) => (
              <li key={page.id}>
                <Link href={`/admin/pages/${page.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.title}>{page.title}</span>
                    <span className={styles.meta}>
                      {page.slug} · updated{" "}
                      <time dateTime={page.updatedAt.toISOString()}>
                        {formatRelativeTime(page.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <span className={styles.rowBadges}>
                    <TranslationChips
                      present={presentByGroup.get(page.translationGroupId) ?? [page.locale]}
                      current={page.locale}
                    />
                    <StatusBadge status={page.status} />
                  </span>
                </Link>
              </li>
            ))}
            {pages.length === 0 ? (
              <li className={styles.empty}>{query ? "No pages match your search." : "No pages yet."}</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/pages"
        query={{ q: query }}
        variant="admin"
      />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <LuPlus className={styles.createIcon} />
          New page
        </summary>
        <div className={styles.createBody}>
          <CreateSlugContentForm action={createPageAction} submitLabel="Create page" slugPlaceholder="home" />
        </div>
      </details>
    </div>
  );
}
