export interface SimpleField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "number" | "date" | "url" | "tags" | "boolean";
  required?: boolean;
  booleanLabel?: string;
}

export type SimpleContentType =
  | "experience"
  | "education"
  | "skill"
  | "language"
  | "service"
  | "testimonial"
  | "author"
  | "redirect"
  | "techStack";

export interface SimpleContentSummary {
  primary: string;
  secondary?: string;
}

export const simpleContentSummaries: Record<
  SimpleContentType,
  (item: Record<string, unknown>) => SimpleContentSummary
> = {
  experience: (item) => ({
    primary: `${item.title as string} — ${item.company as string}`,
  }),
  education: (item) => ({
    primary: `${item.degree as string} — ${item.institution as string}`,
  }),
  skill: (item) => ({
    primary: item.name as string,
    secondary: (item.category as string) || undefined,
  }),
  language: (item) => ({
    primary: item.name as string,
    secondary: item.proficiency as string,
  }),
  service: (item) => ({ primary: item.title as string }),
  testimonial: (item) => ({
    primary: item.authorName as string,
    secondary: (item.authorRole as string) || undefined,
  }),
  author: (item) => ({ primary: item.name as string, secondary: item.slug as string }),
  redirect: (item) => ({
    primary: `${item.fromPath as string} → ${item.toPath as string}`,
    secondary: (item.statusCode as number) === 308 ? "Permanent" : "Temporary",
  }),
  techStack: (item) => ({
    primary: item.name as string,
    secondary: item.imageUrl ? undefined : "No image yet — showing fallback icon",
  }),
};

export const experienceFields: SimpleField[] = [
  { key: "company", label: "Company", type: "text", required: true },
  { key: "title", label: "Title", type: "text", required: true },
  { key: "startDate", label: "Start date", type: "date", required: true },
  { key: "endDate", label: "End date", type: "date" },
  { key: "description", label: "Description", type: "richtext" },
];

export const educationFields: SimpleField[] = [
  { key: "institution", label: "Institution", type: "text", required: true },
  { key: "degree", label: "Degree", type: "text", required: true },
  { key: "location", label: "Location", type: "text" },
  { key: "startDate", label: "Start date", type: "date", required: true },
  { key: "endDate", label: "End date", type: "date" },
  { key: "description", label: "Description", type: "richtext" },
];

export const skillFields: SimpleField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "category", label: "Category", type: "text" },
  { key: "level", label: "Level (1-5)", type: "number" },
];

export const languageFields: SimpleField[] = [
  { key: "name", label: "Language", type: "text", required: true },
  { key: "proficiency", label: "Proficiency", type: "text", required: true },
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

export const redirectFields: SimpleField[] = [
  { key: "fromPath", label: "From path", type: "text", required: true },
  { key: "toPath", label: "To path", type: "text", required: true },
  { key: "permanent", label: "Permanent", type: "boolean", booleanLabel: "Permanent (308)" },
];

export const techStackFields: SimpleField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  {
    key: "imageUrl",
    label: "Logo image URL (upload it in Media, then paste the URL here)",
    type: "url",
  },
];

export type LocalizedListKey =
  | "experience"
  | "education"
  | "skill"
  | "language"
  | "service"
  | "testimonial";

export interface LocalizedListConfig {
  contentType: SimpleContentType;
  shared: SimpleField[];
  translated: SimpleField[];
}

function pick(fields: SimpleField[], keys: string[]): SimpleField[] {
  return fields.filter((field) => keys.includes(field.key));
}

export const localizedListConfigs: Record<LocalizedListKey, LocalizedListConfig> = {
  experience: {
    contentType: "experience",
    shared: pick(experienceFields, ["startDate", "endDate"]),
    translated: pick(experienceFields, ["company", "title", "description"]),
  },
  education: {
    contentType: "education",
    shared: pick(educationFields, ["startDate", "endDate"]),
    translated: pick(educationFields, ["institution", "degree", "location", "description"]),
  },
  skill: {
    contentType: "skill",
    shared: pick(skillFields, ["level"]),
    translated: pick(skillFields, ["name", "category"]),
  },
  language: {
    contentType: "language",
    shared: [],
    translated: languageFields,
  },
  service: {
    contentType: "service",
    shared: [],
    translated: serviceFields,
  },
  testimonial: {
    contentType: "testimonial",
    shared: pick(testimonialFields, ["authorName", "avatarUrl"]),
    translated: pick(testimonialFields, ["authorRole", "quote"]),
  },
};
