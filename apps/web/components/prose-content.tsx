import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "strong",
  "em",
  "s",
  "u",
  "sub",
  "sup",
  "mark",
  "span",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "label",
  "input",
  "div",
];

// Plain hex or rgb()/rgba() colors only — no url()/expression()/javascript: payloads possible.
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;
const RGB_COLOR = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/;
const TEXT_ALIGN = /^(left|center|right|justify)$/;

function upgradeLegacyPlainText(value: string): string {
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

export function ProseContent({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeHtml(upgradeLegacyPlainText(html), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      span: ["style"],
      ul: ["data-type"],
      li: ["data-checked"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      input: [{ name: "type", values: ["checkbox"] }, "checked", "disabled"],
    },
    allowedStyles: {
      "*": { "text-align": [TEXT_ALIGN] },
      span: { color: [HEX_COLOR, RGB_COLOR] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
  });
  if (!clean) return null;

  return (
    <div
      className={cn(
        "text-lg leading-relaxed text-foreground/90",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded-sm [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
        "[&_h1]:font-heading [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold",
        "[&_h2]:font-heading [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold",
        "[&_h3]:font-heading [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_h4]:font-heading [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold",
        "[&_h5]:font-heading [&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:text-base [&_h5]:font-semibold",
        "[&_h6]:font-heading [&_h6]:mt-4 [&_h6]:mb-2 [&_h6]:text-base [&_h6]:font-semibold",
        "[&_mark]:rounded-sm [&_mark]:bg-primary/25 [&_mark]:text-foreground [&_mark]:px-0.5",
        "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_p]:my-4",
        "[&_li_p]:my-1",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse",
        "[&_th]:border [&_th]:border-border [&_th]:bg-white/5 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top",
        "[&_ul]:list-disc [&_ul]:pl-6",
        "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-1",
        "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
