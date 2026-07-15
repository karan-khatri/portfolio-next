import { defineConfig } from "@playwright/test";
import "dotenv/config";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // Next dev-mode compiles each route on first visit; a cold server's first
  // hit to an uncompiled admin route can take longer than the 30s default.
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
