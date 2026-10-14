"use server";

import { revalidatePath } from "next/cache";
import type { EntityType } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import { createTranslation } from "@/lib/admin/translations";

export interface CreateTranslationResult {
  id?: string;
  error?: string;
}

const LIST_PATHS: Record<EntityType, string> = {
  Page: "/admin/pages",
  Project: "/admin/projects",
  Post: "/admin/posts",
};

export async function createTranslationAction(input: {
  entityType: EntityType;
  sourceId: string;
  locale: string;
  slug: string;
}): Promise<CreateTranslationResult> {
  try {
    const user = await requireEditor();
    const { id } = await createTranslation({ ...input, userId: user.id });
    revalidatePath(LIST_PATHS[input.entityType]);
    return { id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the translation" };
  }
}
