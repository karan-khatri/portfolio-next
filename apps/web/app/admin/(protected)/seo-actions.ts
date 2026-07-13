"use server";

import { upsertSeo, type SeoEntityType, type SeoFields } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface SaveSeoResult {
  error?: string;
}

// Shared by every content editor (Page, Project, Post) that renders
// <SeoFieldsPanel> — SEO fields save immediately, independent of the
// draft/publish flow, so this lives outside any single route's actions.ts.
export async function saveSeoAction(
  entityType: SeoEntityType,
  entityId: string,
  fields: SeoFields,
): Promise<SaveSeoResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await upsertSeo({ entityType, entityId, fields });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save SEO fields" };
  }
}
