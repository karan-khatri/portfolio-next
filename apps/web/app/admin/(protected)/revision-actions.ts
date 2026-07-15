"use server";

import { restoreRevision, type EntityType } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface RestoreRevisionResult {
  error?: string;
}

export async function restoreRevisionAction(
  entityType: EntityType,
  entityId: string,
  revisionId: string,
): Promise<RestoreRevisionResult> {
  try {
    const user = await requireEditor();
    await restoreRevision({ entityType, entityId, revisionId, userId: user.id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not restore revision" };
  }
}
