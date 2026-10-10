import * as nodeModule from "node:module";
import vm from "node:vm";
import sanitizeHtml from "sanitize-html";
import { decodeEntities } from "./extract";

const ALLOWED_TAGS = [
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "hr",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel"],
      code: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedClasses: { code: ["language-*"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      h1: "h2",
      h5: "h4",
      h6: "h4",
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}

export function countWords(html: string): number {
  const text = decodeEntities(html.replace(/<pre\b[\s\S]*?<\/pre>/gi, " ").replace(/<[^>]+>/g, " "));
  return text.split(/\s+/).filter(Boolean).length;
}

export interface SourceLink {
  url: string;
  title: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function ensureSourcesSection(html: string, sources: SourceLink[]): string {
  if (/<h2\b[^>]*>\s*sources\s*<\/h2>/i.test(html)) return html;
  const items = sources
    .map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a></li>`)
    .join("");
  return `${html}<h2>Sources</h2><ul>${items}</ul>`;
}

export interface CodeIssue {
  language: string;
  message: string;
}

const JS_LANGUAGES = new Set(["js", "javascript", "mjs", "cjs", "node"]);
const TS_LANGUAGES = new Set(["ts", "typescript"]);

function toRunnableScript(code: string): string {
  return code
    .replace(/^\s*import\s[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/gm, "");
}

function checkJavaScript(code: string): string | null {
  try {
    new vm.Script(`(async () => {\n${toRunnableScript(code)}\n})`);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "syntax error";
  }
}

function checkTypeScript(code: string): string | null {
  const strip = (nodeModule as { stripTypeScriptTypes?: (code: string, options?: { mode?: string }) => string })
    .stripTypeScriptTypes;
  if (typeof strip !== "function") return null;
  try {
    return checkJavaScript(strip(code, { mode: "transform" }));
  } catch (error) {
    return error instanceof Error ? error.message : "syntax error";
  }
}

export function checkCodeBlocks(html: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const pattern = /<pre\b[^>]*>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

  for (const match of html.matchAll(pattern)) {
    const language = match[1].match(/language-([a-z0-9+#-]+)/i)?.[1]?.toLowerCase() ?? "";
    const code = decodeEntities(match[2].replace(/<[^>]+>/g, ""));
    if (!language || !code.trim()) continue;

    let message: string | null = null;
    if (JS_LANGUAGES.has(language)) message = checkJavaScript(code);
    else if (TS_LANGUAGES.has(language)) message = checkTypeScript(code);
    else if (language === "json") {
      try {
        JSON.parse(code);
      } catch (error) {
        message = error instanceof Error ? error.message : "invalid JSON";
      }
    }

    if (message) issues.push({ language, message: message.split("\n")[0].slice(0, 200) });
  }

  return issues;
}
