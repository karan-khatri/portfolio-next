"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, isValidLocale } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface CreateProjectState {
  error?: string;
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  try {
    await requireEditor();
  } catch {
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
  if (!isValidLocale(locale)) {
    return { error: `Unknown locale "${locale}"` };
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

export async function reorderFeaturedProjectsAction(
  orderedIds: string[],
): Promise<{ error?: string }> {
  try {
    await requireEditor();
    // featuredOrder is unique, so swapping two rows' positions directly can
    // collide mid-transaction (row A takes the value row B still holds).
    // Move everything to negative placeholders first, then to final values.
    await prisma.$transaction([
      ...orderedIds.map((id, index) =>
        prisma.project.update({ where: { id, featured: true }, data: { featuredOrder: -(index + 1) } }),
      ),
      ...orderedIds.map((id, index) =>
        prisma.project.update({ where: { id, featured: true }, data: { featuredOrder: index } }),
      ),
    ]);
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}

export async function unfeatureProjectAction(projectId: string): Promise<{ error?: string }> {
  try {
    await requireEditor();
    await prisma.project.update({
      where: { id: projectId },
      data: { featured: false, featuredOrder: null },
    });
    revalidatePath("/");
    revalidatePath("/admin/projects");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update" };
  }
}
