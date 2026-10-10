import { LIMITS, MAX_OUTPUT_TOKENS, TIMEOUTS } from "./config";
import { dedupeTopics, slugify, type KnownContent } from "./dedupe";
import { FEW_SHOT_EXAMPLES } from "./few-shot.config";
import { addUsage, llm, type LlmUsage } from "./llm";
import { RESEARCH, TOPIC_DISCOVERY, WRITING } from "./prompts";
import { fetchReadable, type ReadablePage } from "./safe-fetch";
import {
  parseJsonLoose,
  validateBrief,
  validateDiscovery,
  validatePost,
  type GeneratedPost,
  type ResearchBrief,
  type Topic,
  type ValidationResult,
} from "./schemas";
import { fetchTrendCandidates, normalizeUrlKey, selectCandidates, type SourceReport } from "./sources";
import { loadStyleGuide } from "./style";
import {
  checkCodeBlocks,
  countWords,
  ensureSourcesSection,
  sanitizePostHtml,
} from "./validate-post";

export class StageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StageError";
  }
}

const MIN_BODY_WORDS = 600;

interface JsonCallParams<T> {
  system: string;
  prompt: string;
  validate: (input: unknown) => ValidationResult<T>;
  maxTokens: number;
  timeoutMs: number;
  repairTimeoutMs: number;
  buildRepairPrompt: (previous: string, errors: string[]) => string;
  extraChecks?: (value: T) => { hard: string[]; soft: string[] };
}

interface JsonCallResult<T> {
  value: T;
  usage: LlmUsage;
  repaired: boolean;
  softIssues: string[];
}

function evaluate<T>(
  text: string,
  params: JsonCallParams<T>,
): { value: T | null; hard: string[]; soft: string[] } {
  let parsed: unknown;
  try {
    parsed = parseJsonLoose(text);
  } catch (error) {
    return { value: null, hard: [error instanceof Error ? error.message : "Response was not valid JSON"], soft: [] };
  }

  const result = params.validate(parsed);
  if (!result.ok) return { value: null, hard: result.errors, soft: [] };

  const extra = params.extraChecks?.(result.value) ?? { hard: [], soft: [] };
  return { value: result.value, hard: extra.hard, soft: extra.soft };
}

async function completeValidated<T>(params: JsonCallParams<T>): Promise<JsonCallResult<T>> {
  const first = await llm.complete({
    system: params.system,
    prompt: params.prompt,
    json: true,
    maxTokens: params.maxTokens,
    timeoutMs: params.timeoutMs,
  });
  let usage = first.usage;

  const firstCheck = evaluate(first.text, params);
  if (firstCheck.value && firstCheck.hard.length === 0 && firstCheck.soft.length === 0) {
    return { value: firstCheck.value, usage, repaired: false, softIssues: [] };
  }

  const problems = [...firstCheck.hard, ...firstCheck.soft];
  const repair = await llm.complete({
    system: params.system,
    prompt: params.buildRepairPrompt(first.text, problems),
    json: true,
    maxTokens: params.maxTokens,
    timeoutMs: params.repairTimeoutMs,
  });
  usage = addUsage(usage, repair.usage);

  const secondCheck = evaluate(repair.text, params);
  if (!secondCheck.value || secondCheck.hard.length > 0) {
    const errors = [...secondCheck.hard].slice(0, 6).join("; ");
    throw new StageError(`The model's output was still invalid after one repair attempt: ${errors}`);
  }

  return { value: secondCheck.value, usage, repaired: true, softIssues: secondCheck.soft };
}

function genericRepair(previous: string, errors: string[]): string {
  return WRITING.buildRepairPrompt({ previous, errors });
}

export interface DiscoveryOutcome {
  topics: Topic[];
  usage: LlmUsage;
  reports: SourceReport[];
  droppedDuplicates: { topic: string; duplicateOf: string }[];
}

export async function discoverTopics(params: {
  count: number;
  focus: string | null;
  known: KnownContent[];
}): Promise<DiscoveryOutcome> {
  const { candidates: allCandidates, reports } = await fetchTrendCandidates();
  if (allCandidates.length === 0) {
    const detail = reports.map((report) => `${report.label}: ${report.error ?? "no items"}`).join("; ");
    throw new StageError(`No trending source could be reached. ${detail}`);
  }

  const candidates = selectCandidates(allCandidates, params.focus, LIMITS.maxCandidatesForPrompt);
  const requested = params.count + 2;

  const result = await completeValidated<Topic[]>({
    system: TOPIC_DISCOVERY.system,
    prompt: TOPIC_DISCOVERY.buildPrompt({
      candidates,
      count: requested,
      focus: params.focus,
      existingTitles: params.known.slice(0, 120).map((item) => item.title),
    }),
    validate: validateDiscovery,
    maxTokens: MAX_OUTPUT_TOKENS.discovery,
    timeoutMs: TIMEOUTS.discoveryMs,
    repairTimeoutMs: TIMEOUTS.repairMs,
    buildRepairPrompt: genericRepair,
  });

  const knownUrls = new Map(candidates.map((candidate) => [normalizeUrlKey(candidate.url), candidate.url]));
  const grounded = result.value
    .map((topic) => ({
      ...topic,
      source_urls: [
        ...new Set(
          topic.source_urls
            .map((url) => knownUrls.get(normalizeUrlKey(url)))
            .filter((url): url is string => Boolean(url)),
        ),
      ].slice(0, LIMITS.maxSourceUrlsPerTopic),
    }))
    .filter((topic) => topic.source_urls.length > 0);

  const { kept, dropped } = dedupeTopics(grounded, params.known);
  const topics = kept.slice(0, params.count);

  if (topics.length === 0) {
    throw new StageError(
      "Every topic the model proposed duplicated an existing post or draft, or cited unknown links. Try again later or change the focus keyword.",
    );
  }

  return {
    topics,
    usage: result.usage,
    reports,
    droppedDuplicates: dropped.map((entry) => ({ topic: entry.item.topic, duplicateOf: entry.duplicateOf })),
  };
}

