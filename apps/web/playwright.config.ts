import { existsSync } from "fs";
import { defineConfig, devices } from "@playwright/test";

// This repo was originally developed in a sandbox with a pre-installed
// Chromium at a fixed path (no network access to download browsers). Reuse
// it only when present; everywhere else (CI, a normal dev machine) fall
// back to Playwright's own browser resolution, which expects
// `playwright install` to have been run.
const SANDBOX_CHROMIUM_PATH = "/opt/pw-browsers/chromium";
const chromiumExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {},
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
