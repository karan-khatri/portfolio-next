import { SectionType } from "@portfolio/db";
import type { z } from "zod";
import type { SectionLayout } from "./schemas";
import {
  aboutContentSchema,
  blogContentSchema,
  contactContentSchema,
  educationContentSchema,
  experienceContentSchema,
  heroContentSchema,
  languagesContentSchema,
  nowContentSchema,
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
  minHeight: string;
  headingLevel: 2 | 3;
}

function definition<TContent>(
  def: SectionDefinition<TContent>,
): SectionDefinition<TContent> {
  return def;
}

const DEFAULT_LAYOUT: SectionLayout = { showEyebrow: true, headingAlign: "left" };

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
    defaultContent: () => ({ heading: "About me", body: "", ...DEFAULT_LAYOUT }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.PROJECTS]: definition({
    type: SectionType.PROJECTS,
    label: "Projects",
    schema: projectsContentSchema,
    defaultContent: () => ({
      heading: "Projects",
      limit: 6,
      displayMode: "list" as const,
      ...DEFAULT_LAYOUT,
    }),
    minHeight: "30rem",
    headingLevel: 2,
  }),
  [SectionType.EXPERIENCE]: definition({
    type: SectionType.EXPERIENCE,
    label: "Experience",
    schema: experienceContentSchema,
    defaultContent: () => ({ heading: "Experience", ...DEFAULT_LAYOUT }),
    minHeight: "24rem",
    headingLevel: 2,
  }),
  [SectionType.EDUCATION]: definition({
    type: SectionType.EDUCATION,
    label: "Education",
    schema: educationContentSchema,
    defaultContent: () => ({ heading: "Education", ...DEFAULT_LAYOUT }),
    minHeight: "24rem",
    headingLevel: 2,
  }),
  [SectionType.SKILLS]: definition({
    type: SectionType.SKILLS,
    label: "Skills",
    schema: skillsContentSchema,
    defaultContent: () => ({
      heading: "Skills",
      showDiagram: true,
      diagramTopLeftItems: [],
      diagramBottomLeftItems: [],
      diagramTopRightItems: [],
      diagramBottomRightItems: [],
      ...DEFAULT_LAYOUT,
    }),
    minHeight: "16rem",
    headingLevel: 2,
  }),
  [SectionType.LANGUAGES]: definition({
    type: SectionType.LANGUAGES,
    label: "Languages",
    schema: languagesContentSchema,
    defaultContent: () => ({ heading: "Languages", ...DEFAULT_LAYOUT }),
    minHeight: "12rem",
    headingLevel: 2,
  }),
  [SectionType.SERVICES]: definition({
    type: SectionType.SERVICES,
    label: "Services",
    schema: servicesContentSchema,
    defaultContent: () => ({ heading: "Services", ...DEFAULT_LAYOUT }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.TESTIMONIALS]: definition({
    type: SectionType.TESTIMONIALS,
    label: "Testimonials",
    schema: testimonialsContentSchema,
    defaultContent: () => ({ heading: "Testimonials", ...DEFAULT_LAYOUT }),
    minHeight: "20rem",
    headingLevel: 2,
  }),
  [SectionType.BLOG]: definition({
    type: SectionType.BLOG,
    label: "Blog",
    schema: blogContentSchema,
    defaultContent: () => ({ heading: "Writing", limit: 3, ...DEFAULT_LAYOUT }),
    minHeight: "24rem",
    headingLevel: 2,
  }),
  [SectionType.CONTACT]: definition({
    type: SectionType.CONTACT,
    label: "Contact",
    schema: contactContentSchema,
    defaultContent: () => ({ heading: "Get in touch", email: "", ...DEFAULT_LAYOUT }),
    minHeight: "16rem",
    headingLevel: 2,
  }),
  [SectionType.RESUME]: definition({
    type: SectionType.RESUME,
    label: "Resume",
    schema: resumeContentSchema,
    defaultContent: () => ({ heading: "Resume", fileUrl: "", ...DEFAULT_LAYOUT }),
    minHeight: "10rem",
    headingLevel: 2,
  }),
  [SectionType.NOW]: definition({
    type: SectionType.NOW,
    label: "Now Building",
    schema: nowContentSchema,
    defaultContent: () => ({
      heading: "What I'm building right now",
      description: "",
      items: [],
      ...DEFAULT_LAYOUT,
    }),
    minHeight: "18rem",
    headingLevel: 2,
  }),
} satisfies Record<SectionType, SectionDefinition<unknown>>;

export type SectionRegistry = typeof sectionRegistry;
