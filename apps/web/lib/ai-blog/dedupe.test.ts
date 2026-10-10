import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dedupeTopics, findDuplicate, slugify, tokenize, uniqueSlug } from "./dedupe";

const existing = [
  { title: "How Redis Streams Keep WebSocket Fan-Out Reliable", slug: "redis-streams-websocket-fan-out" },
  { title: "Understanding Docker Networking for Beginners", slug: "docker-networking" },
];

describe("slugify", () => {
  it("lowercases, strips accents and collapses separators", () => {
    assert.equal(slugify("  Café & Código: 101!  "), "cafe-and-codigo-101");
  });
});

describe("tokenize", () => {
  it("drops stopwords and stems plurals", () => {
    const tokens = tokenize("How the Streams work in Redis");
    assert.ok(tokens.has("stream"));
    assert.ok(tokens.has("redi") || tokens.has("redis"));
    assert.ok(!tokens.has("the"));
  });
});

describe("findDuplicate", () => {
  it("matches an identical slug", () => {
    const match = findDuplicate({ title: "Totally different words", slug: "docker-networking" }, existing);
    assert.equal(match?.slug, "docker-networking");
  });

  it("matches a close rephrasing of an existing title", () => {
    const match = findDuplicate({ title: "Redis Streams for reliable WebSocket fan out" }, existing);
    assert.equal(match?.slug, "redis-streams-websocket-fan-out");
  });

  it("does not flag an unrelated topic", () => {
    assert.equal(findDuplicate({ title: "Rust ownership explained with a library analogy" }, existing), null);
  });

  it("does not flag topics that merely share one broad word", () => {
    assert.equal(findDuplicate({ title: "Docker image layers and build caching" }, existing), null);
  });
});

describe("dedupeTopics", () => {
  it("drops known duplicates and duplicates within the candidate list", () => {
    const candidates = [
      { topic: "Docker networking basics for beginners" },
      { topic: "Why SQLite is quietly taking over the edge" },
      { topic: "SQLite is quietly taking over the edge, here is why" },
      { topic: "A gentle introduction to Rust ownership" },
    ];
    const { kept, dropped } = dedupeTopics(candidates, existing);
    assert.deepEqual(
      kept.map((item) => item.topic),
      ["Why SQLite is quietly taking over the edge", "A gentle introduction to Rust ownership"],
    );
    assert.equal(dropped.length, 2);
    assert.equal(dropped[0].duplicateOf, "Understanding Docker Networking for Beginners");
  });

  it("keeps everything when nothing overlaps", () => {
    const { kept, dropped } = dedupeTopics([{ topic: "Zig comptime in practice" }], existing);
    assert.equal(kept.length, 1);
    assert.equal(dropped.length, 0);
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when free", () => {
    assert.equal(uniqueSlug("My Post", new Set()), "my-post");
  });

  it("appends the lowest free numeric suffix", () => {
    assert.equal(uniqueSlug("my-post", new Set(["my-post", "my-post-2"])), "my-post-3");
  });
});
