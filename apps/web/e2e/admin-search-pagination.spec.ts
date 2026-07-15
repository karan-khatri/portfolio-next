import { test, expect } from "@playwright/test";
import { prisma } from "@portfolio/db/server";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "dev-password-change-me";
const UNIQUE_TITLE = "Zzyzxquartz Searchable Project";
const OTHER_TITLE = "E2E Search Other Project";

test.describe("admin search narrows the projects list", () => {
  let uniqueId: string;
  let otherId: string;

  test.beforeAll(async () => {
    const unique = await prisma.project.create({
      data: {
        slug: "e2e-search-unique-project",
        locale: "en",
        translationGroupId: "e2e-search-unique-project",
        title: UNIQUE_TITLE,
        status: "DRAFT",
      },
    });
    uniqueId = unique.id;

    const other = await prisma.project.create({
      data: {
        slug: "e2e-search-other-project",
        locale: "en",
        translationGroupId: "e2e-search-other-project",
        title: OTHER_TITLE,
        status: "DRAFT",
      },
    });
    otherId = other.id;
  });

  test.afterAll(async () => {
    await prisma.project.delete({ where: { id: uniqueId } }).catch(() => {});
    await prisma.project.delete({ where: { id: otherId } }).catch(() => {});
    await prisma.$disconnect();
  });

  test("search narrows results, clearing it shows everything again", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin$/);

    await page.goto("/admin/projects");
    await expect(page.getByText(UNIQUE_TITLE)).toBeVisible();
    await expect(page.getByText(OTHER_TITLE)).toBeVisible();

    await page.locator('input[name="q"]').fill("Zzyzxquartz");
    await page.locator('input[name="q"]').press("Enter");
    await page.waitForURL(/\?q=Zzyzxquartz/);

    await expect(page.getByText(UNIQUE_TITLE)).toBeVisible();
    await expect(page.getByText(OTHER_TITLE)).toHaveCount(0);

    await page.goto("/admin/projects");
    await expect(page.getByText(UNIQUE_TITLE)).toBeVisible();
    await expect(page.getByText(OTHER_TITLE)).toBeVisible();
  });
});
