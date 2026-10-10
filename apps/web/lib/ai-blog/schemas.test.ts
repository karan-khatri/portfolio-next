import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseJsonLoose, validateBrief, validateDiscovery, validatePost } from "./schemas";

const validPost = {
  title: "How Redis Streams Keep WebSocket Fan-Out Reliable",
  slug: "redis-streams-websocket-fan-out",
  excerpt: "Pub/Sub drops messages when a subscriber blips. Here is how Streams fixed that for me, and what it cost.",
  body: `<p>${"word ".repeat(220)}</p>`,
  tags: ["Redis", "WebSockets"],
  meta_title: "Redis Streams for WebSocket Fan-Out",
  meta_description: "Why Redis Pub/Sub silently drops messages and how Redis Streams give each hub a replayable position.",
  ai_generated: true,
  source_urls: ["https://redis.io/docs/latest/develop/data-types/streams/"],
};

describe("parseJsonLoose", () => {
  it("parses plain JSON", () => {
    assert.deepEqual(parseJsonLoose('{"a":1}'), { a: 1 });
  });

  it("strips markdown code fences", () => {
    assert.deepEqual(parseJsonLoose('```json\n{"a":1}\n```'), { a: 1 });
  });

  it("extracts JSON surrounded by prose", () => {
    assert.deepEqual(parseJsonLoose('Sure! Here you go: {"a":[1,2]} Hope that helps.'), { a: [1, 2] });
  });

  it("throws when there is no JSON", () => {
    assert.throws(() => parseJsonLoose("no json here"));
  });
});

describe("validateDiscovery", () => {
  const topic = {
    topic: "Why SQLite is quietly taking over the edge",
    angle: "Explain embedded databases through a deployment story",
    why_trending: "Several launch posts hit the front page this week.",
    source_urls: ["https://example.com/post"],
  };

  it("accepts the {topics:[…]} envelope", () => {
    const result = validateDiscovery({ topics: [topic] });
    assert.ok(result.ok);
  });

  it("accepts a bare array", () => {
    const result = validateDiscovery([topic]);
    assert.ok(result.ok);
  });

  it("rejects topics without source urls and reports the path", () => {
    const result = validateDiscovery({ topics: [{ ...topic, source_urls: [] }] });
    assert.ok(!result.ok);
    assert.match(result.errors.join(" "), /topics\.0\.source_urls/);
  });

  it("rejects non-http urls", () => {
    const result = validateDiscovery({ topics: [{ ...topic, source_urls: ["javascript:alert(1)"] }] });
    assert.ok(!result.ok);
  });
});

describe("validateBrief", () => {
  it("fills optional lists with empty arrays", () => {
    const result = validateBrief({
      summary: "A short summary that is long enough to pass.",
      key_facts: ["Fact one"],
      how_it_works: "It works by doing the thing in a particular order.",
      sources_used: [{ url: "https://example.com", title: "Example" }],
    });
    assert.ok(result.ok);
    assert.deepEqual(result.value.code_concepts, []);
    assert.deepEqual(result.value.common_pitfalls, []);
  });

  it("requires at least one fact and one source", () => {
    const result = validateBrief({ summary: "x".repeat(30), key_facts: [], how_it_works: "y".repeat(30), sources_used: [] });
    assert.ok(!result.ok);
  });
});

describe("validatePost", () => {
  it("accepts a well-formed post", () => {
    assert.ok(validatePost(validPost).ok);
  });

  it("requires ai_generated to be exactly true", () => {
    const result = validatePost({ ...validPost, ai_generated: false });
    assert.ok(!result.ok);
  });

  it("rejects slugs that are not lowercase-hyphen", () => {
    const result = validatePost({ ...validPost, slug: "Not A Slug!" });
    assert.ok(!result.ok);
    assert.match(result.errors.join(" "), /slug/);
  });

  it("rejects too few tags and too-short bodies", () => {
    const result = validatePost({ ...validPost, tags: ["One"], body: "<p>short</p>" });
    assert.ok(!result.ok);
    const paths = result.errors.join(" ");
    assert.match(paths, /tags/);
    assert.match(paths, /body/);
  });
});
