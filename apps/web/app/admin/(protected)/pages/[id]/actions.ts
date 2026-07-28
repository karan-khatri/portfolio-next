"use server";

import { revalidatePath } from "next/cache";
import {
  prisma,
  saveDraft,
  publishRevision,
  unpublishEntity,
  createPreviewToken,
  type PageRevisionData,
  type PageSectionInput,
} from "@portfolio/db/server";
import { validateSectionContent, SectionValidationError } from "@portfolio/sections";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ComposerActionResult } from "@/lib/admin/action-result";

// The "home" page is served at "/" (app/page.tsx), not "/home" — every other
// standalone page is served at "/{slug}" via the app/[...slug] catch-all.
function pagePath(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}

function buildValidatedData(title: string, sections: PageSectionInput[]): PageRevisionData {
  return {
    title,
    sections: sections.map((section) => ({
      ...section,
      content: validateSectionContent(section.type, section.content),
    })),
  };
}

export async function saveDraftAction(
  pageId: string,
  title: string,
  sections: PageSectionInput[],
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = buildValidatedData(title, sections);
    const revision = await saveDraft({ entityType: "Page", entityId: pageId, data, userId: user.id });
    return { revisionId: revision.id };
  } catch (error) {
    if (error instanceof SectionValidationError) return { error: error.message };
    return { error: error instanceof Error ? error.message : "Could not save draft" };
  }
}

export async function publishAction(
  pageId: string,
  title: string,
  sections: PageSectionInput[],
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = buildValidatedData(title, sections);
    const revision = await saveDraft({ entityType: "Page", entityId: pageId, data, userId: user.id });
    await publishRevision({
      entityType: "Page",
      entityId: pageId,
      revisionId: revision.id,
      userId: user.id,
    });
    const page = await prisma.page.findUniqueOrThrow({
      where: { id: pageId },
      select: { slug: true },
    });
    revalidatePath("/");
    revalidatePath(pagePath(page.slug));
    return { revisionId: revision.id };
  } catch (error) {
    if (error instanceof SectionValidationError) return { error: error.message };
    return { error: error instanceof Error ? error.message : "Could not publish" };
  }
}

export async function unpublishAction(pageId: string): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    await unpublishEntity({ entityType: "Page", entityId: pageId, userId: user.id });
    const page = await prisma.page.findUniqueOrThrow({
      where: { id: pageId },
      select: { slug: true },
    });
    revalidatePath("/");
    revalidatePath(pagePath(page.slug));
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not unpublish" };
  }
}

export async function createPreviewAction(
  pageId: string,
  title: string,
  sections: PageSectionInput[],
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = buildValidatedData(title, sections);
    const revision = await saveDraft({ entityType: "Page", entityId: pageId, data, userId: user.id });
    const preview = await createPreviewToken({ revisionId: revision.id, userId: user.id });
    return { revisionId: revision.id, previewToken: preview.token };
  } catch (error) {
    if (error instanceof SectionValidationError) return { error: error.message };
    return { error: error instanceof Error ? error.message : "Could not create preview" };
  }
}
