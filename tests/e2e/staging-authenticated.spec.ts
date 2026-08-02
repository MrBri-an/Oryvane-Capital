import { expect, test } from "@playwright/test";

const user = { email: process.env.STAGING_USER_EMAIL, password: process.env.STAGING_USER_PASSWORD };
const admin = { email: process.env.STAGING_ADMIN_EMAIL, password: process.env.STAGING_ADMIN_PASSWORD, totp: process.env.STAGING_ADMIN_TOTP_CODE };
const hasUser = Boolean(user.email && user.password);
const hasAdmin = Boolean(admin.email && admin.password && admin.totp);
const registration = { email: process.env.STAGING_REGISTRATION_EMAIL, password: process.env.STAGING_REGISTRATION_PASSWORD };

test("disposable user registration", async ({ page }) => {
  test.skip(!registration.email || !registration.password, "One-time staging registration credentials are not configured.");
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Staging QA User"); await page.getByLabel("Email address").fill(registration.email!); await page.getByLabel("Phone number").fill("+2348000000000"); await page.getByLabel("Country").fill("Nigeria");
  await page.getByLabel("Password", { exact: true }).fill(registration.password!); await page.getByLabel("Confirm password").fill(registration.password!);
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Create account" }).click(); await expect(page).toHaveURL(/\/verify-email/);
});

test.describe("disposable authenticated staging user", () => {
  test.skip(!hasUser, "Disposable staging user credentials are not configured.");
  test("login, dashboard, payment, investment and withdrawal foundations", async ({ page }) => {
    await page.goto("/login"); await page.getByLabel("Email address").fill(user.email!); await page.getByLabel("Password").fill(user.password!); await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    for (const path of ["/dashboard/deposits", "/dashboard/investments", "/dashboard/withdrawals"]) { await page.goto(path); await expect(page.locator("main")).toBeVisible(); }
  });
});

test.describe("disposable AAL2 staging administrator", () => {
  test.skip(!hasAdmin, "Disposable staging admin credentials and an ephemeral TOTP code are not configured.");
  test("admin login, MFA, permissions and confirmation dialog", async ({ page }) => {
    await page.goto("/admin/login"); await page.getByLabel("Administrator email").fill(admin.email!); await page.getByLabel("Password").fill(admin.password!); await page.getByRole("button", { name: "Continue securely" }).click();
    if (page.url().includes("/admin/mfa")) { await page.getByLabel("Six-digit authenticator code").fill(admin.totp!); await page.getByRole("button", { name: "Verify and continue" }).click(); }
    await expect(page).toHaveURL(/\/admin(?:\/|$)/); await expect(page.getByText("AAL2", { exact: false }).first()).toBeVisible();
    await page.goto("/admin/payments"); const operation = page.getByRole("button", { name: /start review|reject|approve and credit/i }).first();
    if (await operation.count()) { await operation.click(); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.getByLabel(/authenticator code/i)).toBeVisible(); }
  });
});
