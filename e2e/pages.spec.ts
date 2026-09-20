import { expect, test } from "@playwright/test";
import { siteContent } from "../data/site-content";
import { getFeaturedProjects } from "../lib/projects";
import { expectPageBasics, projects } from "./helpers";

test.describe("homepage", () => {
  test("renders the hero and the page basics", async ({ page }) => {
    await page.goto("/");
    await expectPageBasics(page);
    await expect(page.getByTestId("hero")).toBeVisible();
    await expect(page.getByTestId("hero").locator("h1")).toHaveCount(1);
  });

  test("hero CTAs point at the configured destinations", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByTestId("hero");
    for (const cta of [siteContent.hero.primaryCta, siteContent.hero.secondaryCta]) {
      await expect(hero.locator(`a[href="${cta.href}"]`)).toBeVisible();
    }
  });

  test("shows a card for every featured project, each linking to its detail page", async ({
    page,
  }) => {
    const featured = getFeaturedProjects();
    await page.goto("/");
    const cards = page.getByTestId("project-card");
    await expect(cards).toHaveCount(featured.length);
    for (const project of featured) {
      const card = page.locator(`[data-testid="project-card"][data-slug="${project.slug}"]`);
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute("href", `/projects/${project.slug}`);
    }
  });
});

test.describe("projects list", () => {
  test("lists a card for every project", async ({ page }) => {
    await page.goto("/projects");
    await expectPageBasics(page);
    await expect(page.getByTestId("project-card")).toHaveCount(projects.length);
    for (const project of projects) {
      await expect(
        page.locator(`[data-testid="project-card"][data-slug="${project.slug}"]`),
      ).toHaveAttribute("href", `/projects/${project.slug}`);
    }
  });

  for (const project of projects) {
    test(`card for "${project.slug}" opens its detail page`, async ({ page }) => {
      await page.goto("/projects");
      await page.locator(`[data-testid="project-card"][data-slug="${project.slug}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/projects/${project.slug}$`));
      // The page transition can briefly keep the outgoing and incoming pages in the DOM together;
      // wait for it to settle to a single detail root before asserting on it.
      await expect(page.getByTestId("project-detail")).toHaveCount(1);
      await expect(page.getByTestId("project-detail")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(project.title);
    });
  }
});

test.describe("project detail pages", () => {
  for (const project of projects) {
    test(`/projects/${project.slug} renders a single h1 and the detail root`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);
      await expectPageBasics(page);
      await expect(page.getByTestId("project-detail")).toBeVisible();
      await expect(page.getByTestId("project-detail").locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(
        new RegExp(project.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    });

    test(`/projects/${project.slug} images load with alt text`, async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      const images = page.getByTestId("project-detail").locator("img");
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveAttribute("alt", /.+/);
        await expect
          .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
          .toBe(true);
      }
    });
  }

  test("an unknown slug renders the 404 page", async ({ page }) => {
    const response = await page.goto("/projects/this-slug-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.getByTestId("project-detail")).toHaveCount(0);
    await expect(page.getByTestId("site-header")).toBeVisible();
  });

  test("an unknown top-level route renders the 404 page", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

test.describe("about page", () => {
  test("renders the page basics", async ({ page }) => {
    await page.goto("/about");
    await expectPageBasics(page);
  });

  test("has a working résumé link that serves a PDF", async ({ page, request }) => {
    await page.goto("/about");
    const link = page.getByTestId("resume-link").first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", siteContent.resume.href);
    await expect(link).toHaveAttribute("download", /.*/);

    const response = await request.get(siteContent.resume.href);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
