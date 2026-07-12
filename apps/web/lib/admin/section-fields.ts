import { SectionType } from "@portfolio/db";

export interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "email" | "number";
  required?: boolean;
}

// Presentation-layer companion to @portfolio/sections' Zod schemas — kept
// here rather than in that package because "how a field should render as a
// form control" is an admin-app UX concern, not part of the content
// contract itself.
export const sectionFields: Record<SectionType, SectionField[]> = {
  [SectionType.HERO]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "ctaLabel", label: "CTA label", type: "text" },
    { key: "ctaHref", label: "CTA link", type: "text" },
  ],
  [SectionType.ABOUT]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "body", label: "Body", type: "textarea", required: true },
  ],
  [SectionType.PROJECTS]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "limit", label: "Max projects to show", type: "number" },
  ],
  [SectionType.EXPERIENCE]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  [SectionType.SKILLS]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  [SectionType.SERVICES]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  [SectionType.TESTIMONIALS]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  [SectionType.BLOG]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "limit", label: "Max posts to show", type: "number" },
  ],
  [SectionType.CONTACT]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "ctaLabel", label: "CTA label", type: "text" },
  ],
  [SectionType.RESUME]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "fileUrl", label: "File URL", type: "text", required: true },
    { key: "ctaLabel", label: "CTA label", type: "text" },
  ],
};
