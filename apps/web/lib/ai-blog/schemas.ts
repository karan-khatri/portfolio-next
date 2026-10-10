import { z } from "zod";

const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "must be an http(s) URL");

export const topicSchema = z.object({
  topic: z.string().trim().min(8).max(200),
  angle: z.string().trim().min(10).max(500),
  why_trending: z.string().trim().min(5).max(500),
  source_urls: z.array(httpUrl).min(1).max(6),
});

export const discoveryResultSchema = z.object({
  topics: z.array(topicSchema).min(1),
});

const stringList = z.array(z.string().trim().min(1)).default([]);

export const researchBriefSchema = z.object({
  summary: z.string().trim().min(20),
  key_facts: z.array(z.string().trim().min(1)).min(1),
  how_it_works: z.string().trim().min(20),
  code_concepts: stringList,
  common_pitfalls: stringList,
  sources_used: z
    .array(z.object({ url: httpUrl, title: z.string().trim().min(1).max(300) }))
    .min(1),
});

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const generatedPostSchema = z.object({
  title: z.string().trim().min(10).max(120),
  slug: z.string().trim().min(3).max(90).regex(SLUG_PATTERN, "lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().min(40).max(300),
  body: z.string().trim().min(800),
  tags: z.array(z.string().trim().min(1).max(40)).min(2).max(6),
  meta_title: z.string().trim().min(10).max(70),
  meta_description: z.string().trim().min(50).max(170),
  ai_generated: z.literal(true),
  source_urls: z.array(httpUrl).min(1).max(8),
});

export type Topic = z.infer<typeof topicSchema>;
export type ResearchBrief = z.infer<typeof researchBriefSchema>;
export type GeneratedPost = z.infer<typeof generatedPostSchema>;

export function parseJsonLoose(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? fenced[1] : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.search(/[{[]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start === -1 || end <= start) {
      throw new Error("Response did not contain JSON");
    }
    return JSON.parse(candidate.slice(start, end + 1));
  }
}

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function validate<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, errors: formatZodIssues(result.error) };
}

export function validateDiscovery(input: unknown): ValidationResult<Topic[]> {
  const normalized = Array.isArray(input) ? { topics: input } : input;
  const result = validate(discoveryResultSchema, normalized);
  if (!result.ok) return result;
  return { ok: true, value: result.value.topics };
}

export function validateBrief(input: unknown): ValidationResult<ResearchBrief> {
  return validate(researchBriefSchema, input);
}

export function validatePost(input: unknown): ValidationResult<GeneratedPost> {
  return validate(generatedPostSchema, input);
}
