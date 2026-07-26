-- CreateEnum
CREATE TYPE "RevisionEntityType" AS ENUM ('Page', 'Project', 'Post');

-- AlterTable: convert Revision.entityType from free-text to the enum.
ALTER TABLE "Revision"
  ALTER COLUMN "entityType" TYPE "RevisionEntityType"
  USING ("entityType"::"RevisionEntityType");

-- AlterTable: PreviewToken.entityType/entityId were a redundant, independently
-- driftable copy of what revision.entityType/entityId already say — drop
-- them, callers now read through the revision relation instead.
DROP INDEX IF EXISTS "PreviewToken_entityType_entityId_idx";
ALTER TABLE "PreviewToken" DROP COLUMN "entityType";
ALTER TABLE "PreviewToken" DROP COLUMN "entityId";
