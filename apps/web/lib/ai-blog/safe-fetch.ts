import { lookup } from "node:dns/promises";
import net from "node:net";
import { LIMITS, USER_AGENT } from "./config";
import { extractReadableText } from "./extract";
import { isPathAllowed, parseRobots, type RobotsRules } from "./robots";

export class FetchSkipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchSkipError";
  }
}

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

const BLOCKED_V4_RANGES: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

export function isPrivateAddress(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) {
    const value = ipv4ToInt(ip);
    return BLOCKED_V4_RANGES.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
      return (value & mask) >>> 0 === (ipv4ToInt(base) & mask) >>> 0;
    });
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return /^f[cd]/.test(lower) || /^fe[89ab]/.test(lower) || lower.startsWith("ff");
  }
  return true;
}

async function assertPublicHost(hostname: string): Promise<void> {
  const bare = hostname.replace(/^\[|\]$/g, "");
  if (bare === "localhost" || bare.endsWith(".localhost") || bare.endsWith(".internal")) {
    throw new FetchSkipError("blocked host");
  }
  if (net.isIP(bare)) {
    if (isPrivateAddress(bare)) throw new FetchSkipError("blocked address");
    return;
  }
  let addresses: { address: string }[];
  try {
    addresses = await lookup(bare, { all: true });
  } catch {
    throw new FetchSkipError("DNS lookup failed");
  }
  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new FetchSkipError("blocked address");
  }
}

function parsePublicUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchSkipError("invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new FetchSkipError("unsupported protocol");
  if (url.username || url.password) throw new FetchSkipError("credentials in URL");
  if (url.port && url.port !== "80" && url.port !== "443") throw new FetchSkipError("unsupported port");
  return url;
}

interface FetchedBody {
  finalUrl: string;
  status: number;
  contentType: string;
  body: string;
}

async function readBodyLimited(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      chunks.push(value.subarray(0, value.byteLength - (total - maxBytes)));
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
}

export async function fetchPublic(
  rawUrl: string,
  options: { timeoutMs?: number; maxBytes?: number; accept?: string } = {},
): Promise<FetchedBody> {
  const timeoutMs = options.timeoutMs ?? LIMITS.fetchTimeoutMs;
  const maxBytes = options.maxBytes ?? LIMITS.maxPageBytes;
  const deadline = AbortSignal.timeout(timeoutMs);
  let current = parsePublicUrl(rawUrl);

  for (let hop = 0; hop <= LIMITS.maxRedirects; hop++) {
    await assertPublicHost(current.hostname);

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: deadline,
        cache: "no-store",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: options.accept ?? "text/html,application/xhtml+xml,text/plain;q=0.8",
        },
      });
    } catch (error) {
      if (deadline.aborted) throw new FetchSkipError(`timed out after ${timeoutMs}ms`);
      throw new FetchSkipError(error instanceof Error ? error.message : "network error");
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new FetchSkipError(`redirect without location (HTTP ${response.status})`);
      await response.body?.cancel();
      current = parsePublicUrl(new URL(location, current).toString());
      continue;
    }

    let body: string;
    try {
      body = await readBodyLimited(response, maxBytes);
    } catch {
      throw new FetchSkipError(deadline.aborted ? `timed out after ${timeoutMs}ms` : "body read failed");
    }

    return {
      finalUrl: current.toString(),
      status: response.status,
      contentType: response.headers.get("content-type") ?? "",
      body,
    };
  }

  throw new FetchSkipError("too many redirects");
}

const robotsCache = new Map<string, { rules: RobotsRules | null; expiresAt: number }>();
const ROBOTS_TTL_MS = 10 * 60 * 1000;

async function loadRobots(origin: string): Promise<RobotsRules | null> {
  const cached = robotsCache.get(origin);
  if (cached && cached.expiresAt > Date.now()) return cached.rules;

  let rules: RobotsRules | null;
  try {
    const result = await fetchPublic(`${origin}/robots.txt`, {
      timeoutMs: 5000,
      maxBytes: 300_000,
      accept: "text/plain",
    });
    if (result.status >= 500) rules = { rules: [{ allow: false, pattern: "/" }] };
    else if (result.status >= 400) rules = { rules: [] };
    else rules = parseRobots(result.body, USER_AGENT.split("/")[0]);
  } catch {
    rules = { rules: [{ allow: false, pattern: "/" }] };
  }

  robotsCache.set(origin, { rules, expiresAt: Date.now() + ROBOTS_TTL_MS });
  return rules;
}

function rewriteForReadme(url: URL): string {
  if (url.hostname !== "github.com") return url.toString();
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return url.toString();
  return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/HEAD/README.md`;
}

export interface ReadablePage {
  url: string;
  finalUrl: string;
  title: string;
  text: string;
}

export async function fetchReadable(rawUrl: string, maxChars = LIMITS.maxCharsPerPage): Promise<ReadablePage> {
  const original = parsePublicUrl(rawUrl);
  const target = parsePublicUrl(rewriteForReadme(original));

  const robots = await loadRobots(target.origin);
  if (robots && !isPathAllowed(robots, `${target.pathname}${target.search}`)) {
    throw new FetchSkipError("disallowed by robots.txt");
  }

  const result = await fetchPublic(target.toString());
  if (result.status >= 400) throw new FetchSkipError(`HTTP ${result.status}`);

  const isHtml = /html|xml/i.test(result.contentType);
  const isText = /text\/plain|markdown/i.test(result.contentType);
  if (!isHtml && !isText) throw new FetchSkipError(`unsupported content type "${result.contentType || "unknown"}"`);

  if (isText && !isHtml) {
    const text = result.body.trim();
    if (text.length < 200) throw new FetchSkipError("too little readable text");
    return {
      url: rawUrl,
      finalUrl: result.finalUrl,
      title: original.pathname.split("/").filter(Boolean).join("/") || original.hostname,
      text: text.length > maxChars ? `${text.slice(0, maxChars).trimEnd()}…` : text,
    };
  }

  const extracted = extractReadableText(result.body, maxChars);
  if (extracted.text.length < 300) throw new FetchSkipError("too little readable text");
  return { url: rawUrl, finalUrl: result.finalUrl, title: extracted.title, text: extracted.text };
}
