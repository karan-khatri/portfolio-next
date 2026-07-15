import { test, expect } from "@playwright/test";
import { prisma } from "@portfolio/db/server";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "dev-password-change-me";
const PARENT_LABEL = "E2E Parent";
const CHILD_LABEL = "E2E Child";

test.describe("admin navigation: parent + child links", () => {
  test.afterAll(async () => {
    await prisma.navigationItem.deleteMany({ where: { label: { in: [PARENT_LABEL, CHILD_LABEL] } } });
    await prisma.$disconnect();
  });

  test("create a parent nav item with a child and see it in the public header dropdown", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin$/);

    await page.goto("/admin/navigation");
    await page.getByText("Add link", { exact: true }).click();
    await page.locator("#new-label").fill(PARENT_LABEL);
    await page.locator("#new-href").fill("/e2e-parent");
    await page
      .locator("#new-label")
      .locator("xpath=ancestor::form")
      .locator('button[type="submit"]')
      .click();
    await expect(page.getByText("Added")).toBeVisible();

    const parentCard = page.locator("details", { hasText: PARENT_LABEL }).first();
    await expect(parentCard).toBeVisible();
    await parentCard.locator("summary").first().click();
    await parentCard.getByText("Add sub-link").click();
    const childLabelInput = parentCard.locator('input[id$="-new-child-label"]');
    await childLabelInput.fill(CHILD_LABEL);
    await parentCard.locator('input[id$="-new-child-href"]').fill("/e2e-parent/e2e-child");
    await childLabelInput.locator("xpath=ancestor::form").locator('button[type="submit"]').click();
    await expect(page.getByText("Added").last()).toBeVisible();

    await page.goto("/");
    const parentLink = page.locator(`nav a:has-text("${PARENT_LABEL}")`);
    await expect(parentLink).toBeVisible();
    const childLink = page.locator(`nav a:has-text("${CHILD_LABEL}")`);
    await expect(childLink).toHaveAttribute("href", "/e2e-parent/e2e-child");
  });
});
