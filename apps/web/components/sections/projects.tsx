import type { ProjectsContent } from "@portfolio/sections";
import { ArrowRightIcon } from "lucide-react";
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
  tags: string[];
  codeRepository: string | null;
  liveUrl: string | null;
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
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((project, index) => (
            <li key={project.id}>
              <Reveal delay={Math.min(index * 0.05, 0.3)} className="h-full">
                <div className="glass-panel glow-primary flex h-full flex-col rounded-xl p-6 transition-all duration-300 sm:p-8">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage.url}
                      alt={project.coverImage.altText ?? ""}
                      className="mb-4 aspect-4/3 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <h3 className="font-heading text-xl font-medium">
                    <a href={`/projects/${project.slug}`} className="hover:underline">
                      {project.title}
                    </a>
                  </h3>
                  {project.excerpt ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {project.excerpt}
                    </p>
                  ) : null}
                  {project.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex gap-4 pt-6">
                    {project.codeRepository ? (
                      <a
                        href={project.codeRepository}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 font-mono text-xs text-primary"
                      >
                        View Repo
                        <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : null}
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 font-mono text-xs text-primary"
                      >
                        Live site
                        <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
