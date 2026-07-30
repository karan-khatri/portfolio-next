import { Prisma } from "./generated/client";
import { prisma } from "./client";

export type SeoEntityType = "Page" | "Project" | "Post";

export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageId?: string | null;
  structuredData?: Prisma.InputJsonValue | null;
  noindex?: boolean;
  nofollow?: boolean;
}

const OWNER_FIELD: Record<SeoEntityType, "pageId" | "projectId" | "postId"> = {
  Page: "pageId",
  Project: "projectId",
  Post: "postId",
};

export async function upsertSeo(params: {
  entityType: SeoEntityType;
  entityId: string;
  fields: SeoFields;
}) {
  const ownerField = OWNER_FIELD[params.entityType];
  const { structuredData, ...rest } = params.fields;
  const fields = {
    ...rest,
    ...(structuredData !== undefined
      ? { structuredData: structuredData === null ? Prisma.JsonNull : structuredData }
      : {}),
  };

  const existing = await prisma.seo.findFirst({ where: { [ownerField]: params.entityId } });

  if (existing) {
    return prisma.seo.update({ where: { id: existing.id }, data: fields });
  }

  return prisma.seo.create({ data: { ...fields, [ownerField]: params.entityId } });
}
