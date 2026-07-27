-- InviteToken.invitedById: was a required FK with no onDelete (implicit
-- Restrict) — a User could never be deleted once they'd sent any invite,
-- ever. Nullable + SetNull, matching AuditLog.userId's precedent: the
-- invite row is a historical record and should survive the inviting user
-- being deleted.
ALTER TABLE "InviteToken" DROP CONSTRAINT "InviteToken_invitedById_fkey";
ALTER TABLE "InviteToken" ALTER COLUMN "invitedById" DROP NOT NULL;
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UserRoleAssignment.roleId and InviteToken.roleId: both were required FKs
-- with no onDelete (implicit Restrict) — a Role could never be deleted once
-- anyone had ever held it or been invited with it, even long after the
-- assignment/invite expired. Nullable + SetNull for both, same historical-
-- record reasoning as above. The enforce_permanent_role_no_expiry trigger's
-- subquery (`WHERE "id" = NEW."roleId"`) is naturally NULL-safe: a NULL
-- roleId can't match any row, so the EXISTS check just evaluates false.
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT "UserRoleAssignment_roleId_fkey";
ALTER TABLE "UserRoleAssignment" ALTER COLUMN "roleId" DROP NOT NULL;
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InviteToken" DROP CONSTRAINT "InviteToken_roleId_fkey";
ALTER TABLE "InviteToken" ALTER COLUMN "roleId" DROP NOT NULL;
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Media.uploadedById: was a bare string with no FK at all — could point at a
-- nonexistent user and wasn't queryable as a relation. Add the FK now,
-- SetNull so deleting a user keeps their uploads around, just unattributed.
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Page/Project/Post: a translation group must have at most one row per
-- locale — nothing previously stopped two rows sharing a translationGroupId
-- from both being "en". The new unique index's leading column already
-- covers what the old single-column translationGroupId index was for, so
-- drop the redundant one.
DROP INDEX "Page_translationGroupId_idx";
CREATE UNIQUE INDEX "Page_translationGroupId_locale_key" ON "Page"("translationGroupId", "locale");
CREATE INDEX "Page_locale_status_publishedAt_idx" ON "Page"("locale", "status", "publishedAt");

DROP INDEX "Project_translationGroupId_idx";
CREATE UNIQUE INDEX "Project_translationGroupId_locale_key" ON "Project"("translationGroupId", "locale");
CREATE INDEX "Project_locale_status_publishedAt_idx" ON "Project"("locale", "status", "publishedAt");

DROP INDEX "Post_translationGroupId_idx";
CREATE UNIQUE INDEX "Post_translationGroupId_locale_key" ON "Post"("translationGroupId", "locale");
CREATE INDEX "Post_locale_status_publishedAt_idx" ON "Post"("locale", "status", "publishedAt");
