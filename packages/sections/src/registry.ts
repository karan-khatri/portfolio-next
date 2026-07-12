import { SectionType } from "@portfolio/db";
import type { z } from "zod";
import {
  aboutContentSchema,
  blogContentSchema,
  contactContentSchema,
  experienceContentSchema,
  heroContentSchema,
  projectsContentSchema,
  resumeContentSchema,
  servicesContentSchema,
  skillsContentSchema,
  testimonialsContentSchema,
} from "./schemas";

export interface SectionDefinition<TContent = unknown> {
  type: SectionType;
  label: string;
  schema: z.ZodType<TContent>;
  defaultContent: () => TContent;
  // Reserves layout space so streamed-in data never shifts the page (CLS).
  minHeight: string;
  // Sections author at most one heading level below the page's own h1;
  // the renderer increments this for any section that nests sub-sections.
  headingLevel: 2 | 3;
}

function definition<TContent>(
  def: SectionDefinition<TContent>,
): SectionDefinition<TContent> {
  return def;
}

export const sectionRegistry = {
  [SectionType.HERO]: definition({
    type: SectionType.HERO,
    label: "Hero",
    schema: heroContentSchema,
    defaultContent: () => ({ heading: "Your name" }),
    minHeight: "60vh",
    headingLevel: 2,
  }),
  [SectionType.ABOUT]: definition({
    type: SectionType.ABOUT,
    label: "About",
    schema: aboutContentSchema,
    defaultContent: () => ({ heading: "About me", body: "" }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.PROJECTS]: definition({
    type: SectionType.PROJECTS,
    label: "Projects",
    schema: projectsContentSchema,
    defaultContent: () => ({ heading: "Projects", limit: 6 }),
    minHeight: "30rem",
    headingLevel: 2,
  }),
  [SectionType.EXPERIENCE]: definition({
    type: SectionType.EXPERIENCE,
    label: "Experience",
    schema: experienceContentSchema,
    defaultContent: () => ({ heading: "Experience" }),
    minHeight: "24rem",
    headingLevel: 2,
  }),
  [SectionType.SKILLS]: definition({
    type: SectionType.SKILLS,
    label: "Skills",
    schema: skillsContentSchema,
    defaultContent: () => ({ heading: "Skills" }),
    minHeight: "16rem",
    headingLevel: 2,
  }),
  [SectionType.SERVICES]: definition({
    type: SectionType.SERVICES,
    label: "Services",
    schema: servicesContentSchema,
    defaultContent: () => ({ heading: "Services" }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.TESTIMONIALS]: definition({
    type: SectionType.TESTIMONIALS,
    label: "Testimonials",
    schema: testimonialsContentSchema,
    defaultContent: () => ({ heading: "Testimonials" }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.BLOG]: definition({
    type: SectionType.BLOG,
    label: "Blog",
    schema: blogContentSchema,
    defaultContent: () => ({ heading: "Writing", limit: 3 }),
    minHeight: "24rem",
    headingLevel: 2,
  }),
  [SectionType.CONTACT]: definition({
    type: SectionType.CONTACT,
    label: "Contact",
    schema: contactContentSchema,
    defaultContent: () => ({ heading: "Get in touch", email: "" }),
    minHeight: "16rem",
    headingLevel: 2,
  }),
  [SectionType.RESUME]: definition({
    type: SectionType.RESUME,
    label: "Resume",
    schema: resumeContentSchema,
    defaultContent: () => ({ heading: "Resume", fileUrl: "" }),
    minHeight: "10rem",
    headingLevel: 2,
  }),
} satisfies Record<SectionType, SectionDefinition<unknown>>;

export type SectionRegistry = typeof sectionRegistry;