export interface ResearchOutcome {
  brief: ResearchBrief;
  usage: LlmUsage;
  pagesRead: number;
  skipped: { url: string; reason: string }[];
}

export async function researchTopic(topic: Topic): Promise<ResearchOutcome> {
  const urls = topic.source_urls.slice(0, LIMITS.maxSourceUrlsPerTopic);
  const settled = await Promise.allSettled(urls.map((url) => fetchReadable(url)));

  const pages: ReadablePage[] = [];
  const skipped: { url: string; reason: string }[] = [];
  let budget = LIMITS.maxCharsTotalPerTopic;

  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      skipped.push({
        url: urls[index],
        reason: result.reason instanceof Error ? result.reason.message : "fetch failed",
      });
      return;
    }
    if (budget <= 0) return;
    const page = result.value;
    const text = page.text.length > budget ? page.text.slice(0, budget) : page.text;
    budget -= text.length;
    pages.push({ ...page, text });
  });

  if (pages.length === 0) {
    const reasons = skipped.map((entry) => `${new URL(entry.url).hostname} (${entry.reason})`).join(", ");
    throw new StageError(`None of the source pages could be read: ${reasons}`);
  }

  const result = await completeValidated<ResearchBrief>({
    system: RESEARCH.system,
    prompt: RESEARCH.buildPrompt({ topic, pages }),
    validate: validateBrief,
    maxTokens: MAX_OUTPUT_TOKENS.research,
    timeoutMs: TIMEOUTS.researchMs,
    repairTimeoutMs: TIMEOUTS.repairMs,
    buildRepairPrompt: genericRepair,
  });

  const readKeys = new Map(
    pages.flatMap((page) => [
      [normalizeUrlKey(page.url), page] as const,
      [normalizeUrlKey(page.finalUrl), page] as const,
    ]),
  );
  const cited = result.value.sources_used
    .map((source) => {
      const page = readKeys.get(normalizeUrlKey(source.url));
      return page ? { url: page.url, title: source.title } : null;
    })
    .filter((source): source is { url: string; title: string } => source !== null);

  const sourcesUsed = cited.length
    ? cited
    : pages.map((page) => ({ url: page.url, title: page.title || new URL(page.url).hostname }));

  return {
    brief: { ...result.value, sources_used: sourcesUsed },
    usage: result.usage,
    pagesRead: pages.length,
    skipped,
  };
}

export interface WritingOutcome {
  post: GeneratedPost;
  usage: LlmUsage;
  warnings: string[];
  repaired: boolean;
}

export async function writePost(params: { topic: Topic; brief: ResearchBrief }): Promise<WritingOutcome> {
  const { text: styleGuide } = await loadStyleGuide();
  const allowedUrls = new Map(
    params.brief.sources_used.map((source) => [normalizeUrlKey(source.url), source.url]),
  );

  const result = await completeValidated<GeneratedPost>({
    system: WRITING.system,
    prompt: WRITING.buildPrompt({
      topic: params.topic,
      brief: params.brief,
      styleGuide,
      examples: FEW_SHOT_EXAMPLES,
    }),
    validate: validatePost,
    maxTokens: MAX_OUTPUT_TOKENS.writing,
    timeoutMs: TIMEOUTS.writingMs,
    repairTimeoutMs: TIMEOUTS.repairMs,
    buildRepairPrompt: genericRepair,
    extraChecks: (post) => {
      const hard: string[] = [];
      const soft: string[] = [];
      const words = countWords(post.body);
      if (words < MIN_BODY_WORDS) soft.push(`body: only ${words} words, expected at least ${MIN_BODY_WORDS}`);
      for (const issue of checkCodeBlocks(post.body)) {
        soft.push(`code block (${issue.language}) has a syntax error: ${issue.message}`);
      }
      const grounded = post.source_urls.filter((url) => allowedUrls.has(normalizeUrlKey(url)));
      if (grounded.length === 0) hard.push("source_urls: must contain urls from the research brief's sources_used");
      return { hard, soft };
    },
  });

  const grounded = [
    ...new Set(
      result.value.source_urls
        .map((url) => allowedUrls.get(normalizeUrlKey(url)))
        .filter((url): url is string => Boolean(url)),
    ),
  ];

  const sourceLinks = params.brief.sources_used.filter((source) => grounded.includes(source.url));
  const body = ensureSourcesSection(sanitizePostHtml(result.value.body), sourceLinks);

  const tags = [...new Set(result.value.tags.map((tag) => tag.replace(/^#/, "").trim()).filter(Boolean))];
  const slug = slugify(result.value.slug) || slugify(result.value.title);

  const post: GeneratedPost = {
    ...result.value,
    slug,
    body,
    tags,
    ai_generated: true,
    source_urls: grounded,
  };

  return { post, usage: result.usage, warnings: result.softIssues, repaired: result.repaired };
}
