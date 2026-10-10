import { readFile } from "node:fs/promises";

export const DEFAULT_STYLE_GUIDE = `Format: Post.body is HTML. Allowed tags: h2, h3, p, strong, em, code, pre>code, blockquote, ul, ol, li, a, table. Never use h1.
Length: 900 to 1400 words.
Structure: a hook of 2 to 3 sentences with no heading, then "What It Is", "How It Works" (step by step with a short working example), "Common Mistakes", "Takeaway", and a final "Sources" section.
Voice: first person, conversational, direct, honest about tradeoffs. Define jargon on first use, use analogies. Explain why the obvious approach fails before showing the better one.
Banned: filler, hype, emoji, cliches such as "In today's fast-paced world".`;

export async function loadStyleGuide(): Promise<{ text: string; fromFile: boolean }> {
  try {
    const text = (
      await readFile(new URL("../../../../docs/blog-style-guide.md", import.meta.url), "utf8")
    ).trim();
    if (text) return { text, fromFile: true };
  } catch {
    return { text: DEFAULT_STYLE_GUIDE, fromFile: false };
  }
  return { text: DEFAULT_STYLE_GUIDE, fromFile: false };
}
