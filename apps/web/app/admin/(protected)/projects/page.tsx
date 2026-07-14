import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import { createProjectAction } from "./actions";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminProjectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Projects</h1>

      <Card>
        <CardContent className={styles.listContent}>
          <ul className={styles.list}>
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/admin/projects/${project.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.title}>{project.title}</span>
                    <span className={styles.meta}>
                      {project.slug}/{project.locale} · updated{" "}
                      <time dateTime={project.updatedAt.toISOString()}>
                        {formatRelativeTime(project.updatedAt)}
                      </time>
                    </span>
                  </span>
                  <StatusBadge status={project.status} />
                </Link>
              </li>
            ))}
            {projects.length === 0 ? <li className={styles.empty}>No projects yet.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/projects" />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <PlusIcon className={styles.createIcon} />
          New project
        </summary>
        <div className={styles.createBody}>
          <CreateSlugContentForm
            action={createProjectAction}
            submitLabel="Create project"
            slugPlaceholder="my-project"
          />
        </div>
      </details>
    </div>
  );
}
