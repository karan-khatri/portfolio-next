import type { ProjectsContent } from "@portfolio/sections";
import { ArrowUpRightIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import type { SectionImage } from "./hero";

export interface ProjectListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: SectionImage | null;
}

export function ProjectsSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: ProjectsContent;
  headingLevel: 2 | 3;
  items: ProjectListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Projects"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No projects published yet." />
      ) : (
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          {items.map((project, index) => (
            <li key={project.id} className="bg-background">
              <Reveal delay={Math.min(index * 0.05, 0.3)} className="h-full">
                <a
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col p-6 sm:p-8"
                >
                  {project.coverImage ? (
                    <img
                      src={project.coverImage.url}
                      alt={project.coverImage.altText ?? ""}
                      className="mb-4 aspect-4/3 w-full rounded-md object-cover"
                    />
                  ) : null}
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 flex items-start justify-between gap-2 text-xl font-medium">
                    {project.title}
                    <ArrowUpRightIcon className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  {project.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {project.excerpt}
                    </p>
                  ) : null}
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
