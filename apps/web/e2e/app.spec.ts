import { test, expect } from "@playwright/test";

const DEMO_CREDENTIALS = {
  tenantSlug: "demo-clinic",
  email: "owner@demo-clinic.com",
  password: "Passw0rd!123",
};

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill("#tenantSlug", DEMO_CREDENTIALS.tenantSlug);
  await page.fill("#email", DEMO_CREDENTIALS.email);
  await page.fill("#password", DEMO_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}

test.describe("Authentication", () => {
  test("rejects an invalid password with an error toast", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#tenantSlug", DEMO_CREDENTIALS.tenantSlug);
    await page.fill("#email", DEMO_CREDENTIALS.email);
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs the seeded clinic owner in and lands on the dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText("MBN Health")).toBeVisible();
  });

  test("redirects unauthenticated visitors away from the dashboard", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/dashboard");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
  });
});

test.describe("Core navigation", () => {
  for (const [path, heading] of [
    ["/patients", "Patients"],
    ["/appointments", "Appointments"],
    ["/doctors", "Doctors"],
    ["/billing", "Billing"],
    ["/lab", "Laboratory"],
    ["/radiology", "Radiology"],
    ["/inventory", "Inventory"],
    ["/messages", "Messages"],
    ["/reports", "Reports"],
    ["/staff", "Staff"],
    ["/audit-logs", "Audit Logs"],
    ["/settings", "Settings"],
  ] as const) {
    test(`renders ${path} without an error page`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      await expect(page.getByText(/application error/i)).not.toBeVisible();
    });
  }
});

test.describe("Patients", () => {
  test("registers a new patient and finds them in the list", async ({ page }) => {
    await page.goto("/patients");
    await page.getByRole("button", { name: /new patient/i }).click();

    const uniqueLastName = `E2ETest${Date.now()}`;
    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill(uniqueLastName);
    await page.getByLabel("Date of birth").fill("1990-01-01");

    await page.getByRole("button", { name: /register patient/i }).click();
    await expect(page.getByText(/patient registered/i)).toBeVisible();

    await page.getByPlaceholder(/search by name/i).fill(uniqueLastName);
    await expect(page.getByText(`Playwright ${uniqueLastName}`)).toBeVisible();
  });
});

test.describe("Appointments calendar", () => {
  test("switches between day, week and month views", async ({ page }) => {
    await page.goto("/appointments");
    await expect(page.getByRole("tab", { name: "Week" })).toBeVisible();

    await page.getByRole("tab", { name: "Month" }).click();
    await expect(page.getByText(/^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/)).toBeVisible();

    await page.getByRole("tab", { name: "Day" }).click();
    await page.getByRole("tab", { name: "Week" }).click();
  });
});

test.describe("WhatsApp bot settings", () => {
  test("shows the webhook URL and the seeded (inactive) demo config", async ({ page }) => {
    await page.goto("/settings?tab=whatsapp");
    await expect(page.getByText(/webhook url/i)).toBeVisible();
    await expect(page.getByText(/whatsapp\/webhook/)).toBeVisible();
    await expect(page.getByLabel(/phone number id/i)).toHaveValue(/.+/);
  });
});
