-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRoleAssignment_userId_startsAt_idx" ON "UserRoleAssignment"("userId", "startsAt");

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the two known roles with fixed ids so the backfill below can
-- reference them directly.
INSERT INTO "Role" ("id", "name", "isPermanent") VALUES
  ('role_admin', 'ADMIN', true),
  ('role_editor', 'EDITOR', false);

-- Backfill: one UserRoleAssignment per existing User, derived from their
-- old scalar role column. Non-permanent (EDITOR) grants get a 30-day
-- window rather than an arbitrary permanent grant, since the whole point
-- of this migration is that non-admin roles must be time-bound.
INSERT INTO "UserRoleAssignment" ("id", "userId", "roleId", "startsAt", "expiresAt")
SELECT
  gen_random_uuid()::text,
  "id",
  CASE WHEN "role" = 'ADMIN' THEN 'role_admin' ELSE 'role_editor' END,
  CURRENT_TIMESTAMP,
  CASE WHEN "role" = 'ADMIN' THEN NULL ELSE CURRENT_TIMESTAMP + INTERVAL '30 days' END
FROM "User";

-- InviteToken: add nullable columns, backfill from the old role column,
-- then tighten to NOT NULL before dropping the old column.
ALTER TABLE "InviteToken" ADD COLUMN "roleId" TEXT;
ALTER TABLE "InviteToken" ADD COLUMN "roleExpiresAt" TIMESTAMP(3);

UPDATE "InviteToken"
SET "roleId" = CASE WHEN "role" = 'ADMIN' THEN 'role_admin' ELSE 'role_editor' END;

UPDATE "InviteToken"
SET "roleExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE "roleId" = 'role_editor';

ALTER TABLE "InviteToken" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InviteToken" DROP COLUMN "role";

-- Drop the old scalar role column and enum now that every row has a real
-- UserRoleAssignment / InviteToken.roleId instead.
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "UserRole";
