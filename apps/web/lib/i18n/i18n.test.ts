import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Locale } from "../../../../packages/db/src/generated/client";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isAppLocale, resolveAppLocale } from "./config";
import { alternateUrls, staticAlternates } from "./alternates";
import { pickFeaturedLocalized, pickLocalized, pickLocalizedList, resolveLocalized } from "./content";
import { DICTIONARIES, formatMessage } from "./dictionaries";
import { localizeHref, localizePath, splitLocalePrefix } from "./paths";

describe("locale config", () => {
  it("covers every locale in the Prisma enum, and nothing else", () => {
    assert.deepEqual([...LOCALES].sort(), Object.values(Locale).sort());
  });

  it("has metadata and a dictionary for every locale", () => {
    for (const locale of LOCALES) {
      assert.ok(LOCALE_META[locale].htmlLang);
      assert.ok(DICTIONARIES[locale].common.skipToContent);
    }
  });

  it("resolves unknown values to the default", () => {
    assert.equal(resolveAppLocale("fr"), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale(null), DEFAULT_LOCALE);
    assert.equal(resolveAppLocale("it"), "it");
    assert.equal(isAppLocale("it"), true);
    assert.equal(isAppLocale("de"), false);
  });

  it("has the same dictionary keys in every language", () => {
    const shape = (value: unknown, prefix = ""): string[] =>
      typeof value === "object" && value !== null
        ? Object.entries(value).flatMap(([key, inner]) => shape(inner, `${prefix}${key}.`))
        : [prefix];
    const reference = shape(DICTIONARIES[DEFAULT_LOCALE]);
    for (const locale of LOCALES) {
      assert.deepEqual(shape(DICTIONARIES[locale]), reference, locale);
    }
  });

  it("keeps template placeholders consistent across languages", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    assert.deepEqual(
      placeholders(DICTIONARIES.it.pagination.pageOf),
      placeholders(DICTIONARIES.en.pagination.pageOf),
    );
    assert.deepEqual(
      placeholders(DICTIONARIES.it.projects.goToSlide),
      placeholders(DICTIONARIES.en.projects.goToSlide),
    );
  });
});

describe("paths", () => {
  it("leaves default-locale paths unprefixed", () => {
    assert.equal(localizePath("/", "en"), "/");
    assert.equal(localizePath("/blog/hello", "en"), "/blog/hello");
  });

  it("prefixes non-default locales", () => {
    assert.equal(localizePath("/", "it"), "/it");
    assert.equal(localizePath("/blog/hello", "it"), "/it/blog/hello");
    assert.equal(localizePath("/?page=2", "it"), "/it?page=2");
    assert.equal(localizePath("/#about", "it"), "/it#about");
  });

  it("never double-prefixes, and can strip a prefix", () => {
    assert.equal(localizePath("/it/blog", "it"), "/it/blog");
    assert.equal(localizePath("/it/blog", "en"), "/blog");
    assert.equal(localizePath("/it", "en"), "/");
  });

  it("does not prefix file-like or protocol-relative paths", () => {
    assert.equal(localizePath("/resume.pdf", "it"), "/resume.pdf");
    assert.equal(localizePath("//cdn.example.com/x", "it"), "//cdn.example.com/x");
  });

  it("localizes nav hrefs but not external ones", () => {
    assert.equal(localizeHref("#about", "it"), "/it#about");
    assert.equal(localizeHref("#about", "en"), "/#about");
    assert.equal(localizeHref("/projects", "it"), "/it/projects");
    assert.equal(localizeHref("https://example.com/a", "it"), "https://example.com/a");
    assert.equal(localizeHref("mailto:a@b.co", "it"), "mailto:a@b.co");
  });

  it("splits locale prefixes", () => {
    assert.deepEqual(splitLocalePrefix("/it"), { locale: "it", path: "/" });
    assert.deepEqual(splitLocalePrefix("/it/blog/x"), { locale: "it", path: "/blog/x" });
    assert.deepEqual(splitLocalePrefix("/italy"), { locale: "en", path: "/italy" });
    assert.deepEqual(splitLocalePrefix("/blog"), { locale: "en", path: "/blog" });
  });
});

