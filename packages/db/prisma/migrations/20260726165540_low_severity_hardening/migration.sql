-- AuditLog.userId: nullable + SetNull, so deleting a user preserves their
-- audit history instead of either blocking the delete (old RESTRICT) or
-- deleting the log entries with them.
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SectionInstance: a real uniqueness guarantee on (pageId, order) instead of
-- just an index, so ties can no longer make section ordering ambiguous.
DROP INDEX "SectionInstance_pageId_order_idx";
CREATE UNIQUE INDEX "SectionInstance_pageId_order_key" ON "SectionInstance"("pageId", "order");

-- TechStackItem: add createdAt/updatedAt (matching its sibling models) and a
-- uniqueness guarantee on name. DEFAULT CURRENT_TIMESTAMP on both new
-- columns backfills the 16 existing rows so the NOT NULL addition doesn't
-- fail against them.
ALTER TABLE "TechStackItem" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TechStackItem" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX "TechStackItem_name_key" ON "TechStackItem"("name");

-- Skill.level: the admin form is already documented/labeled "Level (1-5)" —
-- make that range a real guarantee instead of an unconstrained Int.
ALTER TABLE "Skill" ADD CONSTRAINT "skill_level_range_check" CHECK ("level" IS NULL OR ("level" >= 1 AND "level" <= 5));
