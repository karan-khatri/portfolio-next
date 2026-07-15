import { SectionType } from "@portfolio/db";

export interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "email" | "number" | "image" | "file";
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
    { key: "imageId", label: "Image", type: "image" },
  ],
  [SectionType.ABOUT]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "body", label: "Body", type: "richtext", required: true },
    { key: "imageId", label: "Image", type: "image" },
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
    { key: "fileUrl", label: "File URL", type: "file", required: true },
    { key: "ctaLabel", label: "CTA label", type: "text" },
  ],
};

// These section types only hold display config (heading/subheading/limit) —
// the actual list items live in their own tables, managed on a dedicated
// admin page. The composer surfaces that link so "why are there only two
// fields here" doesn't read as broken.
export const sectionDataSource: Partial<Record<SectionType, { label: string; href: string }>> = {
  [SectionType.PROJECTS]: { label: "Projects", href: "/admin/projects" },
  [SectionType.EXPERIENCE]: { label: "Experience", href: "/admin/experience" },
  [SectionType.SKILLS]: { label: "Skills", href: "/admin/skills" },
  [SectionType.SERVICES]: { label: "Services", href: "/admin/services" },
  [SectionType.TESTIMONIALS]: { label: "Testimonials", href: "/admin/testimonials" },
  [SectionType.BLOG]: { label: "Posts", href: "/admin/posts" },
};
