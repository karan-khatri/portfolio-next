ALTER TYPE "Locale" ADD VALUE 'it';

-- Experience
ALTER TABLE "Experience" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Experience" SET "translationGroupId" = "id";
ALTER TABLE "Experience" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Experience_translationGroupId_locale_key" ON "Experience"("translationGroupId", "locale");
CREATE INDEX "Experience_locale_order_idx" ON "Experience"("locale", "order");

-- Education
ALTER TABLE "Education" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Education" SET "translationGroupId" = "id";
ALTER TABLE "Education" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Education_translationGroupId_locale_key" ON "Education"("translationGroupId", "locale");
CREATE INDEX "Education_locale_order_idx" ON "Education"("locale", "order");

-- Skill
ALTER TABLE "Skill" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Skill" SET "translationGroupId" = "id";
ALTER TABLE "Skill" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Skill_translationGroupId_locale_key" ON "Skill"("translationGroupId", "locale");
CREATE INDEX "Skill_locale_order_idx" ON "Skill"("locale", "order");

-- Language
ALTER TABLE "Language" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Language" SET "translationGroupId" = "id";
ALTER TABLE "Language" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Language_translationGroupId_locale_key" ON "Language"("translationGroupId", "locale");
CREATE INDEX "Language_locale_order_idx" ON "Language"("locale", "order");

-- Service
ALTER TABLE "Service" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Service" SET "translationGroupId" = "id";
ALTER TABLE "Service" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Service_translationGroupId_locale_key" ON "Service"("translationGroupId", "locale");
CREATE INDEX "Service_locale_order_idx" ON "Service"("locale", "order");

-- Testimonial
ALTER TABLE "Testimonial" ADD COLUMN "translationGroupId" TEXT;
UPDATE "Testimonial" SET "translationGroupId" = "id";
ALTER TABLE "Testimonial" ALTER COLUMN "translationGroupId" SET NOT NULL;
CREATE UNIQUE INDEX "Testimonial_translationGroupId_locale_key" ON "Testimonial"("translationGroupId", "locale");
CREATE INDEX "Testimonial_locale_order_idx" ON "Testimonial"("locale", "order");
