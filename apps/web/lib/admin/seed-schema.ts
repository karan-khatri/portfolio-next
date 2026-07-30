import { z } from "zod";
import { SectionType } from "@portfolio/db";
import { validateSectionContent, SectionValidationError } from "@portfolio/sections";

const seedMediaItemSchema = z.object({
  url: z.string().url(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  blurDataUrl: z.string().nullable(),
  altText: z.string().nullable(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
});

const seedTechStackItemSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().nullable(),
  order: z.number().int(),
});

const seedSiteSettingsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  githubUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  upworkUrl: z.string().nullable(),
  fiverrUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  location: z.string().nullable(),
});

const seedSeoFieldsSchema = z.object({
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
  canonicalUrl: z.string().nullish(),
  ogImageUrl: z.string().nullable().default(null),
  structuredData: z.record(z.string(), z.unknown()).nullable().default(null),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
});

const seedProjectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  body: z.string(),
  tags: z.array(z.string()).default([]),
  coverImageUrl: z.string().nullable().default(null),
  codeRepository: z.string().nullable().default(null),
  liveUrl: z.string().nullable().default(null),
  featured: z.boolean().default(false),
  featuredOrder: z.number().int().nullable().default(null),
  seo: seedSeoFieldsSchema.nullable().default(null),
  images: z.array(z.string()).default([]),
});

const seedSectionSchema = z
  .object({
    type: z.nativeEnum(SectionType),
    order: z.number().int(),
    enabled: z.boolean(),
    content: z.record(z.string(), z.unknown()),
  })
  .superRefine((section, ctx) => {
    try {
      validateSectionContent(section.type, section.content);
    } catch (error) {
      if (error instanceof SectionValidationError) {
        ctx.addIssue({ code: "custom", path: ["content"], message: error.issues.join("; ") });
      } else {
        throw error;
      }
    }
  });

const seedExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().default(null),
  description: z.string().nullable().default(null),
});

const seedEducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  location: z.string().nullable().default(null),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().default(null),
  description: z.string().nullable().default(null),
});

const seedLanguageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.string().min(1),
});

const seedSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().nullable().default(null),
});

export const seedPayloadSchema = z
  .object({
    media: z.array(seedMediaItemSchema).optional(),
    techStack: z.array(seedTechStackItemSchema).optional(),
    siteSettings: seedSiteSettingsSchema.optional(),
    projects: z.array(seedProjectSchema).optional(),
    homePageSections: z.array(seedSectionSchema).optional(),
    resumeExperience: z.array(seedExperienceSchema).optional(),
    resumeEducation: z.array(seedEducationSchema).optional(),
    resumeLanguages: z.array(seedLanguageSchema).optional(),
    resumeSkills: z.array(seedSkillSchema).optional(),
  })
  .strict();

export type SeedPayload = z.infer<typeof seedPayloadSchema>;
