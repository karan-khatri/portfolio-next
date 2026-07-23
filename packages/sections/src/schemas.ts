import { z } from "zod";

export const sectionLayoutSchema = z.object({
  showEyebrow: z.boolean().default(true),
  headingAlign: z.enum(["left", "center", "right"]).default("left"),
});

export type SectionLayout = z.infer<typeof sectionLayoutSchema>;

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
  location: z.string().optional(),
  focusTag: z.string().optional(),
  education: z.string().optional(),
  terminalTitle: z.string().optional(),
  role: z.string().optional(),
  focusDetail: z.string().optional(),
  currently: z.string().optional(),
  status: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const projectsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  projectIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).optional(),
  displayMode: z.enum(["list", "featured", "slider"]).default("list"),
  ...sectionLayoutSchema.shape,
});

export const experienceContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const educationContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const skillsDiagramItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
});

export const skillsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  showDiagram: z.boolean().default(true),
  diagramCenterLabel: z.string().optional(),
  diagramCenterSubtitle: z.string().optional(),
  diagramTopLeftTitle: z.string().optional(),
  diagramTopLeftItems: z.array(skillsDiagramItemSchema).max(8).default([]),
  diagramBottomLeftTitle: z.string().optional(),
  diagramBottomLeftItems: z.array(skillsDiagramItemSchema).max(8).default([]),
  diagramTopRightTitle: z.string().optional(),
  diagramTopRightItems: z.array(skillsDiagramItemSchema).max(8).default([]),
  diagramBottomRightTitle: z.string().optional(),
  diagramBottomRightItems: z.array(skillsDiagramItemSchema).max(8).default([]),
  ...sectionLayoutSchema.shape,
});

export const languagesContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const servicesContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const testimonialsContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const blogContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  postIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).optional(),
  ...sectionLayoutSchema.shape,
});

export const contactContentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  email: z.string().email(),
  ...sectionLayoutSchema.shape,
});

export const resumeContentSchema = z.object({
  heading: z.string().min(1),
  fileUrl: z.string().min(1),
  ctaLabel: z.string().optional(),
  ...sectionLayoutSchema.shape,
});

export const nowChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  status: z.enum(["done", "in_progress", "remaining"]),
});

export const nowContentSchema = z.object({
  heading: z.string().min(1),
  description: z.string().optional(),
  items: z.array(nowChecklistItemSchema).max(12).default([]),
  ...sectionLayoutSchema.shape,
});

export type HeroContent = z.infer<typeof heroContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type ProjectsContent = z.infer<typeof projectsContentSchema>;
export type ExperienceContent = z.infer<typeof experienceContentSchema>;
export type EducationContent = z.infer<typeof educationContentSchema>;
export type SkillsContent = z.infer<typeof skillsContentSchema>;
export type SkillsDiagramItem = z.infer<typeof skillsDiagramItemSchema>;
export type LanguagesContent = z.infer<typeof languagesContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>;
export type BlogContent = z.infer<typeof blogContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type NowChecklistItem = z.infer<typeof nowChecklistItemSchema>;
export type NowContent = z.infer<typeof nowContentSchema>;
