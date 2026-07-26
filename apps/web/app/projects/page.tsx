import type { Metadata } from "next";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { ProjectCard } from "@/components/sections/project-card";
import { EmptyState } from "@/components/sections/empty-state";
import { Pagination } from "@/components/pagination";

const LOCALE = "en";
const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Projects",
  description: "All published projects.",
};

export default async function ProjectsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [projects, total, { navItems, settings }] = await Promise.all([
    prisma.project.findMany({
      where: { locale: LOCALE, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        codeRepository: true,
        liveUrl: true,
        coverImage: {
          select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
        },
        tags: { select: { name: true } },
      },
    }),
    prisma.project.count({ where: { locale: LOCALE, status: "PUBLISHED" } }),
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
        <span className="mb-4 block font-mono text-xs text-primary">// projects</span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          All projects
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Everything I&rsquo;ve shipped and written up, in one place.
        </p>

        <div className="mt-14">
          {projects.length === 0 ? (
            <EmptyState message="No projects published yet." />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <ProjectCard
                    project={{ ...project, tags: project.tags.map((tag) => tag.name) }}
                  />
                </li>
              ))}
            </ul>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/projects" />
        </div>
      </div>
    </PublicShell>
  );
}
