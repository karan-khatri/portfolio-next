import { test, expect } from "@playwright/test";
import { prisma } from "@portfolio/db/server";

test.describe("public site golden paths", () => {
  let projectId: string;
  let postId: string;

  test.beforeAll(async () => {
    const project = await prisma.project.create({
      data: {
        slug: "e2e-public-project",
        locale: "en",
        translationGroupId: "e2e-public-project",
        title: "E2E Public Project",
        excerpt: "An excerpt for the e2e public project.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    projectId = project.id;

    const post = await prisma.post.create({
      data: {
        slug: "e2e-public-post",
        locale: "en",
        translationGroupId: "e2e-public-post",
        title: "E2E Public Post",
        excerpt: "An excerpt for the e2e public post.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    postId = post.id;
  });

  test.afterAll(async () => {
    await prisma.project.delete({ where: { id: projectId } }).catch(() => {});
    await prisma.post.delete({ where: { id: postId } }).catch(() => {});
    await prisma.$disconnect();
  });

  test("home page renders with nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header nav")).toBeVisible();
  });

  test("projects index lists a published project and links to its detail page", async ({
    page,
  }) => {
    await page.goto("/projects");
    const link = page.locator('a[aria-label="E2E Public Project"], a:has-text("E2E Public Project")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/projects\/e2e-public-project$/);
    await expect(page.locator("h1")).toHaveText("E2E Public Project");
  });

  test("blog index lists a published post and links to its detail page", async ({ page }) => {
    await page.goto("/blog");
    const link = page.locator('a:has-text("E2E Public Post")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/blog\/e2e-public-post$/);
    await expect(page.locator("h1")).toHaveText("E2E Public Post");
  });
});
