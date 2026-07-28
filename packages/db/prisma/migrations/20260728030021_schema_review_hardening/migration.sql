-- schemaVersion: lets a future restore/render path tell "old shape" from
-- "current shape" for these two Json payload columns, which are the ones
-- most likely to actually change shape over time.
ALTER TABLE "SectionInstance" ADD COLUMN "schemaVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Revision" ADD COLUMN "schemaVersion" INTEGER NOT NULL DEFAULT 1;

-- Locale: closed vocabulary instead of a free string, so "En"/"en-US" typos
-- can't silently create content that never shows up in the right place.
-- Only "en" exists in every one of these tables today (verified before
-- writing this migration), so every cast below is a no-op on current data.
CREATE TYPE "Locale" AS ENUM ('en');

ALTER TABLE "Page"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Project"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Post"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Experience"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Education"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Skill"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Language"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Service"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "Testimonial"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';
ALTER TABLE "NavigationItem"
  ALTER COLUMN "locale" TYPE "Locale" USING ("locale"::"Locale"),
  ALTER COLUMN "locale" SET DEFAULT 'en';

-- programmingLanguages: collapses into the existing Tag mechanism instead of
-- being a second, parallel free-text vocabulary for the same "labels on a
-- project" concept. Backfill first (find-or-create a Tag per language,
-- matching the same slugify() rules used by resolveTagIds in
-- packages/db/src/tags.ts, then connect it), then drop the column.
DO $$
DECLARE
  proj RECORD;
  lang TEXT;
  tag_slug TEXT;
  tag_id TEXT;
BEGIN
  FOR proj IN SELECT id, "programmingLanguages" FROM "Project" WHERE array_length("programmingLanguages", 1) > 0 LOOP
    FOREACH lang IN ARRAY proj."programmingLanguages" LOOP
      tag_slug := regexp_replace(regexp_replace(lower(trim(lang)), '[^a-z0-9]+', '-', 'g'), '^-+|-+$', '', 'g');
      IF tag_slug = '' THEN
        CONTINUE;
      END IF;

      SELECT id INTO tag_id FROM "Tag" WHERE slug = tag_slug;
      IF tag_id IS NULL THEN
        tag_id := gen_random_uuid()::text;
        INSERT INTO "Tag" (id, slug, name) VALUES (tag_id, tag_slug, trim(lang));
      END IF;

      INSERT INTO "_ProjectTags" ("A", "B") VALUES (proj.id, tag_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE "Project" DROP COLUMN "programmingLanguages";

-- Project.featuredOrder: unique (not just indexed), so two featured projects
-- can never silently share a position and make the featured-order
-- nondeterministic. NULL is exempt (Postgres treats NULLs as distinct), which
-- is correct here: only currently-featured rows need a real unique position.
CREATE UNIQUE INDEX "Project_featuredOrder_key" ON "Project"("featuredOrder");

-- Media.url: guards against the same uploaded asset ending up as two
-- different Media rows referenced inconsistently across
-- Project.coverImage/Post.coverImage/Seo.ogImage.
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- Revision and AuditLog are append-only history/audit trails — no
-- application code path updates either table (verified before writing this
-- migration), so a trigger rejecting UPDATE makes that structurally
-- impossible instead of merely unlikely.
CREATE OR REPLACE FUNCTION reject_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% rows are append-only and cannot be updated', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revision_no_update
  BEFORE UPDATE ON "Revision"
  FOR EACH ROW
  EXECUTE FUNCTION reject_update();

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON "AuditLog"
  FOR EACH ROW
  EXECUTE FUNCTION reject_update();
