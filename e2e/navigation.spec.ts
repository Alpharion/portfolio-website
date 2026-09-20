import { expect, test } from "@playwright/test";
import { expectPageBasics, nav, openNavIfCollapsed } from "./helpers";

test.describe("primary navigation", () => {
  test("renders one nav link per configured item", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeAttached();
    await expect(page.getByTestId("nav-link")).toHaveCount(nav.length);
  });

  for (const item of nav) {
    test(`nav link to ${item.href} navigates and marks itself current`, async ({ page }) => {
      // Start from a different route so the click is a real navigation.
      await page.goto(item.href === "/" ? "/about" : "/");
      await openNavIfCollapsed(page);

      await page.locator(`[data-testid="nav-link"][href="${item.href}"]`).click();
      await expect(page).toHaveURL(
        item.href === "/" ? /\/$/ : new RegExp(`${item.href.replace(/\//g, "\\/")}$`),
      );
      await expectPageBasics(page);

      await openNavIfCollapsed(page);
      await expect(page.locator(`[data-testid="nav-link"][href="${item.href}"]`)).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  }

  test("brand link returns to the home page", async ({ page }) => {
    await page.goto("/about");
    await page.getByTestId("site-header").locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("hero")).toBeVisible();
  });

  test("footer is present on every nav destination", async ({ page }) => {
    for (const item of nav) {
      await page.goto(item.href);
      await expect(page.getByTestId("site-footer")).toBeVisible();
    }
  });
});
