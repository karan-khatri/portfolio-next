import { ArrowRightIcon, FolderGit2Icon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { SectionImage } from "./hero";

export interface ProjectCardItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: SectionImage | null;
  tags: string[];
  codeRepository: string | null;
  liveUrl: string | null;
}

export function ProjectCard({ project, delay = 0 }: { project: ProjectCardItem; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="glass-panel glow-primary group flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {project.coverImage ? (
            <img
              src={project.coverImage.url}
              alt={project.coverImage.altText ?? ""}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderGit2Icon className="size-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/95 to-transparent" />
          <h3 className="absolute inset-x-0 bottom-0 p-5 font-heading text-xl font-medium">
            <a href={`/projects/${project.slug}`} className="hover:underline">
              {project.title}
            </a>
          </h3>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {project.excerpt ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{project.excerpt}</p>
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
                className="group/link flex items-center gap-2 font-mono text-xs text-primary"
              >
                View Repo
                <ArrowRightIcon className="size-3.5 transition-transform group-hover/link:translate-x-1" />
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="group/link flex items-center gap-2 font-mono text-xs text-primary"
              >
                Live site
                <ArrowRightIcon className="size-3.5 transition-transform group-hover/link:translate-x-1" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
