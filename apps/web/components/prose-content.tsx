import DOMPurify from "isomorphic-dompurify";

// Renders Project/Post `body` HTML (authored via the admin RichTextEditor,
// Tiptap's StarterKit output) sanitized against XSS. No @tailwindcss/typography
// plugin in this app, so heading/list/quote/code spacing is a handful of
// arbitrary-variant utility overrides here rather than a new dependency.
export function ProseContent({ html, className }: { html: string; className?: string }) {
  const clean = DOMPurify.sanitize(html);
  if (!clean) return null;

  return (
    <div
      className={[
        "text-lg leading-relaxed text-foreground/90",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded-sm [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
        "[&_h2]:font-heading [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold",
        "[&_h3]:font-heading [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_p]:my-4",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_ul]:list-disc [&_ul]:pl-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
