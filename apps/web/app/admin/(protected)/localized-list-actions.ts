"use server";

import { logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import {
  LOCALIZED_LISTS,
  isLocalizedListKey,
  saveGroup,
  validateGroupInput,
  type SaveGroupInput,
} from "@/lib/admin/localized-lists";

const ENTITY_NAMES: Record<string, string> = {
  experience: "Experience",
  education: "Education",
  skill: "Skill",
  language: "Language",
  service: "Service",
  testimonial: "Testimonial",
};

export async function saveLocalizedGroupAction(
  key: string,
  groupId: string | null,
  input: SaveGroupInput,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    if (!isLocalizedListKey(key)) return { error: "Unknown list" };

    const problem = validateGroupInput(key, input);
    if (problem) return { error: problem };

    const savedId = await saveGroup(key, groupId, input);
    await logAudit({
      userId: user.id,
      action: `${key}.${groupId ? "updated" : "created"}`,
      entity: ENTITY_NAMES[key],
      entityId: savedId,
    });
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteLocalizedGroupAction(key: string, groupId: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    if (!isLocalizedListKey(key)) return { error: "Unknown list" };

    await LOCALIZED_LISTS[key].removeGroup(groupId);
    await logAudit({ userId: user.id, action: `${key}.deleted`, entity: ENTITY_NAMES[key], entityId: groupId });
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderLocalizedGroupsAction(
  key: string,
  orderedGroupIds: string[],
): Promise<ActionResult> {
  try {
    await requireEditor();
    if (!isLocalizedListKey(key)) return { error: "Unknown list" };

    const definition = LOCALIZED_LISTS[key];
    for (const [index, groupId] of orderedGroupIds.entries()) {
      await definition.setOrder(groupId, index);
    }
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
