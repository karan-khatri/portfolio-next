import Image from "next/image";
import Link from "next/link";
import { LuExternalLink, LuFolderGit2 } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
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

export function ProjectCard({ project }: { project: ProjectCardItem }) {
  const hasLinks = Boolean(project.codeRepository || project.liveUrl);

  return (
      <div className="glass-panel glow-primary group relative flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300">
        {/* Stretched-link overlay: makes the whole card navigate to the project,
            while the icon links below sit above it (relative + higher z-index)
            so they keep working as independent, separately-clickable targets. */}
        <Link
          href={`/projects/${project.slug}`}
          className="absolute inset-0 z-10"
          aria-label={project.title}
        />

        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {project.coverImage ? (
            <Image
              src={project.coverImage.url}
              alt={project.coverImage.altText ?? ""}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              placeholder={project.coverImage.blurDataUrl ? "blur" : undefined}
              blurDataURL={project.coverImage.blurDataUrl ?? undefined}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LuFolderGit2 className="size-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/95 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5">
            <h3
              className="min-w-0 flex-1 truncate font-heading text-xl font-medium group-hover:underline"
              title={project.title}
            >
              {project.title}
            </h3>
            {hasLinks ? (
              <div className="relative z-20 flex shrink-0 items-center gap-1">
                {project.codeRepository ? (
                  <a
                    href={project.codeRepository}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View source repository"
                    title="View source repository"
                    className="flex size-8 items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-white/10 hover:text-primary"
                  >
                    <FaGithub className="size-4" />
                  </a>
                ) : null}
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View live site"
                    title="View live site"
                    className="flex size-8 items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-white/10 hover:text-primary"
                  >
                    <LuExternalLink className="size-4" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
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
        </div>
      </div>
  );
}
