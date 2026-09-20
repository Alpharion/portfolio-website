import { expect, test } from "@playwright/test";
import { siteContent } from "../data/site-content";
import { allRoutes, expectPageBasics, nav, projects, trackErrors } from "./helpers";

test.describe("every route", () => {
  for (const route of allRoutes) {
    test(`${route} has one h1, one main#main and no console errors`, async ({ page }) => {
      const errors = trackErrors(page);
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expectPageBasics(page);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("skip link", () => {
  test("is the first tab stop and moves focus to #main", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard interaction is desktop-only");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.locator('a[href="#main"]').first();
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator("#main")).toBeFocused();
  });

  test("exists on every nav destination", async ({ page }) => {
    for (const item of nav) {
      await page.goto(item.href);
      await expect(page.locator('a[href="#main"]')).toHaveCount(1);
    }
  });
});

test.describe("mobile navigation", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "mobile-only");
  });

  test("toggle opens and closes the menu", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("nav-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const controls = await toggle.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    for (const link of await page.getByTestId("nav-link").all()) await expect(link).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("choosing a link navigates and collapses the menu", async ({ page }) => {
    const target = nav.find((n) => n.href !== "/") ?? nav[0];
    await page.goto("/");
    const toggle = page.getByTestId("nav-toggle");
    await toggle.click();
    await page.locator(`[data-testid="nav-link"][href="${target.href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${target.href.replace(/\//g, "\\/")}$`));
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes an open menu", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("nav-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("desktop navigation", () => {
  test("nav links are visible without opening any menu", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only");
    await page.goto("/");
    for (const link of await page.getByTestId("nav-link").all()) await expect(link).toBeVisible();
  });
});

test.describe("SEO endpoints", () => {
  test("/sitemap.xml lists every static route and every project", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/xml/);
    const xml = await response.text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    for (const item of nav) expect(paths).toContain(item.href);
    for (const project of projects) expect(paths).toContain(`/projects/${project.slug}`);
    // Every <loc> uses the configured production origin.
    for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      expect(new URL(loc).origin).toBe(new URL(siteContent.site.url).origin);
    }
  });

  test("/robots.txt allows crawling and points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toMatch(/User-agent:\s*\*/i);
    expect(text).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i);
  });
});
