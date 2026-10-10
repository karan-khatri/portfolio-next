import { readLlmConfig, type LlmConfig } from "./config";

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LlmCompletion {
  text: string;
  usage: LlmUsage;
  model: string;
  finishReason: string | null;
}

export interface LlmCompleteParams {
  system: string;
  prompt: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  maxAttempts?: number;
}

export class LlmError extends Error {
  readonly status: number | null;
  readonly retryable: boolean;
  readonly retryAfterMs: number | null;

  constructor(
    message: string,
    options: { status?: number | null; retryable?: boolean; retryAfterMs?: number | null } = {},
  ) {
    super(message);
    this.name = "LlmError";
    this.status = options.status ?? null;
    this.retryable = options.retryable ?? false;
    this.retryAfterMs = options.retryAfterMs ?? null;
  }
}

export const ZERO_USAGE: LlmUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

export function addUsage(a: LlmUsage, b: LlmUsage): LlmUsage {
  return {
    promptTokens: a.promptTokens + b.promptTokens,
    completionTokens: a.completionTokens + b.completionTokens,
    totalTokens: a.totalTokens + b.totalTokens,
  };
}

const DEFAULT_TIMEOUT_MS = 45000;
const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 800;
const MAX_BACKOFF_MS = 8000;

interface ChatCompletionResponse {
  model?: string;
  choices?: { message?: { content?: unknown }; finish_reason?: string | null }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string; type?: string; code?: string };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt: number, retryAfterMs: number | null): number {
  const exponential = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (attempt - 1));
  const jittered = exponential / 2 + Math.random() * (exponential / 2);
  return Math.max(jittered, retryAfterMs ?? 0);
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_BACKOFF_MS * 2);
  const date = Date.parse(header);
  if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), MAX_BACKOFF_MS * 2);
  return null;
}

function extractContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function describeApiError(status: number, body: ChatCompletionResponse | null, raw: string): string {
  const detail = body?.error?.message ?? raw.slice(0, 300);
  if (status === 401 || status === 403) {
    return `LLM authentication failed (HTTP ${status}). Check EXPLABS_API_KEY. ${detail}`.trim();
  }
  if (status === 404) {
    return `LLM endpoint or model not found (HTTP 404). Check EXPLABS_BASE_URL and EXPLABS_MODEL. ${detail}`.trim();
  }
  if (status === 429) return `LLM rate limit reached (HTTP 429). ${detail}`.trim();
  return `LLM request failed (HTTP ${status}). ${detail}`.trim();
}

interface RequestOptions {
  jsonMode: boolean;
  sendTemperature: boolean;
  tokenParam: "max_tokens" | "max_completion_tokens";
}

type RejectedParam = "json" | "temperature" | "max_tokens";

function detectRejectedParam(raw: string, options: RequestOptions): RejectedParam | null {
  if (options.jsonMode && /response_format|json_object|json mode/i.test(raw)) return "json";
  if (options.sendTemperature && /temperature/i.test(raw)) return "temperature";
  if (options.tokenParam === "max_tokens" && /max_tokens|max_completion_tokens/i.test(raw)) {
    return "max_tokens";
  }
  return null;
}

async function requestOnce(
  config: LlmConfig,
  params: LlmCompleteParams,
  options: RequestOptions,
): Promise<{ completion: LlmCompletion } | { rejected: RejectedParam }> {
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.prompt },
    ],
    [options.tokenParam]: params.maxTokens ?? 4000,
  };
  if (options.sendTemperature) body.temperature = params.temperature;
  if (options.jsonMode) body.response_format = { type: "json_object" };

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      throw new LlmError(`LLM request timed out after ${timeoutMs}ms`, { retryable: true });
    }
    throw new LlmError(
      `Could not reach the LLM API: ${error instanceof Error ? error.message : String(error)}`,
      { retryable: true },
    );
  }

  let raw: string;
  try {
    raw = await response.text();
  } catch (error) {
    clearTimeout(timer);
    throw new LlmError(
      controller.signal.aborted
        ? `LLM response timed out after ${timeoutMs}ms`
        : `LLM response was interrupted: ${error instanceof Error ? error.message : String(error)}`,
      { retryable: true },
    );
  }
  clearTimeout(timer);

  let parsed: ChatCompletionResponse | null = null;
  try {
    parsed = JSON.parse(raw) as ChatCompletionResponse;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    if (response.status === 400) {
      const rejected = detectRejectedParam(raw, options);
      if (rejected) return { rejected };
    }
    throw new LlmError(describeApiError(response.status, parsed, raw), {
      status: response.status,
      retryable: response.status === 429 || response.status >= 500 || response.status === 408,
      retryAfterMs: parseRetryAfter(response.headers.get("retry-after")),
    });
  }

  if (!parsed) {
    throw new LlmError(`LLM returned a non-JSON response: ${raw.slice(0, 200)}`, { retryable: true });
  }

  const choice = parsed.choices?.[0];
  const text = extractContent(choice?.message?.content);
  if (!text.trim()) {
    throw new LlmError(
      `LLM returned an empty completion (finish_reason: ${choice?.finish_reason ?? "unknown"}).`,
      { retryable: true },
    );
  }

  const promptTokens = parsed.usage?.prompt_tokens ?? 0;
  const completionTokens = parsed.usage?.completion_tokens ?? 0;

  return {
    completion: {
      text,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: parsed.usage?.total_tokens ?? promptTokens + completionTokens,
      },
      model: parsed.model ?? config.model,
      finishReason: choice?.finish_reason ?? null,
    },
  };
}

async function complete(params: LlmCompleteParams): Promise<LlmCompletion> {
  const config = readLlmConfig();
  if (!config) {
    throw new LlmError(
      "EXPLABS_API_KEY is not set. Add it to the server environment to use the AI Blog Generator.",
    );
  }

  const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const options: RequestOptions = {
    jsonMode: Boolean(params.json),
    sendTemperature: params.temperature !== undefined,
    tokenParam: "max_tokens",
  };
  let attempt = 1;

  for (;;) {
    try {
      const result = await requestOnce(config, params, options);
      if ("rejected" in result) {
        if (result.rejected === "json") options.jsonMode = false;
        else if (result.rejected === "temperature") options.sendTemperature = false;
        else options.tokenParam = "max_completion_tokens";
        continue;
      }
      return result.completion;
    } catch (error) {
      if (!(error instanceof LlmError) || !error.retryable || attempt >= maxAttempts) throw error;
      await sleep(backoffDelay(attempt, error.retryAfterMs));
      attempt++;
    }
  }
}

export const llm = { complete };
