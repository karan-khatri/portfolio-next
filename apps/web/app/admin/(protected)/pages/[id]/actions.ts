"use server";

import { revalidatePath } from "next/cache";
import {
  saveDraft,
  publishRevision,
  unpublishEntity,
  createPreviewToken,
  type PageRevisionData,
  type PageSectionInput,
} from "@portfolio/db/server";
import { validateSectionContent, SectionValidationError } from "@portfolio/sections";
import { getCurrentUser } from "@/lib/auth/session";

export interface ComposerActionResult {
  error?: string;
  revisionId?: string;
  previewToken?: string;
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

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
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
    revalidatePath("/");
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
    revalidatePath("/");
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
    const preview = await createPreviewToken({
      entityType: "Page",
      entityId: pageId,
      revisionId: revision.id,
    });
    return { revisionId: revision.id, previewToken: preview.token };
  } catch (error) {
    if (error instanceof SectionValidationError) return { error: error.message };
    return { error: error instanceof Error ? error.message : "Could not create preview" };
  }
}
