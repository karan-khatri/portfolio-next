import { prisma } from "./client";
import { withUniqueRetry } from "./upsert-retry";

export type SeoEntityType = "Page" | "Project" | "Post";

export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
}

export async function upsertSeo(params: {
  entityType: SeoEntityType;
  entityId: string;
  fields: SeoFields;
}) {
  const { entityType, entityId, fields } = params;

  return withUniqueRetry(() => {
    switch (entityType) {
      case "Page":
        return prisma.seo.upsert({
          where: { pageId: entityId },
          update: fields,
          create: { ...fields, pageId: entityId },
        });
      case "Project":
        return prisma.seo.upsert({
          where: { projectId: entityId },
          update: fields,
          create: { ...fields, projectId: entityId },
        });
      case "Post":
        return prisma.seo.upsert({
          where: { postId: entityId },
          update: fields,
          create: { ...fields, postId: entityId },
        });
    }
  });
}
