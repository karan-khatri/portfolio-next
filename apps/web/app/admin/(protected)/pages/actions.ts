"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface CreatePageState {
  error?: string;
}

export async function createPageAction(
  _prevState: CreatePageState,
  formData: FormData,
): Promise<CreatePageState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const locale = String(formData.get("locale") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!slug || !locale || !title) {
    return { error: "Slug, locale, and title are required" };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers, and hyphens only" };
  }

  const existing = await prisma.page.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (existing) {
    return { error: "A page with that slug and locale already exists" };
  }

  const page = await prisma.page.create({
    data: { slug, locale, translationGroupId: slug, title, status: "DRAFT" },
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}
