import { prisma } from "./client";

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

  // A separate findFirst-then-create/update (as this used to be) is a
  // TOCTOU race: two concurrent callers for the same entity (e.g. two
  // overlapping seed runs, or a double-submitted save) can both see "no
  // existing row" and both attempt to create one, tripping the pageId/
  // projectId/postId unique constraint. Each branch below is a single
  // atomic upsert keyed on that entity's own unique column instead.
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
}
