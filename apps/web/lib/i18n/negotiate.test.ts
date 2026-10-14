import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { localeFromCountry, resolveLocaleRedirect } from "./negotiate";

const browser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

describe("localeFromCountry", () => {
  it("maps Italian-speaking countries to Italian and ignores others", () => {
    assert.equal(localeFromCountry("IT"), "it");
    assert.equal(localeFromCountry("it"), "it");
    assert.equal(localeFromCountry("SM"), "it");
    assert.equal(localeFromCountry("US"), null);
    assert.equal(localeFromCountry(undefined), null);
  });
});

describe("resolveLocaleRedirect", () => {
  const base = { method: "GET", userAgent: browser };

  it("sends visitors from Italy to the Italian version of the same page", () => {
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/", country: "IT" }), "/it");
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/blog/hello", search: "?page=2", country: "IT" }), "/it/blog/hello?page=2");
  });

  it("leaves visitors from other countries on English", () => {
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/", country: "US" }), null);
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/" }), null);
  });

  it("lets an explicit choice cookie beat the country in both directions", () => {
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/", country: "IT", cookie: "en" }), null);
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/projects", country: "US", cookie: "it" }), "/it/projects");
  });

  it("ignores a cookie that is not a known language", () => {
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/", country: "IT", cookie: "xx" }), "/it");
  });

  it("never redirects pages that already have a language prefix", () => {
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/it/blog", country: "IT" }), null);
  });

  it("never redirects crawlers, previews, or non-GET requests", () => {
    assert.equal(
      resolveLocaleRedirect({ method: "GET", pathname: "/", country: "IT", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }),
      null,
    );
    assert.equal(resolveLocaleRedirect({ ...base, pathname: "/preview/abc", country: "IT" }), null);
    assert.equal(resolveLocaleRedirect({ ...base, method: "POST", pathname: "/", country: "IT" }), null);
  });
});
