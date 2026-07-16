import { test, expect } from "@playwright/test";
import { prisma } from "@portfolio/db/server";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "dev-password-change-me";
const SLUG = "e2e-admin-content-project";

test.describe("admin content: draft, publish, unpublish a project", () => {
  test.afterAll(async () => {
    await prisma.project.deleteMany({ where: { slug: SLUG } });
    await prisma.$disconnect();
  });

  test("create, publish, and unpublish a project via the admin UI", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin$/);

    await page.goto("/admin/projects");
    await page.getByText("New project").click();
    await page.locator("#slug").fill(SLUG);
    await page.locator("#title").fill("E2E Admin Content Project");
    await page.getByRole("button", { name: "Create project" }).click();

    await page.waitForURL(/\/admin\/projects\/[a-z0-9]+$/);

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Draft saved", { exact: true })).toBeVisible({ timeout: 15_000 });

    const publicResponseBeforePublish = await page.request.get(`/projects/${SLUG}`);
    expect(publicResponseBeforePublish.status()).toBe(404);

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Published", { exact: true })).toBeVisible({ timeout: 15_000 });

    await page.goto(`/projects/${SLUG}`);
    await expect(page.locator("h1")).toHaveText("E2E Admin Content Project");

    const project = await prisma.project.findFirstOrThrow({ where: { slug: SLUG } });
    await page.goto(`/admin/projects/${project.id}`);
    await page.getByRole("button", { name: "Unpublish" }).click();
    await expect(page.getByText("Unpublished", { exact: true })).toBeVisible({ timeout: 15_000 });

    const publicResponseAfterUnpublish = await page.request.get(`/projects/${SLUG}`);
    expect(publicResponseAfterUnpublish.status()).toBe(404);
  });
});
