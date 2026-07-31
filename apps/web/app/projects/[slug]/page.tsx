import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { prisma, Locale } from "@portfolio/db/server";
import { PublicShell } from "@/components/public-shell";
import { JsonLd } from "@/components/json-ld";
import { ProjectGallery } from "@/components/project-gallery";
import { getPublicNav } from "@/lib/public-nav";
import { findRedirect, redirectOrNotFound } from "@/lib/redirect-or-404";
import { ProseContent } from "@/components/prose-content";

const LOCALE: Locale = "en";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, locale: LOCALE, status: "PUBLISHED" },
    include: {
      coverImage: true,
      tags: { select: { name: true } },
      seo: { include: { ogImage: true } },
      images: { include: { media: true }, orderBy: { order: "asc" } },
    },
  });
}

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { locale: LOCALE, status: "PUBLISHED" },
    select: { slug: true },
  });
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const title = project.seo?.metaTitle ?? project.title;
  const description = project.seo?.metaDescription ?? project.excerpt ?? undefined;
  const image = project.seo?.ogImage?.url ?? project.coverImage?.url;
  const url = project.seo?.canonicalUrl ?? `${siteUrl}/projects/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: project.seo
      ? { index: !project.seo.noindex, follow: !project.seo.nofollow }
      : undefined,
    openGraph: { type: "article", url, title, description, images: image ? [{ url: image }] : undefined },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) redirectOrNotFound(await findRedirect(`/projects/${slug}`));

  const { navItems, settings } = await getPublicNav();
  const projectUrl = `${siteUrl}/projects/${project.slug}`;

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <JsonLd
        data={
          (project.seo?.structuredData as Record<string, unknown> | null) ?? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: project.title,
                description: project.excerpt ?? undefined,
                url: projectUrl,
                image: project.seo?.ogImage?.url ?? project.coverImage?.url,
                datePublished: (project.publishedAt ?? project.createdAt).toISOString(),
                dateModified: project.updatedAt.toISOString(),
                author: { "@type": "Person", name: settings.title },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                  { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
                  { "@type": "ListItem", position: 3, name: project.title, item: projectUrl },
                ],
              },
            ],
          }
        }
      />
      <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        {project.images.length > 0 ? (
          <div className="mt-8">
            <ProjectGallery
              images={project.images.map((entry) => ({
                url: entry.media.url,
                altText: entry.media.altText,
                width: entry.media.width,
                height: entry.media.height,
                blurDataUrl: entry.media.blurDataUrl,
              }))}
              fallbackAlt={project.title}
            />
          </div>
        ) : project.coverImage ? (
          <div className="glass-panel relative mt-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={project.coverImage.url}
              alt={project.coverImage.altText || project.title}
              fill
              sizes="(min-width: 640px) 48rem, 100vw"
              placeholder={project.coverImage.blurDataUrl ? "blur" : undefined}
              blurDataURL={project.coverImage.blurDataUrl ?? undefined}
              className="object-cover"
            />
          </div>
        ) : null}

        {/* eslint-disable-next-line react/jsx-no-comment-textnodes -- deliberate "styled like a comment" display text, not a real comment */}
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
