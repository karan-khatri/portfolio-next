-- 1. Add the new owner columns on Seo first (nullable, no data loss).
ALTER TABLE "Seo" ADD COLUMN "pageId" TEXT;
ALTER TABLE "Seo" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Seo" ADD COLUMN "postId" TEXT;

-- 2. Backfill from the old Page/Project/Post.seoId columns before they're dropped.
UPDATE "Seo" SET "pageId" = p."id" FROM "Page" p WHERE p."seoId" = "Seo"."id";
UPDATE "Seo" SET "projectId" = p."id" FROM "Project" p WHERE p."seoId" = "Seo"."id";
UPDATE "Seo" SET "postId" = p."id" FROM "Post" p WHERE p."seoId" = "Seo"."id";

-- 3. Uniqueness + cascade-on-delete from the new (owning) side.
CREATE UNIQUE INDEX "Seo_pageId_key" ON "Seo"("pageId");
CREATE UNIQUE INDEX "Seo_projectId_key" ON "Seo"("projectId");
CREATE UNIQUE INDEX "Seo_postId_key" ON "Seo"("postId");

ALTER TABLE "Seo" ADD CONSTRAINT "Seo_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Guarantee at most one owner per Seo row at the DB level (defense in depth
--    beyond the application only ever setting one via upsertSeo).
ALTER TABLE "Seo" ADD CONSTRAINT "seo_single_owner_check" CHECK (
  (CASE WHEN "pageId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "projectId" IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN "postId" IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- 5. Drop the old (non-owning-side) columns now that data is migrated.
ALTER TABLE "Page" DROP CONSTRAINT "Page_seoId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_seoId_fkey";
ALTER TABLE "Project" DROP CONSTRAINT "Project_seoId_fkey";

DROP INDEX "Page_seoId_key";
DROP INDEX "Post_seoId_key";
DROP INDEX "Project_seoId_key";

ALTER TABLE "Page" DROP COLUMN "seoId";
ALTER TABLE "Post" DROP COLUMN "seoId";
ALTER TABLE "Project" DROP COLUMN "seoId";
