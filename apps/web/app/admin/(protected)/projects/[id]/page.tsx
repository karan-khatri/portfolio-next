import { notFound } from "next/navigation";
import { prisma, getLatestRevision, type FlatRevisionData } from "@portfolio/db/server";
import { ProjectEditor } from "@/components/admin/project-editor";

export default async function ProjectEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tags: true, seo: true },
  });
  if (!project) notFound();

  const latestDraft = await getLatestRevision("Project", id, "DRAFT");

  let title = project.title;
  let excerpt = project.excerpt ?? "";
  let body = project.body ?? "";
  let tagNames = project.tags.map((tag) => tag.name);
  let codeRepository = project.codeRepository ?? "";
  let liveUrl = project.liveUrl ?? "";
  let programmingLanguages = project.programmingLanguages;

  if (latestDraft) {
    const data = latestDraft.data as unknown as FlatRevisionData;
    title = data.title;
    excerpt = data.excerpt ?? "";
    body = data.body ?? "";
    codeRepository = data.codeRepository ?? "";
    liveUrl = data.liveUrl ?? "";
    programmingLanguages = data.programmingLanguages ?? [];
    if (data.tagIds) {
      const draftTags = await prisma.tag.findMany({ where: { id: { in: data.tagIds } } });
      tagNames = draftTags.map((tag) => tag.name);
    }
  }

  return (
    <ProjectEditor
      projectId={project.id}
      projectStatus={project.status}
      hasDraft={Boolean(latestDraft)}
      initial={{
        title,
        excerpt,
        body,
        tags: tagNames,
        codeRepository,
        liveUrl,
        programmingLanguages,
      }}
      seo={{
        metaTitle: project.seo?.metaTitle ?? null,
        metaDescription: project.seo?.metaDescription ?? null,
        canonicalUrl: project.seo?.canonicalUrl ?? null,
        noindex: project.seo?.noindex ?? false,
        nofollow: project.seo?.nofollow ?? false,
      }}
    />
  );
}
