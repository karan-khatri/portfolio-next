"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, isValidLocale } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";

export interface CreatePostState {
  error?: string;
}

export async function createPostAction(
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
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

  const existing = await prisma.post.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (existing) {
    return { error: "A post with that slug and locale already exists" };
  }

  const post = await prisma.post.create({
    data: { slug, locale, translationGroupId: randomUUID(), title, status: "DRAFT" },
  });

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}`);
}
