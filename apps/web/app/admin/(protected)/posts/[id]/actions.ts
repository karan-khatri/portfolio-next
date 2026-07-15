"use server";

import { revalidatePath } from "next/cache";
import {
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

export interface PostFormInput {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImageId: string | null;
  authorId: string | null;
}

async function buildData(input: PostFormInput): Promise<FlatRevisionData> {
  const tagIds = await resolveTagIds(input.tags);
  return {
    title: input.title,
    excerpt: input.excerpt || null,
    body: input.body || null,
    tagIds,
    coverImageId: input.coverImageId,
    authorId: input.authorId,
  };
}

export async function saveDraftAction(
  postId: string,
  input: PostFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({ entityType: "Post", entityId: postId, data, userId: user.id });
    return { revisionId: revision.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save draft" };
  }
}

export async function publishAction(
  postId: string,
  input: PostFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({ entityType: "Post", entityId: postId, data, userId: user.id });
    await publishRevision({
      entityType: "Post",
      entityId: postId,
      revisionId: revision.id,
      userId: user.id,
    });
    revalidatePath("/");
    return { revisionId: revision.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not publish" };
  }
}

export async function unpublishAction(postId: string): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    await unpublishEntity({ entityType: "Post", entityId: postId, userId: user.id });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not unpublish" };
  }
}

export async function createPreviewAction(
  postId: string,
  input: PostFormInput,
): Promise<ComposerActionResult> {
  try {
    const user = await requireEditor();
    const data = await buildData(input);
    const revision = await saveDraft({ entityType: "Post", entityId: postId, data, userId: user.id });
    const preview = await createPreviewToken({
      entityType: "Post",
      entityId: postId,
      revisionId: revision.id,
    });
    return { revisionId: revision.id, previewToken: preview.token };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create preview" };
  }
}
