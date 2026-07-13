"use server";

import { revalidatePath } from "next/cache";
import { upsertSiteSettings, logAudit, type SiteSettingsValues } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface ActionResult {
  error?: string;
}

export async function saveSiteSettingsAction(values: SiteSettingsValues): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await upsertSiteSettings(values);
    await logAudit({ userId: user.id, action: "siteSettings.updated", entity: "SiteSetting", entityId: "site" });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save settings" };
  }
}
