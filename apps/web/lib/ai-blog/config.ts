export const DEFAULT_BASE_URL = "https://api.experientiallabs.ai/v1";
export const DEFAULT_MODEL = "claude-haiku-5.5";

export const LIMITS = {
  defaultPosts: 3,
  maxPosts: 5,
  maxRunsPerHour: 6,
  staleRunMs: 10 * 60 * 1000,
  maxFocusLength: 80,
  maxCandidatesForPrompt: 60,
  maxSourceUrlsPerTopic: 4,
  maxCharsPerPage: 9000,
  maxCharsTotalPerTopic: 24000,
  fetchTimeoutMs: 10000,
  maxPageBytes: 1_500_000,
  maxRedirects: 3,
} as const;

export const TIMEOUTS = {
  discoveryMs: 40000,
  researchMs: 35000,
  writingMs: 50000,
  repairMs: 40000,
} as const;

export const MAX_OUTPUT_TOKENS = {
  discovery: 2000,
  research: 3000,
  writing: 7000,
} as const;

export const USER_AGENT = "KumarKaranBlogBot/1.0 (+https://www.kumarkaran.com)";

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function readLlmConfig(): LlmConfig | null {
  const apiKey = process.env.EXPLABS_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.EXPLABS_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model: process.env.EXPLABS_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export function isLlmConfigured(): boolean {
  return readLlmConfig() !== null;
}
