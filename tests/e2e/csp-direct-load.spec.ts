import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/about", "/investments", "/login", "/register", "/security", "/_design-system"];
const violationPattern = /content security policy|refused to (?:execute|load|apply|connect)|hydration (?:failed|error)/i;

test("direct loads and hard refreshes hydrate under the request nonce", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", message => {
    if (violationPattern.test(message.text())) violations.push(message.text());
  });
  page.on("pageerror", error => {
    if (violationPattern.test(error.message)) violations.push(error.message);
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} direct response`).toBeTruthy();
    await expect(page.getByText(/^Loading page content…$/)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const csp = response?.headers()["content-security-policy"];
    expect(csp, `${route} CSP`).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]+'/);
    if (process.env.NODE_ENV === "production") expect(csp).not.toContain("'unsafe-eval'");
    const requestNonce = csp?.match(/script-src[^;]*'nonce-([^']+)'/)?.[1];
    expect(requestNonce, `${route} request nonce`).toBeTruthy();

    // Runtime-inserted descendants are trusted by strict-dynamic and need not copy the nonce.
    // Assert the executable scripts emitted by Next.js with an explicit nonce marker.
    const frameworkScripts = page.locator('script[nonce][src*="/_next/"]:not([type]), script[nonce][src*="/_next/"][type="text/javascript"], script[nonce][src*="/_next/"][type="module"]');
    expect(await frameworkScripts.count(), `${route} framework scripts`).toBeGreaterThan(0);
    // CSP nonce hiding makes getAttribute("nonce") return an empty string in browsers.
    const nonces = await frameworkScripts.evaluateAll(scripts => scripts.map(script => (script as HTMLScriptElement).nonce));
    expect(nonces.every(nonce => nonce === requestNonce), `${route} framework script nonces`).toBeTruthy();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText(/^Loading page content…$/)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  }

  expect(violations, "CSP or hydration console violations").toEqual([]);
});

test("public client navigation remains usable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /explore investments/i }).first().click();
  await expect(page).toHaveURL(/\/investments$/);
  await expect(page.locator("main")).toBeVisible();
});

test("protected direct loads redirect unauthenticated visitors", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fdashboard$/);
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/);
});
