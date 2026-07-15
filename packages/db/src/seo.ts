import { prisma } from "./client";

export type SeoEntityType = "Page" | "Project" | "Post";

export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
}

async function getSeoId(entityType: SeoEntityType, entityId: string): Promise<string | null> {
  if (entityType === "Page") {
    return (await prisma.page.findUniqueOrThrow({ where: { id: entityId }, select: { seoId: true } }))
      .seoId;
  }
  if (entityType === "Project") {
    return (
      await prisma.project.findUniqueOrThrow({ where: { id: entityId }, select: { seoId: true } })
    ).seoId;
  }
  return (await prisma.post.findUniqueOrThrow({ where: { id: entityId }, select: { seoId: true } }))
    .seoId;
}

async function linkSeoId(entityType: SeoEntityType, entityId: string, seoId: string) {
  if (entityType === "Page") {
    await prisma.page.update({ where: { id: entityId }, data: { seoId } });
  } else if (entityType === "Project") {
    await prisma.project.update({ where: { id: entityId }, data: { seoId } });
  } else {
    await prisma.post.update({ where: { id: entityId }, data: { seoId } });
  }
}

export async function upsertSeo(params: {
  entityType: SeoEntityType;
  entityId: string;
  fields: SeoFields;
}) {
  const existingSeoId = await getSeoId(params.entityType, params.entityId);

  if (existingSeoId) {
    return prisma.seo.update({ where: { id: existingSeoId }, data: params.fields });
  }

  const seo = await prisma.seo.create({ data: params.fields });
  await linkSeoId(params.entityType, params.entityId, seo.id);
  return seo;
}
