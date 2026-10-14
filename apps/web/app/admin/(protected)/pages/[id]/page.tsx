import { notFound } from "next/navigation";
import { prisma, getLatestRevision, listRevisions } from "@portfolio/db/server";
import { pageRevisionDataSchema } from "@/lib/revision-data";
import { PageComposer, type ComposerSection } from "@/components/admin/composer/page-composer";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";
import type { RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import { EditorTranslationBar } from "@/components/admin/editor-translation-bar";

export default async function PageComposerRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } }, seo: { include: { ogImage: true } } },
  });
  if (!page) notFound();

  const latestDraft = await getLatestRevision("Page", id, "DRAFT");

  let initialTitle = page.title;
  let initialSections: ComposerSection[];

  if (latestDraft) {
    const data = pageRevisionDataSchema.parse(latestDraft.data);
    initialTitle = data.title;
    initialSections = data.sections.map((section, index) => ({
      clientId: `draft-${index}-${section.type}`,
      type: section.type,
      order: section.order,
      enabled: section.enabled,
      content: section.content as Record<string, unknown>,
    }));
  } else {
    initialSections = page.sections.map((section) => ({
      clientId: section.id,
      type: section.type,
      order: section.order,
      enabled: section.enabled,
      content: section.content as Record<string, unknown>,
    }));
  }

  const imageIds = new Set<string>();
  for (const section of initialSections) {
    const imageId = section.content.imageId;
    if (typeof imageId === "string" && imageId) imageIds.add(imageId);
  }
  const mediaRows =
    imageIds.size > 0 ? await prisma.media.findMany({ where: { id: { in: [...imageIds] } } }) : [];
  const initialResolvedMedia: Record<string, MediaPickerValue> = Object.fromEntries(
    mediaRows.map((media) => [media.id, toMediaPickerValue(media)]),
  );

  const revisionRows = await listRevisions("Page", id);
  const revisions: RevisionHistoryItem[] = revisionRows.map((revision) => ({
    id: revision.id,
    status: revision.status,
    createdAt: revision.createdAt,
    createdByEmail: revision.createdBy?.email ?? null,
  }));

  return (
    <PageComposer
      pageId={page.id}
      pageStatus={page.status}
      initialTitle={initialTitle}
      initialSections={initialSections}
      initialResolvedMedia={initialResolvedMedia}
      hasDraft={Boolean(latestDraft)}
      revisions={revisions}
      translationBar={
        <EditorTranslationBar
          entityType="Page"
          id={page.id}
          slug={page.slug}
          locale={page.locale}
          groupId={page.translationGroupId}
        />
      }
      seo={{
        metaTitle: page.seo?.metaTitle ?? null,
        metaDescription: page.seo?.metaDescription ?? null,
        canonicalUrl: page.seo?.canonicalUrl ?? null,
        ogImage: page.seo?.ogImage ? toMediaPickerValue(page.seo.ogImage) : null,
        structuredData: page.seo?.structuredData ?? null,
        noindex: page.seo?.noindex ?? false,
        nofollow: page.seo?.nofollow ?? false,
      }}
    />
  );
}
