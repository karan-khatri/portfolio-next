# Blog style guide

Used by the AI Blog Generator (Stage 3) as the style reference for every generated post.

**Source of this guide:** kumarkaran.com has no published posts yet (the live `/blog` page says "No posts published yet"), so there was nothing to sample. This guide combines the Stage 3 defaults with the one long-form piece of the author's writing that exists, the GoChat project write-up. Re-derive it from real posts once 2+ are published, and replace the few-shot example in `apps/web/lib/ai-blog/few-shot.config.ts`.

## Format the CMS expects

- `Post.body` is **HTML** (Tiptap output), not Markdown.
- Allowed on the public page: `h2`, `h3`, `p`, `strong`, `em`, `code`, `pre > code`, `blockquote`, `ul`/`ol`/`li`, `a`, `table`. No inline styles, scripts, or event handlers.
- Never use `h1` in the body. The post title is rendered as the page `h1`.
- Code blocks: `<pre><code class="language-ts">…</code></pre>`. Escape `<`, `>` and `&` inside code.
- Slug: lowercase letters, numbers and hyphens only, no leading or trailing hyphen (`/^[a-z0-9-]+$/`). Short, descriptive, no dates.
- Tags: 2 to 5. Proper nouns use their official capitalisation (`PostgreSQL`, `WebSockets`, `Docker`, `Go`); concepts use Title Case (`Microservices`, `Distributed Systems`). No `#`, no sentences.
- Excerpt: one or two sentences, 120 to 220 characters, plain text, no hype.

## Length and structure

- 900 to 1,400 words. Long enough to teach one thing properly, short enough to finish in one sitting.
- Section headings are `h2`, Title Case, short noun phrases or plain statements ("What It Is", "Decisions Worth Explaining", "What I Learned"). Use `h3` only for sub-points inside a long section.
- Default skeleton when nothing more specific fits:
  1. Hook (no heading): the concrete problem or surprise, in 2 to 3 sentences.
  2. **What It Is / Why It Matters**
  3. **How It Works** (step by step, with a small working example)
  4. **Common Mistakes**
  5. **Takeaway**
  6. **Sources**
- The intro states what the reader will understand by the end. The conclusion says what to do or think differently, not a recap of headings.

## Voice

- First person, conversational, direct. "I" for opinions and experience, "you" when guiding the reader.
- Plain words first. When a term of art is unavoidable, define it in the same sentence it first appears, ideally with an analogy ("a mutex is a bathroom key: only one person holds it at a time").
- Honest about tradeoffs. The author's best writing names the cost of every decision ("The tradeoffs are real: cross-service calls add latency…") instead of selling it.
- Explain *why the obvious approach fails* before presenting the better one. This is the author's signature pattern: naive approach, hidden failure mode, the fix, the remaining tradeoff.
- Specific over general: real numbers, real function names, real error behaviour. If a claim cannot be sourced from the research brief, leave it out.
- Sentence style: mostly medium-length sentences, occasional short one for emphasis. No exclamation marks. At most one rhetorical question per post.
- Banned: "In today's fast-paced world", "game-changer", "revolutionary", "unlock", "dive in", "let's explore", "in conclusion", "it's no secret that", "at the end of the day", filler transitions, emoji.

## Code, lists and links

- Code examples are short (under ~20 lines), runnable or clearly marked as a fragment, and followed by a paragraph explaining what the non-obvious line does. Inline `code` for identifiers, commands and file names.
- A comment inside a code sample is fine when it explains *why*, not *what*.
- Bulleted lists only for genuinely parallel items (3 to 7). Reasoning goes in paragraphs.
- Use one `blockquote` at most, for a key caveat or a pulled insight.
- Link the first mention of a tool, spec or project to its primary source. Link text is descriptive ("the Redis Streams documentation"), never "click here".

## Sources section

- Always the last `h2`: **Sources**, a `ul` of `a` links with a short description each.
- Only link material that was actually in the research brief. Paraphrase, never quote more than a short phrase.

## Accuracy rules

- Do not invent versions, benchmarks, statistics, quotes or release dates. If the brief does not say it, the post does not say it.
- If sources disagree or the information looks uncertain, say so in the post.
- Write for a beginner developer to follow, but at a standard experienced developers would not wince at.
