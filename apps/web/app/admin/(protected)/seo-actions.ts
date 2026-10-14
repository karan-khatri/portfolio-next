"use server";

import { prisma, upsertSeo, type SeoEntityType, type SeoFields } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import { revalidatePublicSite } from "@/lib/admin/revalidate";

export interface SaveSeoResult {
  error?: string;
}

async function revalidateEntityPath(entityType: SeoEntityType, entityId: string): Promise<void> {
  if (entityType === "Project") {
    const project = await prisma.project.findUnique({ where: { id: entityId }, select: { slug: true } });
    if (project) revalidatePublicSite();
  } else if (entityType === "Post") {
    const post = await prisma.post.findUnique({ where: { id: entityId }, select: { slug: true } });
    if (post) revalidatePublicSite();
  } else {
    const page = await prisma.page.findUnique({ where: { id: entityId }, select: { slug: true } });
    if (page) revalidatePublicSite();
  }
}

export async function saveSeoAction(
  entityType: SeoEntityType,
  entityId: string,
  fields: SeoFields,
): Promise<SaveSeoResult> {
  try {
    await requireEditor();
    await upsertSeo({ entityType, entityId, fields });
    await revalidateEntityPath(entityType, entityId);
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save SEO fields" };
  }
}
