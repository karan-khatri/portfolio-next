const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in", "into", "is", "it",
  "its", "of", "on", "or", "that", "the", "this", "to", "vs", "was", "what", "why", "with", "your",
  "you", "we", "i", "my", "our", "about", "using", "use", "guide", "intro", "introduction", "beginners",
  "beginner", "explained", "understanding", "complete", "simple", "practical",
]);

export interface KnownContent {
  title: string;
  slug?: string;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tokenize(value: string): Set<string> {
  const words = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/c\+\+/g, "cpp")
    .replace(/c#/g, "csharp")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem);
  return new Set(words);
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 3 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  const union = a.size + b.size - shared;
  const jaccard = shared / union;
  const containment = shared / Math.min(a.size, b.size);
  const containmentScore = Math.min(a.size, b.size) >= 3 ? containment * 0.9 : 0;
  return Math.max(jaccard, containmentScore);
}

export const DUPLICATE_THRESHOLD = 0.6;

export function findDuplicate(
  candidate: KnownContent,
  known: KnownContent[],
  threshold = DUPLICATE_THRESHOLD,
): KnownContent | null {
  const candidateSlug = candidate.slug ?? slugify(candidate.title);
  const candidateTokens = tokenize(candidate.title);

  for (const item of known) {
    const knownSlug = item.slug ?? slugify(item.title);
    if (candidateSlug && candidateSlug === knownSlug) return item;
    if (similarity(candidateTokens, tokenize(item.title)) >= threshold) return item;
  }
  return null;
}

export interface DedupeResult<T> {
  kept: T[];
  dropped: { item: T; duplicateOf: string }[];
}

export function dedupeTopics<T extends { topic: string }>(
  candidates: T[],
  known: KnownContent[],
  threshold = DUPLICATE_THRESHOLD,
): DedupeResult<T> {
  const kept: T[] = [];
  const dropped: { item: T; duplicateOf: string }[] = [];
  const pool: KnownContent[] = [...known];

  for (const candidate of candidates) {
    const match = findDuplicate({ title: candidate.topic }, pool, threshold);
    if (match) {
      dropped.push({ item: candidate, duplicateOf: match.title });
      continue;
    }
    kept.push(candidate);
    pool.push({ title: candidate.topic });
  }

  return { kept, dropped };
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base) || "post";
  if (!taken.has(root)) return root;
  for (let suffix = 2; suffix < 1000; suffix++) {
    const candidate = `${root}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}
