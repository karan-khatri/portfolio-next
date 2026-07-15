import { z } from "zod";

// Each section type's content is presentation config for that instance.
// Where a section pulls from its own domain table (Experience, Skill,
// Service, Testimonial, Project, Post), the schema only carries heading
// copy + an optional cap on how many rows to show — the rows themselves
// stay in their own tables so they're editable independent of layout.

export const heroContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageId: z.string().optional(),
});

export const aboutContentSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  imageId: z.string().optional(),
});

export const projectsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  projectIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).optional(),
  // "list" (default): every published project, newest first, capped by
  // `limit`. "featured"/"slider" both pull the same hand-ordered
  // featured=true set (see Project.featuredOrder) — just rendered as a
  // static grid vs. a carousel.
  displayMode: z.enum(["list", "featured", "slider"]).default("list"),
});

export const experienceContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
});

export const skillsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
});

export const servicesContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
});

export const testimonialsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
});

export const blogContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  postIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export const contactContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  email: z.string().email(),
  ctaLabel: z.string().optional(),
});

export const resumeContentSchema = z.object({
  heading: z.string().min(1),
  fileUrl: z.string().min(1),
  ctaLabel: z.string().optional(),
});

export type HeroContent = z.infer<typeof heroContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type ProjectsContent = z.infer<typeof projectsContentSchema>;
export type ExperienceContent = z.infer<typeof experienceContentSchema>;
export type SkillsContent = z.infer<typeof skillsContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>;
export type BlogContent = z.infer<typeof blogContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;
