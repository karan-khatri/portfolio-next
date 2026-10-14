import { test, expect } from "@playwright/test";
import { prisma } from "@portfolio/db/server";

test.describe("multilingual public site", () => {
  const ids: { projects: string[] } = { projects: [] };

  test.beforeAll(async () => {
    const english = await prisma.project.create({
      data: {
        slug: "e2e-i18n-project",
        locale: "en",
        translationGroupId: "e2e-i18n-group",
        title: "E2E I18n Project",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    const italian = await prisma.project.create({
      data: {
        slug: "e2e-progetto-i18n",
        locale: "it",
        translationGroupId: "e2e-i18n-group",
        title: "Progetto E2E I18n",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    const englishOnly = await prisma.project.create({
      data: {
        slug: "e2e-i18n-english-only",
        locale: "en",
        translationGroupId: "e2e-i18n-english-only",
        title: "E2E English Only Project",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    ids.projects = [english.id, italian.id, englishOnly.id];
  });

  test.afterAll(async () => {
    await prisma.project.deleteMany({ where: { id: { in: ids.projects } } });
    await prisma.$disconnect();
  });

  test("Italian pages are served under /it with the Italian html lang", async ({ page }) => {
    await page.goto("/it/projects");
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page.locator("h1")).toHaveText("Tutti i progetti");
    await expect(page.locator('a[aria-label="Progetto E2E I18n"]').first()).toBeVisible();
  });

  test("English URLs stay unprefixed and /en redirects to them", async ({ page }) => {
    await page.goto("/en/projects");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("the language switcher goes to the translated slug", async ({ page }) => {
    await page.goto("/projects/e2e-i18n-project");
    await page.locator('header a[hreflang="it"]').first().click();
    await expect(page).toHaveURL(/\/it\/projects\/e2e-progetto-i18n$/);
    await expect(page.locator("h1")).toHaveText("Progetto E2E I18n");
  });

  test("untranslated content falls back to English with a notice", async ({ page }) => {
    await page.goto("/it/projects/e2e-i18n-english-only");
    await expect(page.locator("h1")).toHaveText("E2E English Only Project");
    await expect(page.locator('[role="note"]')).toBeVisible();
  });

  test("an English slug requested under /it lands on the Italian translation", async ({ page }) => {
    await page.goto("/it/projects/e2e-i18n-project");
    await expect(page).toHaveURL(/\/it\/projects\/e2e-progetto-i18n$/);
  });

  test("pages declare hreflang alternates for each translation", async ({ page }) => {
    await page.goto("/projects/e2e-i18n-project");
    const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
      links.map((link) => `${link.getAttribute("hreflang")}=${link.getAttribute("href")}`),
    );
    expect(alternates.some((entry) => entry.startsWith("it=") && entry.endsWith("/it/projects/e2e-progetto-i18n"))).toBe(true);
    expect(alternates.some((entry) => entry.startsWith("x-default="))).toBe(true);
  });
});
