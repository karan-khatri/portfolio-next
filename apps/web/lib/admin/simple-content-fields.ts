export interface SimpleField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "url" | "tags" | "boolean";
  required?: boolean;
  // "boolean" fields render as a Switch; this is the label shown next to it
  // (falls back to `label` when omitted).
  booleanLabel?: string;
}

export type SimpleContentType =
  | "experience"
  | "skill"
  | "service"
  | "testimonial"
  | "author"
  | "navigationItem"
  | "redirect";

export interface SimpleContentSummary {
  primary: string;
  secondary?: string;
}

// Colocated with the field configs (rather than passed in from each server
// page.tsx as a prop) because a plain function can't cross the Server->Client
// component boundary — only the type key does, and this module resolves it
// client-side.
export const simpleContentSummaries: Record<
  SimpleContentType,
  (item: Record<string, unknown>) => SimpleContentSummary
> = {
  experience: (item) => ({
    primary: `${item.title as string} — ${item.company as string}`,
  }),
  skill: (item) => ({
    primary: item.name as string,
    secondary: (item.category as string) || undefined,
  }),
  service: (item) => ({ primary: item.title as string }),
  testimonial: (item) => ({
    primary: item.authorName as string,
    secondary: (item.authorRole as string) || undefined,
  }),
  author: (item) => ({ primary: item.name as string, secondary: item.slug as string }),
  navigationItem: (item) => ({ primary: item.label as string, secondary: item.href as string }),
  redirect: (item) => ({
    primary: `${item.fromPath as string} → ${item.toPath as string}`,
    secondary: (item.statusCode as number) === 308 ? "Permanent" : "Temporary",
  }),
};

export const experienceFields: SimpleField[] = [
  { key: "company", label: "Company", type: "text", required: true },
  { key: "title", label: "Title", type: "text", required: true },
  { key: "startDate", label: "Start date", type: "date", required: true },
  { key: "endDate", label: "End date", type: "date" },
  { key: "description", label: "Description", type: "textarea" },
];

export const skillFields: SimpleField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "category", label: "Category", type: "text" },
  { key: "level", label: "Level (1-5)", type: "number" },
];

export const serviceFields: SimpleField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
];

export const testimonialFields: SimpleField[] = [
  { key: "authorName", label: "Author name", type: "text", required: true },
  { key: "authorRole", label: "Author role", type: "text" },
  { key: "quote", label: "Quote", type: "textarea", required: true },
  { key: "avatarUrl", label: "Avatar URL", type: "url" },
];

export const authorFields: SimpleField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "imageUrl", label: "Image URL", type: "url" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "sameAs", label: "Links", type: "tags" },
];

export const navigationItemFields: SimpleField[] = [
  { key: "label", label: "Label", type: "text", required: true },
  { key: "href", label: "Link", type: "text", required: true },
];

export const redirectFields: SimpleField[] = [
  { key: "fromPath", label: "From path", type: "text", required: true },
  { key: "toPath", label: "To path", type: "text", required: true },
  { key: "permanent", label: "Permanent", type: "boolean", booleanLabel: "Permanent (308)" },
];
