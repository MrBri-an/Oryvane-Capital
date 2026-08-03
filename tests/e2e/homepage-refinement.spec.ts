import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
];

test("homepage refinements remain compact and overflow-free across target widths", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByTestId("currency-intelligence")).toBeVisible();
    await expect(page.getByTestId("security-architecture")).toBeVisible();
    await expect(page.getByTestId("market-awareness")).toBeVisible();
    await expect(page.getByTestId("market-cta")).toBeVisible();
    await expect(page.getByText("Your financial position")).toHaveCount(0);
    await expect(page.getByTestId("operating-sequence")).toBeVisible();
    await expect(page.getByTestId("framework-card")).toHaveCount(3);
    await expect(page.locator(".shooting-star")).toHaveCount(3);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${viewport.width}px viewport overflow`).toBeLessThanOrEqual(1);

    const intelligence = await page.getByTestId("currency-intelligence").boundingBox();
    expect(intelligence?.width).toBeLessThanOrEqual(viewport.width);

    const heatmap = page.getByTestId("market-heatmap");
    if (await heatmap.count()) {
      const cards = heatmap.locator("[data-market-card]");
      await expect(cards).toHaveCount(5);
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      if (viewport.width === 320) expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeLessThan(2);
      if (viewport.width === 390) expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeGreaterThan(20);
      const currencyButton = heatmap.getByRole("button", { name: "usd" });
      const currencyBox = await currencyButton.boundingBox();
      expect(currencyBox?.height).toBeGreaterThanOrEqual(viewport.width < 640 ? 43 : 35);
    }
  }
});

test("shooting stars are non-interactive and disabled for reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".shooting-star")).toHaveCount(3);
  await expect(page.locator(".shooting-star-field")).toHaveCSS("pointer-events", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".shooting-star").first()).toHaveCSS("display", "none");
});
