"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface CreateProjectState {
  error?: string;
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
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

  const existing = await prisma.project.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (existing) {
    return { error: "A project with that slug and locale already exists" };
  }

  const project = await prisma.project.create({
    data: { slug, locale, translationGroupId: slug, title, status: "DRAFT" },
  });

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}`);
}
