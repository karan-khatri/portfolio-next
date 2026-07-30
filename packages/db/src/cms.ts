import { randomBytes } from "node:crypto";
import { prisma } from "./client";
import { logAudit } from "./audit";
import { hashToken, assertHasActiveRole } from "./auth";
import type { ContentStatus, SectionType } from "./generated/client";

export type EntityType = "Page" | "Project" | "Post";

export interface PageSectionInput {
  type: SectionType;
  order: number;
  enabled: boolean;
  content: unknown;
}

export interface PageRevisionData {
  title: string;
  sections: PageSectionInput[];
}

export interface FlatRevisionData {
  title: string;
  excerpt?: string | null;
  body?: string | null;
  coverImageId?: string | null;
  tagIds?: string[];
  codeRepository?: string | null;
  liveUrl?: string | null;
  authorId?: string | null;
  galleryImageIds?: string[];
}

export type RevisionData = PageRevisionData | FlatRevisionData;

export async function saveDraft(params: {
  entityType: EntityType;
  entityId: string;
  data: RevisionData;
  userId: string;
}) {
  await assertHasActiveRole(params.userId);

  const revision = await prisma.revision.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      status: "DRAFT",
      data: params.data as object,
      createdById: params.userId,
    },
  });

  await logAudit({
    userId: params.userId,
    action: `${params.entityType.toLowerCase()}.draft_saved`,
    entity: params.entityType,
    entityId: params.entityId,
    metadata: { revisionId: revision.id },
  });

  return revision;
}

export async function getLatestRevision(
  entityType: EntityType,
  entityId: string,
  status?: ContentStatus,
) {
  return prisma.revision.findFirst({
    where: { entityType, entityId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

async function applyPageRevision(entityId: string, data: PageRevisionData) {
  await prisma.$transaction([
    prisma.page.update({
      where: { id: entityId },
      data: { title: data.title, status: "PUBLISHED", publishedAt: new Date() },
    }),
    prisma.sectionInstance.deleteMany({ where: { pageId: entityId } }),
    prisma.sectionInstance.createMany({
      data: data.sections.map((section) => ({
        pageId: entityId,
        type: section.type,
        order: section.order,
        enabled: section.enabled,
        content: section.content as object,
      })),
    }),
  ]);
}

async function applyFlatRevision(
  entityType: "Project" | "Post",
  entityId: string,
  data: FlatRevisionData,
) {
  const base = {
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    coverImageId: data.coverImageId,
    status: "PUBLISHED" as const,
    publishedAt: new Date(),
  };
  const tags = data.tagIds ? { set: data.tagIds.map((id) => ({ id })) } : undefined;

  if (entityType === "Project") {
    await prisma.project.update({
      where: { id: entityId },
      data: {
        ...base,
        tags,
        codeRepository: data.codeRepository,
        liveUrl: data.liveUrl,
      },
    });

    if (data.galleryImageIds !== undefined) {
      await prisma.$transaction([
        prisma.projectImage.deleteMany({ where: { projectId: entityId } }),
        prisma.projectImage.createMany({
          data: data.galleryImageIds.map((mediaId, order) => ({ projectId: entityId, mediaId, order })),
        }),
      ]);
    }
  } else {
    await prisma.post.update({
      where: { id: entityId },
      data: { ...base, tags, authorId: data.authorId },
    });
  }
}

export async function publishRevision(params: {
  entityType: EntityType;
  entityId: string;
  revisionId: string;
  userId: string;
}) {
  await assertHasActiveRole(params.userId);

  const revision = await prisma.revision.findUniqueOrThrow({
    where: { id: params.revisionId },
  });
  if (revision.entityType !== params.entityType || revision.entityId !== params.entityId) {
    throw new Error("Revision does not match the given entity");
  }

  if (params.entityType === "Page") {
    await applyPageRevision(params.entityId, revision.data as unknown as PageRevisionData);
  } else {
    await applyFlatRevision(
      params.entityType,
      params.entityId,
      revision.data as unknown as FlatRevisionData,
    );
  }

  await logAudit({
    userId: params.userId,
    action: `${params.entityType.toLowerCase()}.publish`,
    entity: params.entityType,
    entityId: params.entityId,
    metadata: { revisionId: params.revisionId },
  });
}

export async function unpublishEntity(params: {
  entityType: EntityType;
  entityId: string;
  userId: string;
}) {
  await assertHasActiveRole(params.userId);

  const data = { status: "DRAFT" as const, publishedAt: null };
  if (params.entityType === "Page") {
    await prisma.page.update({ where: { id: params.entityId }, data });
  } else if (params.entityType === "Project") {
    await prisma.project.update({ where: { id: params.entityId }, data });
  } else {
    await prisma.post.update({ where: { id: params.entityId }, data });
  }

  await logAudit({
    userId: params.userId,
    action: `${params.entityType.toLowerCase()}.unpublish`,
    entity: params.entityType,
    entityId: params.entityId,
  });
}

const PREVIEW_TTL_MS = 60 * 60 * 1000;

export async function createPreviewToken(params: { revisionId: string; userId: string }) {
  await assertHasActiveRole(params.userId);

  const expiresAt = new Date(Date.now() + PREVIEW_TTL_MS);
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const created = await prisma.previewToken.create({
    data: {
      tokenHash,
      revisionId: params.revisionId,
      expiresAt,
    },
  });
  return { ...created, token };
}

export async function resolvePreviewToken(token: string) {
  const tokenHash = hashToken(token);
  const preview = await prisma.previewToken.findUnique({
    where: { tokenHash },
    include: { revision: true },
  });
  if (!preview || preview.expiresAt < new Date()) return null;
  return preview;
}
