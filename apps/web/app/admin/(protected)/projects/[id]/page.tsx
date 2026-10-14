import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { prisma, getLatestRevision, listRevisions } from "@portfolio/db/server";
import { flatRevisionDataSchema } from "@/lib/revision-data";
import { ProjectEditor } from "@/components/admin/project-editor";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";
import type { GalleryImageEntry } from "@/components/admin/project-gallery-picker";
import type { RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import { EditorTranslationBar } from "@/components/admin/editor-translation-bar";

export default async function ProjectEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tags: true,
      seo: { include: { ogImage: true } },
      coverImage: true,
      images: { include: { media: true }, orderBy: { order: "asc" } },
    },
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
  let galleryImages: GalleryImageEntry[] = project.images.map((entry) => ({
    galleryKey: randomUUID(),
    media: toMediaPickerValue(entry.media),
  }));

  if (latestDraft) {
    const data = flatRevisionDataSchema.parse(latestDraft.data);
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
    if (data.galleryImageIds) {
      const draftMedia = await prisma.media.findMany({ where: { id: { in: data.galleryImageIds } } });
      const byId = new Map(draftMedia.map((media) => [media.id, media]));
      galleryImages = data.galleryImageIds
        .map((mediaId) => byId.get(mediaId))
        .filter((media): media is NonNullable<typeof media> => Boolean(media))
        .map((media) => ({ galleryKey: randomUUID(), media: toMediaPickerValue(media) }));
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
      translationBar={
        <EditorTranslationBar
          entityType="Project"
          id={project.id}
          slug={project.slug}
          locale={project.locale}
          groupId={project.translationGroupId}
        />
      }
      initial={{
        title,
        excerpt,
        body,
        tags: tagNames,
        coverImage,
        codeRepository,
        liveUrl,
        featured: project.featured,
        galleryImages,
      }}
      seo={{
        metaTitle: project.seo?.metaTitle ?? null,
        metaDescription: project.seo?.metaDescription ?? null,
        canonicalUrl: project.seo?.canonicalUrl ?? null,
        ogImage: project.seo?.ogImage ? toMediaPickerValue(project.seo.ogImage) : null,
        structuredData: project.seo?.structuredData ?? null,
        noindex: project.seo?.noindex ?? false,
        nofollow: project.seo?.nofollow ?? false,
      }}
    />
  );
}
