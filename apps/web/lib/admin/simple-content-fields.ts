export interface SimpleField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "url";
  required?: boolean;
}

export type SimpleContentType = "experience" | "skill" | "service" | "testimonial";

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
