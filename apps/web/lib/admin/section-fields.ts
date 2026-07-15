import { SectionType } from "@portfolio/db";

export interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "email" | "number" | "image" | "file" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
}

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
    {
      key: "displayMode",
      label: "Display as",
      type: "select",
      options: [
        { value: "list", label: "List — all published projects, newest first" },
        { value: "featured", label: "Featured — your hand-picked, ordered set" },
        { value: "slider", label: "Slider — the same featured set as a carousel" },
      ],
    },
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

export const sectionDataSource: Partial<Record<SectionType, { label: string; href: string }>> = {
  [SectionType.PROJECTS]: { label: "Projects", href: "/admin/projects" },
  [SectionType.EXPERIENCE]: { label: "Experience", href: "/admin/experience" },
  [SectionType.SKILLS]: { label: "Skills", href: "/admin/skills" },
  [SectionType.SERVICES]: { label: "Services", href: "/admin/services" },
  [SectionType.TESTIMONIALS]: { label: "Testimonials", href: "/admin/testimonials" },
  [SectionType.BLOG]: { label: "Posts", href: "/admin/posts" },
};
