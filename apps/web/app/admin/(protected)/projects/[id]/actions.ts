"use server";

import { revalidatePath } from "next/cache";
import {
  prisma,
  saveDraft,
  publishRevision,
  unpublishEntity,
  createPreviewToken,
  resolveTagIds,
  type FlatRevisionData,
} from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface ComposerActionResult {
  error?: string;
  revisionId?: string;
  previewToken?: string;
}

export interface ProjectFormInput {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImageId: string | null;
  codeRepository: string;
  liveUrl: string;
  programmingLanguages: string[];
}

async function buildData(input: ProjectFormInput): Promise<FlatRevisionData> {
  const tagIds = await resolveTagIds(input.tags);
  return {
    title: input.title,
    excerpt: input.excerpt || null,
    body: input.body || null,
    tagIds,
    coverImageId: input.coverImageId,
    codeRepository: input.codeRepository || null,
    liveUrl: input.liveUrl || null,
    programmingLanguages: input.programmingLanguages,
  };
}

export async function saveDraftAction(
  projectId: string,
  input: ProjectFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({
      entityType: "Project",
      entityId: projectId,
      data,
      userId: user.id,
    });
    return { revisionId: revision.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save draft" };
  }
}

export async function publishAction(
  projectId: string,
  input: ProjectFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({
      entityType: "Project",
      entityId: projectId,
      data,
      userId: user.id,
    });
    await publishRevision({
      entityType: "Project",
      entityId: projectId,
      revisionId: revision.id,
      userId: user.id,
    });
    revalidatePath("/");
    return { revisionId: revision.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not publish" };
  }
}

export async function unpublishAction(projectId: string): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    await unpublishEntity({ entityType: "Project", entityId: projectId, userId: user.id });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not unpublish" };
  }
}

export async function toggleFeaturedAction(
  projectId: string,
  featured: boolean,
): Promise<{ error?: string }> {
  try {
    await requireEditor();
    if (featured) {
      const count = await prisma.project.count({ where: { featured: true } });
      await prisma.project.update({
        where: { id: projectId },
        data: { featured: true, featuredOrder: count },
      });
    } else {
      await prisma.project.update({
        where: { id: projectId },
        data: { featured: false, featuredOrder: null },
      });
    }
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update" };
  }
}

export async function createPreviewAction(
  projectId: string,
  input: ProjectFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({
      entityType: "Project",
      entityId: projectId,
      data,
      userId: user.id,
    });
    const preview = await createPreviewToken({
      entityType: "Project",
      entityId: projectId,
      revisionId: revision.id,
    });
    return { revisionId: revision.id, previewToken: preview.token };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create preview" };
  }
}
