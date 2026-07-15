"use server";

import { upsertSeo, type SeoEntityType, type SeoFields } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface SaveSeoResult {
  error?: string;
}

export async function saveSeoAction(
  entityType: SeoEntityType,
  entityId: string,
  fields: SeoFields,
): Promise<SaveSeoResult> {
  try {
    await requireEditor();
    await upsertSeo({ entityType, entityId, fields });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save SEO fields" };
  }
}
