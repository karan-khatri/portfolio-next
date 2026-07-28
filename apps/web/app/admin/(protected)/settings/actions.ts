"use server";

import { revalidatePath } from "next/cache";
import { upsertSiteSettings, logAudit, type SiteSettingsValues } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function saveSiteSettingsAction(values: SiteSettingsValues): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await upsertSiteSettings(values);
    await logAudit({ userId: user.id, action: "siteSettings.updated", entity: "SiteSetting", entityId: "site" });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save settings" };
  }
}
