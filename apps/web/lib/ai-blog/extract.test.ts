import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { decodeEntities, extractReadableText } from "./extract";
import { isPathAllowed, parseRobots } from "./robots";
import { fetchPublic, fetchReadable, isPrivateAddress } from "./safe-fetch";

const filler = "This paragraph explains the mechanism in enough detail to count as readable body text. ".repeat(12);

const PAGE = `<!doctype html><html><head><title>Streams &amp; Groups – Redis</title>
<script>window.track = "SHOULD_NOT_APPEAR"</script><style>.x{color:red}</style></head>
<body>
<nav><a href="/">Home</a> NAVIGATION_NOISE</nav>
<header>HEADER_NOISE</header>
<div class="cookie-banner">COOKIE_NOISE accept all</div>
<article>
<h1>Redis Streams</h1>
<p>${filler}</p>
<pre><code>XADD mystream * field value</code></pre>
<ul><li>First point</li><li>Second point</li></ul>
</article>
<aside>SIDEBAR_NOISE</aside>
<footer>FOOTER_NOISE</footer>
</body></html>`;

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    assert.equal(decodeEntities("a &amp; b &lt;c&gt; &#65; &#x42;"), "a & b <c> A B");
  });

  it("leaves unknown entities alone and survives invalid code points", () => {
    assert.equal(decodeEntities("&bogus; &#99999999;"), "&bogus;  ");
  });
});

describe("extractReadableText", () => {
  const result = extractReadableText(PAGE, 20000);

  it("reads the title", () => {
    assert.equal(result.title, "Streams & Groups – Redis");
  });

  it("removes scripts, styles, nav, header, aside, footer and cookie banners", () => {
    for (const noise of ["SHOULD_NOT_APPEAR", "NAVIGATION_NOISE", "HEADER_NOISE", "COOKIE_NOISE", "SIDEBAR_NOISE", "FOOTER_NOISE", "color:red"]) {
      assert.ok(!result.text.includes(noise), `${noise} leaked into the text`);
    }
  });

  it("keeps headings, paragraphs, lists and code", () => {
    assert.match(result.text, /# Redis Streams/);
    assert.match(result.text, /explains the mechanism/);
    assert.match(result.text, /- First point/);
    assert.match(result.text, /\[code\]\nXADD mystream \* field value\n\[\/code\]/);
  });

  it("caps the length", () => {
    const capped = extractReadableText(PAGE, 200);
    assert.ok(capped.text.length <= 201);
    assert.ok(capped.text.endsWith("…"));
  });
});

describe("robots", () => {
  const robotsTxt = `
User-agent: *
Disallow: /private/
Allow: /private/public-page
Disallow: /*.pdf$

User-agent: KumarKaranBlogBot
Disallow: /blocked-for-us/
`;

  it("falls back to the * group when no specific group exists", () => {
    const rules = parseRobots(robotsTxt, "SomeOtherBot");
    assert.equal(isPathAllowed(rules, "/articles/1"), true);
    assert.equal(isPathAllowed(rules, "/private/x"), false);
    assert.equal(isPathAllowed(rules, "/private/public-page"), true);
    assert.equal(isPathAllowed(rules, "/files/report.pdf"), false);
  });

  it("prefers the group matching our agent over *", () => {
    const rules = parseRobots(robotsTxt, "KumarKaranBlogBot");
    assert.equal(isPathAllowed(rules, "/blocked-for-us/page"), false);
    assert.equal(isPathAllowed(rules, "/private/x"), true);
  });

  it("treats a blanket Disallow as blocking everything and an empty one as allowing", () => {
    assert.equal(isPathAllowed(parseRobots("User-agent: *\nDisallow: /", "bot"), "/anything"), false);
    assert.equal(isPathAllowed(parseRobots("User-agent: *\nDisallow:", "bot"), "/anything"), true);
  });
});

describe("isPrivateAddress", () => {
  it("blocks loopback, private, link-local and metadata addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.9", "172.31.255.255", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) {
      assert.equal(isPrivateAddress(ip), true, ip);
    }
  });

  it("allows public addresses", () => {
    for (const ip of ["93.184.216.34", "8.8.8.8", "172.32.0.1", "2606:4700:4700::1111"]) {
      assert.equal(isPrivateAddress(ip), false, ip);
    }
  });
});

describe("fetchReadable", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  function mockFetch(routes: Record<string, () => Response>) {
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      const handler = routes[`${url.origin}${url.pathname}`];
      if (!handler) return new Response("not found", { status: 404 });
      return handler();
    }) as typeof fetch;
  }

  it("returns readable text for an allowed page", async () => {
    mockFetch({
      "http://93.184.216.34/robots.txt": () => new Response("User-agent: *\nDisallow: /secret", { status: 200 }),
      "http://93.184.216.34/post": () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }),
    });
    const page = await fetchReadable("http://93.184.216.34/post");
    assert.equal(page.title, "Streams & Groups – Redis");
    assert.match(page.text, /explains the mechanism/);
  });

  it("skips pages disallowed by robots.txt", async () => {
    mockFetch({
      "http://93.184.216.37/robots.txt": () => new Response("User-agent: *\nDisallow: /post", { status: 200 }),
      "http://93.184.216.37/post": () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html" } }),
    });
    await assert.rejects(() => fetchReadable("http://93.184.216.37/post"), /robots/);
  });

  it("skips non-HTML content and HTTP errors", async () => {
    mockFetch({
      "http://93.184.216.35/robots.txt": () => new Response("", { status: 404 }),
      "http://93.184.216.35/file": () => new Response("%PDF", { status: 200, headers: { "content-type": "application/pdf" } }),
      "http://93.184.216.35/gone": () => new Response("nope", { status: 410, headers: { "content-type": "text/html" } }),
    });
    await assert.rejects(() => fetchReadable("http://93.184.216.35/file"), /unsupported content type/);
    await assert.rejects(() => fetchReadable("http://93.184.216.35/gone"), /HTTP 410/);
  });

  it("refuses private and loopback targets without making a request", async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("x");
    }) as typeof fetch;
    await assert.rejects(() => fetchPublic("http://127.0.0.1/admin"), /blocked/);
    await assert.rejects(() => fetchPublic("http://169.254.169.254/latest/meta-data"), /blocked/);
    await assert.rejects(() => fetchPublic("http://localhost/"), /blocked/);
    await assert.rejects(() => fetchPublic("file:///etc/passwd"), /protocol/);
    assert.equal(called, false);
  });

  it("re-validates every redirect hop", async () => {
    mockFetch({
      "http://93.184.216.36/start": () => new Response(null, { status: 302, headers: { location: "http://10.0.0.5/internal" } }),
    });
    await assert.rejects(() => fetchPublic("http://93.184.216.36/start"), /blocked/);
  });
});
