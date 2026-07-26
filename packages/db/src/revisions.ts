import { prisma } from "./client";
import { logAudit } from "./audit";
import { assertHasActiveRole } from "./auth";
import { saveDraft, type EntityType, type RevisionData } from "./cms";

export async function listRevisions(entityType: EntityType, entityId: string, limit = 20) {
  return prisma.revision.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { createdBy: { select: { email: true } } },
  });
}

export async function restoreRevision(params: {
  entityType: EntityType;
  entityId: string;
  revisionId: string;
  userId: string;
}) {
  await assertHasActiveRole(params.userId);

  const target = await prisma.revision.findUniqueOrThrow({ where: { id: params.revisionId } });
  if (target.entityType !== params.entityType || target.entityId !== params.entityId) {
    throw new Error("Revision does not match the given entity");
  }

  const restored = await saveDraft({
    entityType: params.entityType,
    entityId: params.entityId,
    data: target.data as unknown as RevisionData,
    userId: params.userId,
  });

  await logAudit({
    userId: params.userId,
    action: `${params.entityType.toLowerCase()}.restored`,
    entity: params.entityType,
    entityId: params.entityId,
    metadata: { fromRevisionId: params.revisionId, newRevisionId: restored.id },
  });

  return restored;
}
