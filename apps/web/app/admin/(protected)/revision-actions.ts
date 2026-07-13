"use server";

import { restoreRevision, type EntityType } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface RestoreRevisionResult {
  error?: string;
}

// Shared by every content editor (Page, Project, Post) that renders
// <RevisionHistoryPanel> — restoring just creates a new DRAFT revision from
// an old one, so this lives outside any single route's actions.ts, same as
// saveSeoAction.
export async function restoreRevisionAction(
  entityType: EntityType,
  entityId: string,
  revisionId: string,
): Promise<RestoreRevisionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await restoreRevision({ entityType, entityId, revisionId, userId: user.id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not restore revision" };
  }
}
