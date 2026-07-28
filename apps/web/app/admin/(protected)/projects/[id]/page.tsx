import { notFound } from "next/navigation";
import { prisma, getLatestRevision, listRevisions, type FlatRevisionData } from "@portfolio/db/server";
import { ProjectEditor } from "@/components/admin/project-editor";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";
import type { RevisionHistoryItem } from "@/components/admin/revision-history-panel";

export default async function ProjectEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tags: true, seo: true, coverImage: true },
  });
  if (!project) notFound();

  const latestDraft = await getLatestRevision("Project", id, "DRAFT");

  let title = project.title;
  let excerpt = project.excerpt ?? "";
  let body = project.body ?? "";
  let tagNames = project.tags.map((tag) => tag.name);
  let coverImage: MediaPickerValue | null = project.coverImage
    ? toMediaPickerValue(project.coverImage)
    : null;
  let codeRepository = project.codeRepository ?? "";
  let liveUrl = project.liveUrl ?? "";

  if (latestDraft) {
    const data = latestDraft.data as unknown as FlatRevisionData;
    title = data.title;
    excerpt = data.excerpt ?? "";
    body = data.body ?? "";
    codeRepository = data.codeRepository ?? "";
    liveUrl = data.liveUrl ?? "";
    if (data.tagIds) {
      const draftTags = await prisma.tag.findMany({ where: { id: { in: data.tagIds } } });
      tagNames = draftTags.map((tag) => tag.name);
    }
    if (data.coverImageId !== undefined) {
      const media = data.coverImageId
        ? await prisma.media.findUnique({ where: { id: data.coverImageId } })
        : null;
      coverImage = media ? toMediaPickerValue(media) : null;
    }
  }

  const revisionRows = await listRevisions("Project", id);
  const revisions: RevisionHistoryItem[] = revisionRows.map((revision) => ({
    id: revision.id,
    status: revision.status,
    createdAt: revision.createdAt,
    createdByEmail: revision.createdBy?.email ?? null,
  }));

  return (
    <ProjectEditor
      projectId={project.id}
      projectStatus={project.status}
      hasDraft={Boolean(latestDraft)}
      revisions={revisions}
      initial={{
        title,
        excerpt,
        body,
        tags: tagNames,
        coverImage,
        codeRepository,
        liveUrl,
        featured: project.featured,
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
