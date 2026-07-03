import { test as setup } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

setup("authenticate as the seeded clinic owner", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "owner@demo-clinic.com");
  await page.fill("#password", "Passw0rd!123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await page.context().storageState({ path: AUTH_FILE });
});
