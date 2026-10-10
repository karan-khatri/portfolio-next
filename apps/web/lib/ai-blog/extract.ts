const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  copy: "©",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return " ";
      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const NOISE_BLOCKS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  "object",
  "embed",
  "nav",
  "header",
  "footer",
  "aside",
  "form",
  "dialog",
  "button",
  "select",
  "picture",
  "video",
  "audio",
];

const NOISE_ATTRIBUTE_HINTS =
  /\b(?:cookie|consent|newsletter|subscribe|advert|ad-|ads-|sponsor|sidebar|breadcrumb|share|social|promo|popup|modal|banner|comment)\b/i;

function stripNoise(html: string): string {
  let result = html.replace(/<!--[\s\S]*?-->/g, " ");
  for (const tag of NOISE_BLOCKS) {
    result = result.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), " ");
  }
  result = result.replace(
    /<(div|section|ul|p|span)\b[^>]*\b(?:class|id)\s*=\s*["']([^"']*)["'][^>]*>[\s\S]*?<\/\1\s*>/gi,
    (match, _tag: string, hint: string) => (NOISE_ATTRIBUTE_HINTS.test(hint) && match.length < 1500 ? " " : match),
  );
  return result;
}

function pickMainRegion(html: string): string {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i);
  if (article && article[1].length > 600) return article[1];
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i);
  if (main && main[1].length > 600) return main[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  return body ? body[1] : html;
}

function blocksToText(html: string): string {
  return html
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre\s*>/gi, (_match, inner: string) => {
      const code = inner.replace(/<[^>]+>/g, "");
      return `\n\n[code]\n${code}\n[/code]\n\n`;
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|tr|h[1-6]|blockquote|ul|ol|table)\s*>/gi, "\n\n")
    .replace(/<h([1-6])\b[^>]*>/gi, "\n\n# ")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ");
}

function collapseWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t\f\v ]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface ExtractedPage {
  title: string;
  text: string;
}

export function extractReadableText(html: string, maxChars: number): ExtractedPage {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const title = decodeEntities((ogTitle?.[1] ?? titleMatch?.[1] ?? "").replace(/\s+/g, " ").trim());

  const region = pickMainRegion(stripNoise(html));
  const text = collapseWhitespace(decodeEntities(blocksToText(region)));

  return { title, text: text.length > maxChars ? `${text.slice(0, maxChars).trimEnd()}…` : text };
}
