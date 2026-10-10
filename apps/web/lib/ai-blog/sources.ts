import { LIMITS, USER_AGENT } from "./config";
import { decodeEntities } from "./extract";
import {
  GITHUB_SEARCH_FALLBACK_URL,
  TREND_SOURCES,
  type TrendSource,
} from "./sources.config";

export interface Candidate {
  title: string;
  url: string;
  score: number;
  sourceId: string;
  sourceLabel: string;
}

export interface SourceReport {
  id: string;
  label: string;
  ok: boolean;
  count: number;
  error?: string;
}

async function getText(url: string, accept: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: accept },
    signal: AbortSignal.timeout(LIMITS.fetchTimeoutMs),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function getJson<T>(url: string): Promise<T> {
  return JSON.parse(await getText(url, "application/json")) as T;
}

function cleanTitle(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export function parseHackerNews(json: unknown, source: TrendSource): Candidate[] {
  const hits = (json as { hits?: { title?: string; url?: string | null; points?: number; objectID?: string }[] })
    .hits;
  if (!Array.isArray(hits)) return [];
  return hits
    .filter((hit) => hit.title)
    .map((hit) => ({
      title: cleanTitle(hit.title ?? ""),
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      score: hit.points ?? 0,
      sourceId: source.id,
      sourceLabel: source.label,
    }));
}

export function parseDevTo(json: unknown, source: TrendSource): Candidate[] {
  if (!Array.isArray(json)) return [];
  return (json as { title?: string; url?: string; positive_reactions_count?: number }[])
    .filter((article) => article.title && article.url)
    .map((article) => ({
      title: cleanTitle(article.title ?? ""),
      url: article.url ?? "",
      score: article.positive_reactions_count ?? 0,
      sourceId: source.id,
      sourceLabel: source.label,
    }));
}

export function parseGithubTrending(html: string, source: TrendSource): Candidate[] {
  const candidates: Candidate[] = [];
  for (const block of html.split(/<article\b/i).slice(1)) {
    const href = block.match(/<h2\b[^>]*>\s*<a\b[^>]*href="(\/[^"/]+\/[^"/]+)"/i)?.[1];
    if (!href) continue;
    const description = block.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
    const stars = block.match(/([\d,]+)\s+stars?\s+(?:today|this week|this month)/i)?.[1];
    const name = href.slice(1);
    const summary = description ? cleanTitle(description) : "";
    candidates.push({
      title: summary ? `${name}: ${summary}` : name,
      url: `https://github.com${href}`,
      score: stars ? Number(stars.replace(/,/g, "")) : 0,
      sourceId: source.id,
      sourceLabel: source.label,
    });
  }
  return candidates;
}

export function parseGithubSearch(json: unknown, source: TrendSource): Candidate[] {
  const items = (json as { items?: { full_name?: string; description?: string | null; html_url?: string; stargazers_count?: number }[] })
    .items;
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item.full_name && item.html_url)
    .map((item) => ({
      title: item.description ? `${item.full_name}: ${cleanTitle(item.description)}` : (item.full_name ?? ""),
      url: item.html_url ?? "",
      score: item.stargazers_count ?? 0,
      sourceId: source.id,
      sourceLabel: source.label,
    }));
}

export function parseRedditAtom(xml: string, source: TrendSource): Candidate[] {
  const entries = xml.split(/<entry>/i).slice(1);
  const candidates: Candidate[] = [];

  entries.forEach((entry, index) => {
    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const threadUrl = entry.match(/<link[^>]+href="([^"]+)"/i)?.[1];
    const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1];
    if (!title || !threadUrl) return;

    const decodedContent = content ? decodeEntities(decodeEntities(content)) : "";
    const external = decodedContent.match(/<a\s+href="([^"]+)">\s*\[link\]\s*<\/a>/i)?.[1];
    const url = decodeEntities(external ?? threadUrl);

    candidates.push({
      title: cleanTitle(title),
      url,
      score: Math.max(source.limit - index, 1),
      sourceId: source.id,
      sourceLabel: source.label,
    });
  });

  return candidates;
}

async function fetchGithubTrending(source: TrendSource): Promise<Candidate[]> {
  try {
    const parsed = parseGithubTrending(await getText(source.url, "text/html"), source);
    if (parsed.length > 0) return parsed;
  } catch {}

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `${GITHUB_SEARCH_FALLBACK_URL}?q=${encodeURIComponent(`created:>${since}`)}&sort=stars&order=desc&per_page=${source.limit}`;
  return parseGithubSearch(await getJson<unknown>(url), source);
}

async function fetchSource(source: TrendSource): Promise<Candidate[]> {
  switch (source.kind) {
    case "hackernews":
      return parseHackerNews(await getJson<unknown>(source.url), source);
    case "devto":
      return parseDevTo(await getJson<unknown>(source.url), source);
    case "github-trending":
      return fetchGithubTrending(source);
    case "reddit-rss":
      return parseRedditAtom(await getText(source.url, "application/atom+xml,application/xml"), source);
  }
}

export function normalizeUrlKey(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_")) parsed.searchParams.delete(key);
    }
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/+$/, "")}${parsed.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function selectCandidates(all: Candidate[], focus: string | null, limit: number): Candidate[] {
  const seen = new Set<string>();
  const unique = all.filter((candidate) => {
    const key = normalizeUrlKey(candidate.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const bySource = new Map<string, Candidate[]>();
  for (const candidate of unique) {
    const list = bySource.get(candidate.sourceId) ?? [];
    list.push(candidate);
    bySource.set(candidate.sourceId, list);
  }

  const needle = focus?.trim().toLowerCase();
  const ranked = [...bySource.values()].map((list) =>
    [...list].sort((a, b) => {
      const aMatch = needle && a.title.toLowerCase().includes(needle) ? 1 : 0;
      const bMatch = needle && b.title.toLowerCase().includes(needle) ? 1 : 0;
      return bMatch - aMatch || b.score - a.score;
    }),
  );

  const picked: Candidate[] = [];
  for (let round = 0; picked.length < limit; round++) {
    let added = false;
    for (const list of ranked) {
      if (round < list.length && picked.length < limit) {
        picked.push(list[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  return picked;
}

export async function fetchTrendCandidates(
  sources: TrendSource[] = TREND_SOURCES,
): Promise<{ candidates: Candidate[]; reports: SourceReport[] }> {
  const active = sources.filter((source) => source.enabled);
  const settled = await Promise.allSettled(active.map((source) => fetchSource(source)));

  const candidates: Candidate[] = [];
  const reports: SourceReport[] = settled.map((result, index) => {
    const source = active[index];
    if (result.status === "fulfilled") {
      const items = result.value.slice(0, source.limit);
      candidates.push(...items);
      return { id: source.id, label: source.label, ok: items.length > 0, count: items.length };
    }
    return {
      id: source.id,
      label: source.label,
      ok: false,
      count: 0,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });

  return { candidates, reports };
}
