import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

const publicRoutes = [
  "/", "/about", "/investments", "/how-it-works", "/security", "/faq", "/contact",
  "/terms", "/privacy", "/risk-disclosure", "/_design-system", "/api/health",
];
const authRoutes = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"];
const dashboardRoutes = [
  "/dashboard", "/dashboard/investments", "/dashboard/transactions", "/dashboard/deposits",
  "/dashboard/withdrawals", "/dashboard/notifications", "/dashboard/settings",
];
const protectedAdminRoutes = [
  "/admin", "/admin/users", "/admin/payments", "/admin/investments", "/admin/withdrawals", "/admin/audit",
];

function capturePageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

test("every public and authentication route loads without an uncaught browser error", async ({ page }) => {
  const errors = capturePageErrors(page);
  for (const path of [...publicRoutes, ...authRoutes]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBeLessThan(400);
    await expect(page.locator("body"), path).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("dynamic public routes fail safely and active plan links resolve", async ({ page }) => {
  await page.goto("/investments/invalid-slug", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

  await page.goto("/investments", { waitUntil: "domcontentloaded" });
  const planLinks = page.locator('a[href^="/investments/"]');
  if (await planLinks.count()) {
    const href = await planLinks.first().getAttribute("href");
    const valid = await page.goto(href!, { waitUntil: "domcontentloaded" });
    expect(valid?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } else {
    await expect(page.getByText("No active investment plans")).toBeVisible();
  }
});

test("unauthenticated dashboard and admin routes reach intentional auth states", async ({ page }) => {
  for (const path of dashboardRoutes) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const redirected = new URL(page.url());
    expect(redirected.pathname, path).toBe("/login");
    expect(redirected.searchParams.get("redirectTo"), path).toBe(path);
  }
  for (const path of protectedAdminRoutes) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page, path).toHaveURL(/\/admin\/login$/);
  }
  await page.goto("/admin/mfa", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Administrator email")).toBeVisible();
});

test("setup, confirmation, health, and invalid admin identifiers are intentional", async ({ page }) => {
  await page.goto("/admin/setup", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  const confirmation = await page.goto("/auth/confirm", { waitUntil: "domcontentloaded" });
  expect(confirmation?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/login\?error=/);
  const health = await page.request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  await page.goto("/admin/users/not-a-uuid", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("desktop and mobile public navigation links resolve", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const mobileToggle = page.getByRole("button", { name: /open navigation/i });
  if (await mobileToggle.isVisible()) await mobileToggle.click();
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const hrefs = await navigation.locator("a[href]").evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))] as string[]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBeLessThan(400);
});
