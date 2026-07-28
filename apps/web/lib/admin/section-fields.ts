import { SectionType } from "@portfolio/db";
import type {
  AboutContent,
  BlogContent,
  ContactContent,
  EducationContent,
  ExperienceContent,
  HeroContent,
  LanguagesContent,
  NowContent,
  ProjectsContent,
  ResumeContent,
  ServicesContent,
  SkillsContent,
  TestimonialsContent,
} from "@portfolio/sections";

export interface SectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "email" | "number" | "image" | "file" | "select" | "boolean" | "list";
  required?: boolean;
  options?: { value: string; label: string }[];
  /** For type "list" — the per-item sub-fields (item is a plain object keyed by these). */
  itemFields?: SectionField[];
}

// Same shape as SectionField, but `key` is constrained to an actual key of
// the section's real Zod-inferred content type — so a typo'd or renamed
// field (the exact "schema/prop drift" finding #1 flagged on the render
// side) fails typecheck here too, on the composer/editing side, instead of
// silently producing a field that reads/writes nothing.
type StrictSectionField<TContent> = Omit<SectionField, "key" | "itemFields"> & {
  key: Extract<keyof TContent, string>;
  itemFields?: SectionField[];
};

const LAYOUT_FIELDS = [
  { key: "showEyebrow" as const, label: "Show eyebrow label (e.g. \"// contact\")", type: "boolean" as const },
  {
    key: "headingAlign" as const,
    label: "Heading alignment",
    type: "select" as const,
    options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
      { value: "right", label: "Right" },
    ],
  },
] satisfies SectionField[];

const strictSectionFields = {
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
    { key: "imageId", label: "Image (replaces the terminal panel if set)", type: "image" },
    { key: "location", label: "Stat: Location", type: "text" },
    { key: "focusTag", label: "Stat: Focus (short tag)", type: "text" },
    { key: "education", label: "Stat: Education", type: "text" },
    { key: "status", label: "Stat: Status", type: "text" },
    { key: "terminalTitle", label: "Terminal window title", type: "text" },
    { key: "role", label: "Terminal: Role", type: "text" },
    { key: "focusDetail", label: "Terminal: Focus (detail)", type: "text" },
    { key: "currently", label: "Terminal: Currently", type: "text" },
    ...LAYOUT_FIELDS,
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
    ...LAYOUT_FIELDS,
  ],
  [SectionType.EXPERIENCE]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.EDUCATION]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.SKILLS]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "showDiagram", label: "Show tech-stack orbit diagram", type: "boolean" },
    { key: "diagramCenterLabel", label: "Diagram: Center label", type: "text" },
    { key: "diagramCenterSubtitle", label: "Diagram: Center subtitle", type: "text" },
    { key: "diagramTopLeftTitle", label: "Diagram: Top-left cluster title", type: "text" },
    {
      key: "diagramTopLeftItems",
      label: "Diagram: Top-left cluster items (first is featured)",
      type: "list",
      itemFields: [{ key: "label", label: "Label", type: "text", required: true }],
    },
    { key: "diagramBottomLeftTitle", label: "Diagram: Bottom-left cluster title", type: "text" },
    {
      key: "diagramBottomLeftItems",
      label: "Diagram: Bottom-left cluster items (first is featured)",
      type: "list",
      itemFields: [{ key: "label", label: "Label", type: "text", required: true }],
    },
    { key: "diagramTopRightTitle", label: "Diagram: Top-right cluster title", type: "text" },
    {
      key: "diagramTopRightItems",
      label: "Diagram: Top-right cluster items (first is featured)",
      type: "list",
      itemFields: [{ key: "label", label: "Label", type: "text", required: true }],
    },
    { key: "diagramBottomRightTitle", label: "Diagram: Bottom-right cluster title", type: "text" },
    {
      key: "diagramBottomRightItems",
      label: "Diagram: Bottom-right cluster items (first is featured)",
      type: "list",
      itemFields: [{ key: "label", label: "Label", type: "text", required: true }],
    },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.LANGUAGES]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.SERVICES]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.TESTIMONIALS]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.BLOG]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "limit", label: "Max posts to show", type: "number" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.CONTACT]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "email", label: "Email", type: "email", required: true },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.RESUME]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "fileUrl", label: "File URL", type: "file", required: true },
    { key: "ctaLabel", label: "CTA label", type: "text" },
    ...LAYOUT_FIELDS,
  ],
  [SectionType.NOW]: [
    { key: "heading", label: "Heading", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "items",
      label: "Progress checklist",
      type: "list",
      itemFields: [
        { key: "label", label: "Label", type: "text", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "done", label: "Done" },
            { value: "in_progress", label: "In progress" },
            { value: "remaining", label: "Remaining" },
          ],
        },
      ],
    },
    ...LAYOUT_FIELDS,
  ],
} satisfies {
  [SectionType.HERO]: StrictSectionField<HeroContent>[];
  [SectionType.ABOUT]: StrictSectionField<AboutContent>[];
  [SectionType.PROJECTS]: StrictSectionField<ProjectsContent>[];
  [SectionType.EXPERIENCE]: StrictSectionField<ExperienceContent>[];
  [SectionType.EDUCATION]: StrictSectionField<EducationContent>[];
  [SectionType.SKILLS]: StrictSectionField<SkillsContent>[];
  [SectionType.LANGUAGES]: StrictSectionField<LanguagesContent>[];
  [SectionType.SERVICES]: StrictSectionField<ServicesContent>[];
  [SectionType.TESTIMONIALS]: StrictSectionField<TestimonialsContent>[];
  [SectionType.BLOG]: StrictSectionField<BlogContent>[];
  [SectionType.CONTACT]: StrictSectionField<ContactContent>[];
  [SectionType.RESUME]: StrictSectionField<ResumeContent>[];
  [SectionType.NOW]: StrictSectionField<NowContent>[];
};

// Widened for consumers (SectionForm, ListItemField, ...) that render fields
// generically across every section type and don't need — or want — a
// generic parameter of their own; the per-section key check above already
// happened at the point of authorship, which is where drift actually gets
// introduced.
export const sectionFields: Record<SectionType, SectionField[]> = strictSectionFields;

export const sectionDataSource: Partial<Record<SectionType, { label: string; href: string }>> = {
  [SectionType.PROJECTS]: { label: "Projects", href: "/admin/projects" },
  [SectionType.EXPERIENCE]: { label: "Experience", href: "/admin/experience" },
  [SectionType.EDUCATION]: { label: "Education", href: "/admin/education" },
  [SectionType.SKILLS]: { label: "Skills", href: "/admin/skills" },
  [SectionType.LANGUAGES]: { label: "Languages", href: "/admin/languages" },
  [SectionType.SERVICES]: { label: "Services", href: "/admin/services" },
  [SectionType.TESTIMONIALS]: { label: "Testimonials", href: "/admin/testimonials" },
  [SectionType.BLOG]: { label: "Posts", href: "/admin/posts" },
};
