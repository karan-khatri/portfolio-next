import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prisma } from "@portfolio/db/server";
import { CreatePageForm } from "@/components/admin/create-page-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./page.module.scss";

export default async function AdminPagesListPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

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

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <PlusIcon className={styles.createIcon} />
          New page
        </summary>
        <div className={styles.createBody}>
          <CreatePageForm />
        </div>
      </details>
    </div>
  );
}
