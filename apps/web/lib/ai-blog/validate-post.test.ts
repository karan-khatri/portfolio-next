import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkCodeBlocks, countWords, ensureSourcesSection, sanitizePostHtml } from "./validate-post";
import { parseGithubTrending, parseHackerNews, parseRedditAtom, selectCandidates, type Candidate } from "./sources";
import type { TrendSource } from "./sources.config";

describe("sanitizePostHtml", () => {
  it("strips scripts, event handlers, styles and unsafe links", () => {
    const dirty =
      '<h1>T</h1><p onclick="x()">Hi <script>alert(1)</script><a href="javascript:alert(1)">bad</a> <a href="https://ok.dev">ok</a></p><img src=x onerror=alert(1)><iframe src="https://evil"></iframe><p style="color:red">s</p>';
    const clean = sanitizePostHtml(dirty);
    assert.ok(!/script|onclick|onerror|iframe|javascript:|<img|style=/i.test(clean), clean);
    assert.match(clean, /<h2>T<\/h2>/);
    assert.match(clean, /<a href="https:\/\/ok\.dev" rel="noopener noreferrer">ok<\/a>/);
  });

  it("keeps code language classes but drops other classes", () => {
    const clean = sanitizePostHtml('<pre><code class="language-ts evil">const a = 1;</code></pre>');
    assert.match(clean, /<code class="language-ts">/);
    assert.ok(!clean.includes("evil"));
  });
});

describe("ensureSourcesSection", () => {
  const sources = [{ url: "https://example.com/a?x=1&y=2", title: "A <b>title</b>" }];

  it("appends an escaped Sources list when missing", () => {
    const html = ensureSourcesSection("<p>Body</p>", sources);
    assert.match(html, /<h2>Sources<\/h2><ul><li><a href="https:\/\/example\.com\/a\?x=1&amp;y=2">A &lt;b&gt;title&lt;\/b&gt;<\/a><\/li><\/ul>$/);
  });

  it("leaves an existing Sources heading alone", () => {
    const original = "<p>Body</p><h2>Sources</h2><ul><li>x</li></ul>";
    assert.equal(ensureSourcesSection(original, sources), original);
  });
});

describe("countWords", () => {
  it("ignores tags and code blocks", () => {
    assert.equal(countWords("<p>one two <strong>three</strong></p><pre><code>a b c d e</code></pre>"), 3);
  });
});

describe("checkCodeBlocks", () => {
  const block = (language: string, code: string) => `<pre><code class="language-${language}">${code}</code></pre>`;

  it("accepts valid JavaScript, including imports and top-level await", () => {
    const html = block("js", "import fs from &quot;node:fs&quot;;\nconst data = await fs.promises.readFile(&quot;a&quot;);\nexport default data;");
    assert.deepEqual(checkCodeBlocks(html), []);
  });

  it("flags JavaScript syntax errors", () => {
    const issues = checkCodeBlocks(block("javascript", "function broken( {"));
    assert.equal(issues.length, 1);
    assert.equal(issues[0].language, "javascript");
  });

  it("validates TypeScript after stripping types", () => {
    assert.deepEqual(checkCodeBlocks(block("ts", "const n: number = 1;\ninterface A { b: string }")), []);
    assert.equal(checkCodeBlocks(block("ts", "const n: number = ;")).length, 1);
  });

  it("validates JSON and ignores languages it cannot check", () => {
    assert.deepEqual(checkCodeBlocks(block("json", "{&quot;a&quot;: 1}")), []);
    assert.equal(checkCodeBlocks(block("json", "{a: 1}")).length, 1);
    assert.deepEqual(checkCodeBlocks(block("python", "def (:")), []);
  });
});

const source = (kind: TrendSource["kind"]): TrendSource => ({
  id: kind,
  kind,
  label: kind,
  url: "https://example.com",
  limit: 10,
  enabled: true,
});

describe("trend source parsers", () => {
  it("parses Hacker News hits and falls back to the item page for Ask HN", () => {
    const items = parseHackerNews(
      { hits: [{ title: "Show HN: Thing", url: "https://thing.dev", points: 321, objectID: "1" }, { title: "Ask HN: Q", url: null, points: 12, objectID: "2" }] },
      source("hackernews"),
    );
    assert.equal(items[0].score, 321);
    assert.equal(items[1].url, "https://news.ycombinator.com/item?id=2");
  });

  it("parses GitHub trending markup", () => {
    const html = `<article class="Box-row"><h2 class="h3 lh-condensed"><a href="/owner/repo" data-x="1"> owner / repo </a></h2><p class="col-9">A <em>fast</em> parser</p><span>1,234 stars this week</span></article>`;
    const [item] = parseGithubTrending(html, source("github-trending"));
    assert.equal(item.url, "https://github.com/owner/repo");
    assert.equal(item.score, 1234);
    assert.match(item.title, /owner\/repo: A fast parser/);
  });

  it("parses Reddit Atom entries and prefers the external link", () => {
    const xml = `<feed><entry><title>Post &amp; title</title><link href="https://www.reddit.com/r/programming/comments/abc/"/><content type="html">&lt;a href=&quot;https://blog.example.com/post&quot;&gt;[link]&lt;/a&gt;</content></entry></feed>`;
    const [item] = parseRedditAtom(xml, source("reddit-rss"));
    assert.equal(item.title, "Post & title");
    assert.equal(item.url, "https://blog.example.com/post");
  });
});

describe("selectCandidates", () => {
  const make = (sourceId: string, n: number, score = n): Candidate => ({
    title: `${sourceId} item ${n}`,
    url: `https://${sourceId}.dev/${n}`,
    score,
    sourceId,
    sourceLabel: sourceId,
  });

  it("interleaves sources so one noisy source cannot crowd out the rest", () => {
    const all = [...[1, 2, 3, 4, 5].map((n) => make("a", n)), ...[1, 2].map((n) => make("b", n))];
    const picked = selectCandidates(all, null, 4);
    assert.equal(picked.filter((c) => c.sourceId === "b").length, 2);
  });

  it("dedupes the same URL across sources and ignores utm params", () => {
    const a = { ...make("a", 1), url: "https://x.dev/p?utm_source=hn" };
    const b = { ...make("b", 1), url: "https://www.x.dev/p/" };
    assert.equal(selectCandidates([a, b], null, 10).length, 1);
  });

  it("surfaces focus-keyword matches first within a source", () => {
    const all = [make("a", 1, 999), { ...make("a", 2, 1), title: "Deep dive into AI agents" }];
    assert.equal(selectCandidates(all, "ai", 1)[0].url, "https://a.dev/2");
  });
});
