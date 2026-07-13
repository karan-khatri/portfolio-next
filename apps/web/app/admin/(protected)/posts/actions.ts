"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface CreatePostState {
  error?: string;
}

export async function createPostAction(
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
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

  const existing = await prisma.post.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (existing) {
    return { error: "A post with that slug and locale already exists" };
  }

  const post = await prisma.post.create({
    data: { slug, locale, translationGroupId: slug, title, status: "DRAFT" },
  });

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}`);
}
