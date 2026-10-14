"use server";

import { saveLocalizedSiteSettings, logAudit, type LocalizedSiteSettings } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/action-result";

export async function saveSiteSettingsAction(values: LocalizedSiteSettings): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await saveLocalizedSiteSettings(values);
    await logAudit({ userId: user.id, action: "siteSettings.updated", entity: "SiteSetting", entityId: "site" });
    revalidatePublicSite();
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save settings" };
  }
}
