import { notFound } from "next/navigation";
import { prisma, getLatestRevision, type PageRevisionData } from "@portfolio/db/server";
import { PageComposer, type ComposerSection } from "@/components/admin/composer/page-composer";

export default async function PageComposerRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page) notFound();

  const latestDraft = await getLatestRevision("Page", id, "DRAFT");

  let initialTitle = page.title;
  let initialSections: ComposerSection[];

  if (latestDraft) {
    const data = latestDraft.data as unknown as PageRevisionData;
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

  return (
    <PageComposer
      pageId={page.id}
      pageStatus={page.status}
      initialTitle={initialTitle}
      initialSections={initialSections}
      hasDraft={Boolean(latestDraft)}
    />
  );
}
