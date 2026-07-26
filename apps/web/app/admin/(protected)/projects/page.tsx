import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { CreateSlugContentForm } from "@/components/admin/create-slug-content-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { FeaturedProjectsPanel } from "@/components/admin/featured-projects-panel";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { Card, CardContent } from "@/components/ui/card";
import { createProjectAction } from "./actions";
import styles from "./page.module.scss";

const PAGE_SIZE = 20;

export default async function AdminProjectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = q?.trim() ?? "";

  const where = query ? { title: { contains: query, mode: "insensitive" as const } } : {};

  const [projects, total, featuredProjects] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count({ where }),
    prisma.project.findMany({
      where: { featured: true },
      orderBy: { featuredOrder: "asc" },
      select: { id: true, title: true, slug: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Projects</h1>
        <SearchInput basePath="/admin/projects" initialQuery={query} placeholder="Search projects…" />
      </div>

      <FeaturedProjectsPanel items={featuredProjects} />

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
            {projects.length === 0 ? (
              <li className={styles.empty}>
                {query ? "No projects match your search." : "No projects yet."}
              </li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/projects"
        query={{ q: query }}
      />

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <LuPlus className={styles.createIcon} />
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
