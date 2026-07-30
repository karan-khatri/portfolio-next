"use server";

import { revalidatePath } from "next/cache";
import { applySeedPayload, logAudit, type SeedApplyResult } from "@portfolio/db/server";
import { requireAdminRole } from "@/lib/auth/require-admin";
import { seedPayloadSchema } from "@/lib/admin/seed-schema";
import type { ActionResult } from "@/lib/admin/action-result";

const MAX_BYTES = 2 * 1024 * 1024;

export interface SeedUploadResult extends ActionResult {
  summary?: SeedApplyResult;
}

export async function applySeedJsonAction(formData: FormData): Promise<SeedUploadResult> {
  try {
    const user = await requireAdminRole();

    const file = formData.get("file");
    if (!(file instanceof File)) return { error: "No file provided" };
    if (file.size > MAX_BYTES) return { error: "File is larger than 2MB." };
    if (file.type && file.type !== "application/json" && !file.name.endsWith(".json")) {
      return { error: "File must be JSON (.json)." };
    }

    const text = await file.text();
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return { error: "File is not valid JSON." };
    }

    const parsed = seedPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"),
      };
    }

    const summary = await applySeedPayload(parsed.data, user.id);

    await logAudit({
      userId: user.id,
      action: "database.seeded",
      entity: "System",
      entityId: "seed",
      metadata: summary as Record<string, unknown>,
    });

    revalidatePath("/", "layout");
    return { summary };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Seeding failed" };
  }
}