describe("alternates", () => {
  it("builds hreflang urls with an x-default for the default locale", () => {
    const urls = alternateUrls("https://site.test", { en: "/blog/a", it: "/blog/b" });
    assert.deepEqual(urls, {
      en: "https://site.test/blog/a",
      it: "https://site.test/it/blog/b",
      "x-default": "https://site.test/blog/a",
    });
  });

  it("omits languages that have no translation", () => {
    const urls = alternateUrls("https://site.test", { en: "/projects/x" });
    assert.deepEqual(Object.keys(urls).sort(), ["en", "x-default"]);
  });

  it("maps the home path to the bare site url", () => {
    assert.equal(alternateUrls("https://site.test", { en: "/", it: "/" }).en, "https://site.test");
    assert.equal(alternateUrls("https://site.test", { en: "/", it: "/" }).it, "https://site.test/it");
    assert.deepEqual(Object.keys(staticAlternates("/blog")).sort(), [...LOCALES].sort());
  });
});

describe("formatMessage", () => {
  it("fills known placeholders and keeps unknown ones", () => {
    assert.equal(formatMessage("Page {current} of {total}", { current: 2, total: 5 }), "Page 2 of 5");
    assert.equal(formatMessage("Hi {name}", {}), "Hi {name}");
  });
});

const row = (translationGroupId: string, locale: "en" | "it", publishedAt: number, extra = {}) => ({
  translationGroupId,
  locale,
  publishedAt: new Date(publishedAt),
  slug: `${translationGroupId}-${locale}`,
  ...extra,
});

describe("pickLocalized", () => {
  it("prefers the requested locale per translation group and falls back to English", () => {
    const rows = [row("a", "en", 3), row("a", "it", 4), row("b", "en", 2), row("c", "it", 1)];
    const picked = pickLocalized(rows, "it").map((entry) => entry.slug);
    assert.deepEqual(picked, ["a-it", "b-en", "c-it"]);
  });

  it("returns only English rows for the default locale", () => {
    const rows = [row("a", "en", 3), row("b", "en", 2)];
    assert.deepEqual(pickLocalized(rows, "en").map((entry) => entry.slug), ["a-en", "b-en"]);
  });

  it("orders groups by the default-language publish date, not the translation's", () => {
    const rows = [row("old", "it", 100), row("old", "en", 1), row("new", "en", 50)];
    assert.deepEqual(pickLocalized(rows, "it").map((entry) => entry.slug), ["new-en", "old-it"]);
  });
});

describe("pickFeaturedLocalized", () => {
  const project = (group: string, locale: "en" | "it", featured: boolean, featuredOrder: number | null) => ({
    translationGroupId: group,
    locale,
    featured,
    featuredOrder,
    slug: `${group}-${locale}`,
  });

  it("features a group when any translation is featured, ordered by featuredOrder", () => {
    const rows = [
      project("a", "en", true, 1),
      project("a", "it", false, null),
      project("b", "en", true, 0),
      project("c", "en", false, null),
    ];
    assert.deepEqual(pickFeaturedLocalized(rows, "it").map((entry) => entry.slug), ["b-en", "a-it"]);
  });
});

describe("pickLocalizedList", () => {
  it("keeps one row per group, preferring the locale, ordered by order", () => {
    const rows = [
      { translationGroupId: "x", locale: "en" as const, order: 1, name: "x-en" },
      { translationGroupId: "x", locale: "it" as const, order: 1, name: "x-it" },
      { translationGroupId: "y", locale: "en" as const, order: 0, name: "y-en" },
    ];
    assert.deepEqual(pickLocalizedList(rows, "it").map((entry) => entry.name), ["y-en", "x-it"]);
  });
});

describe("resolveLocalized", () => {
  const english = { translationGroupId: "g", locale: "en" as const, slug: "hello" };
  const italian = { translationGroupId: "g", locale: "it" as const, slug: "ciao" };

  it("returns the exact-locale row when it exists", async () => {
    const result = await resolveLocalized(
      "it",
      async (locale) => (locale === "it" ? italian : english),
      async () => null,
    );
    assert.deepEqual(result, { kind: "found", row: italian, isFallback: false });
  });

  it("falls back to English with a flag when there is no translation", async () => {
    const result = await resolveLocalized(
      "it",
      async (locale) => (locale === "en" ? english : null),
      async () => null,
    );
    assert.deepEqual(result, { kind: "found", row: english, isFallback: true });
  });

  it("points to the translated slug when an English slug is requested under /it", async () => {
    const result = await resolveLocalized(
      "it",
      async (locale) => (locale === "en" ? english : null),
      async () => "ciao",
    );
    assert.deepEqual(result, { kind: "translated", slug: "ciao" });
  });

  it("is missing when neither language has the slug", async () => {
    const result = await resolveLocalized("it", async () => null, async () => null);
    assert.deepEqual(result, { kind: "missing" });
  });
});
