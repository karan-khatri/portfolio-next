import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { prisma } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { ProseContent } from "@/components/prose-content";

const LOCALE = "en";

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, locale: LOCALE, status: "PUBLISHED" },
    include: {
      coverImage: true,
      tags: { select: { name: true } },
      seo: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: project.seo?.metaTitle ?? project.title,
    description: project.seo?.metaDescription ?? project.excerpt ?? undefined,
    alternates: project.seo?.canonicalUrl ? { canonical: project.seo.canonicalUrl } : undefined,
    robots: project.seo
      ? { index: !project.seo.noindex, follow: !project.seo.nofollow }
      : undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { navItems, settings } = await getPublicNav();

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <a
          href="/projects"
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </a>

        {project.coverImage ? (
          <img
            src={project.coverImage.url}
            alt={project.coverImage.altText ?? ""}
            className="glass-panel mt-8 aspect-video w-full rounded-xl object-cover"
          />
        ) : null}

        <span className="mt-8 block font-mono text-xs text-primary">// case study</span>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">
          {project.title}
        </h1>
        {project.excerpt ? (
          <p className="mt-4 text-lg text-muted-foreground">{project.excerpt}</p>
        ) : null}

        {project.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-full border border-border bg-white/5 px-3 py-1 font-mono text-xs text-primary"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {project.codeRepository || project.liveUrl ? (
          <div className="mt-6 flex gap-6">
            {project.codeRepository ? (
              <a
                href={project.codeRepository}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 font-mono text-xs text-primary"
              >
                View Repo
                <LuArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
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
                <LuArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            ) : null}
          </div>
        ) : null}

        {project.body ? (
          <div className="mt-10 border-t border-border pt-10">
            <ProseContent html={project.body} />
          </div>
        ) : null}
      </article>
    </PublicShell>
  );
}
