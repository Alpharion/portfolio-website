import { expect, test, type Page } from "@playwright/test";
import { getFeaturedProjects } from "../lib/projects";
import { waitForHydration } from "./helpers";

const featured = getFeaturedProjects();
const slugs = featured.map((p) => p.slug);

/** Slugs of the cards fully inside the track's visible window (left-to-right order). */
async function fullyVisible(page: Page): Promise<string[]> {
  return page.getByTestId("carousel-track").evaluate((track) => {
    const box = track.getBoundingClientRect();
    return Array.from(track.querySelectorAll<HTMLElement>('[data-testid="project-card"]'))
      .filter((card) => {
        const r = card.getBoundingClientRect();
        return r.left >= box.left - 4 && r.right <= box.right + 4;
      })
      .map((card) => card.dataset.slug as string);
  });
}

/** Number of cards that overlap the visible window at all (fully or peeking). */
async function partiallyVisible(page: Page): Promise<number> {
  return page.getByTestId("carousel-track").evaluate((track) => {
    const box = track.getBoundingClientRect();
    return Array.from(track.querySelectorAll<HTMLElement>('[data-testid="project-card"]')).filter(
      (card) => {
        const r = card.getBoundingClientRect();
        return r.right > box.left + 4 && r.left < box.right - 4;
      },
    ).length;
  });
}

/** Wait for a smooth scroll to finish: scrollLeft unchanged across two consecutive frames. */
async function settle(page: Page): Promise<void> {
  await page.getByTestId("carousel-track").evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        let last = -1;
        let stable = 0;
        const tick = () => {
          stable = el.scrollLeft === last ? stable + 1 : 0;
          last = el.scrollLeft;
          if (stable >= 5) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page, "carousel-track");
  await expect(page.locator(".project-carousel")).toHaveAttribute(
    "data-position",
    /^(fits|start|middle|end)$/,
  );
});

test.describe("featured carousel (structure)", () => {
  test("renders a slide and a card per featured project, in order", async ({ page }) => {
    const cards = page.getByTestId("carousel-track").getByTestId("project-card");
    await expect(cards).toHaveCount(featured.length);
    expect(await cards.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")))).toEqual(
      slugs,
    );

    const slides = page.locator('[aria-roledescription="slide"]');
    await expect(slides).toHaveCount(featured.length);
    for (let i = 0; i < featured.length; i++) {
      await expect(slides.nth(i)).toHaveAttribute("aria-label", `${i + 1} of ${featured.length}`);
    }
    await expect(page.locator('section[aria-roledescription="carousel"]')).toHaveCount(1);
  });

  test("the home page has no project filter", async ({ page }) => {
    await expect(page.getByTestId("project-filter")).toHaveCount(0);
    await expect(page.locator('[data-testid^="filter-"]')).toHaveCount(0);
  });

  test("hero keeps a single h1, an aria-hidden visual, and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("hero").locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("hero").locator(".hero__visual")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(errors).toEqual([]);
  });
});

test.describe("featured carousel (desktop)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "desktop layout");
  });

  const visibleCount = Math.min(3, featured.length);

  test(`shows exactly min(3, featured) = ${visibleCount} fully visible cards at the start`, async ({
    page,
  }) => {
    expect(await fullyVisible(page)).toEqual(slugs.slice(0, visibleCount));
  });

  test("prev is disabled at the start and next is enabled (when the cards do not all fit)", async ({
    page,
  }) => {
    test.skip(featured.length <= 3, "all featured cards fit; arrows are hidden");
    await expect(page.getByTestId("carousel-prev")).toBeDisabled();
    await expect(page.getByTestId("carousel-next")).toBeEnabled();
  });

  test("hides the arrows when every card fits", async ({ page }) => {
    test.skip(featured.length > 3, "cards overflow; arrows are shown");
    await expect(page.getByTestId("carousel-prev")).toBeHidden();
    await expect(page.getByTestId("carousel-next")).toBeHidden();
  });

  test("one Next click shifts the visible window by exactly one card, Prev goes back", async ({
    page,
  }) => {
    test.skip(featured.length <= 3, "nothing to scroll");
    const before = await fullyVisible(page);
    expect(before).toEqual(slugs.slice(0, 3));

    await page.getByTestId("carousel-next").click();
    await expect.poll(() => fullyVisible(page)).toEqual(slugs.slice(1, 4));
    await expect(page.getByTestId("carousel-prev")).toBeEnabled();

    await page.getByTestId("carousel-prev").click();
    await expect.poll(() => fullyVisible(page)).toEqual(before);
    await expect(page.getByTestId("carousel-prev")).toBeDisabled();
  });

  test("next becomes disabled at the end and the last cards are visible (no looping)", async ({
    page,
  }) => {
    test.skip(featured.length <= 3, "nothing to scroll");
    const next = page.getByTestId("carousel-next");
    for (let i = 0; i < featured.length && (await next.isEnabled()); i++) {
      await next.click();
      await settle(page);
    }
    await expect(next).toBeDisabled();
    await expect(page.getByTestId("carousel-prev")).toBeEnabled();
    await expect.poll(() => fullyVisible(page)).toEqual(slugs.slice(-3));
  });

  test("the track responds to arrow keys by moving one card", async ({ page }) => {
    test.skip(featured.length <= 3, "nothing to scroll");
    await page.getByTestId("carousel-track").focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => fullyVisible(page)).toEqual(slugs.slice(1, 4));
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => fullyVisible(page)).toEqual(slugs.slice(0, 3));
  });

  test("a card in the carousel opens its project", async ({ page }) => {
    await page.getByTestId("carousel-track").locator(`[data-slug="${slugs[0]}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${slugs[0]}$`));
    await expect(page.getByTestId("project-detail")).toHaveCount(1);
  });
});

test.describe("featured carousel (mobile)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "mobile layout");
  });

  test("one card is fully visible with the next one peeking", async ({ page }) => {
    test.skip(featured.length < 2, "needs at least two cards");
    expect(await fullyVisible(page)).toEqual([slugs[0]]);
    expect(await partiallyVisible(page)).toBe(2);
  });

  test("swiping (scrollLeft) moves the window and updates the arrows", async ({ page }) => {
    test.skip(featured.length < 2, "needs at least two cards");
    const track = page.getByTestId("carousel-track");
    await expect(page.getByTestId("carousel-prev")).toBeDisabled();

    await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
    await expect.poll(() => fullyVisible(page)).toContain(slugs[slugs.length - 1]);
    await expect(page.getByTestId("carousel-next")).toBeDisabled();
    await expect(page.getByTestId("carousel-prev")).toBeEnabled();

    await track.evaluate((el) => el.scrollTo({ left: 0, behavior: "instant" }));
    await expect(page.getByTestId("carousel-prev")).toBeDisabled();
    expect(await fullyVisible(page)).toEqual([slugs[0]]);
  });

  test("Next advances one card and Prev returns", async ({ page }) => {
    test.skip(featured.length < 2, "needs at least two cards");
    await page.getByTestId("carousel-next").click();
    await expect.poll(() => fullyVisible(page)).toEqual([slugs[1]]);
    await page.getByTestId("carousel-prev").click();
    await expect.poll(() => fullyVisible(page)).toEqual([slugs[0]]);
  });
});
