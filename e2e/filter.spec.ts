import { expect, test, type Page } from "@playwright/test";
import type { ProjectStatus } from "../lib/types";
import {
  matching,
  presentStatuses,
  projects,
  slugify,
  techTagsByFrequency,
  waitForHydration,
} from "./helpers";

const total = projects.length;
const collapsedTags = techTagsByFrequency().slice(0, 8);
const chip = (page: Page, id: string) => page.getByTestId(id);
const statusChip = (page: Page, status: string) => chip(page, `filter-status-${status}`);
const techChip = (page: Page, tag: string) => chip(page, `filter-tech-${slugify(tag)}`);
const cardSlugs = (page: Page) =>
  page
    .getByTestId("project-card")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));

/** The count line reads "... X ... Y ..."; assert on the two numbers only, not the copy. */
async function expectCount(page: Page, shown: number, of = total) {
  await expect(page.getByTestId("filter-count")).toHaveText(
    new RegExp(`(^|\\D)${shown}\\D+${of}(\\D|$)`),
  );
}

async function expectShows(page: Page, expected: typeof projects) {
  await expectCount(page, expected.length);
  await expect.poll(() => cardSlugs(page)).toEqual(expected.map((p) => p.slug));
}

test.beforeEach(async ({ page }) => {
  await page.goto("/projects");
  await waitForHydration(page, "filter-tech-all");
});

test.describe("/projects filter", () => {
  test("starts unfiltered: count equals the total and every card is shown", async ({ page }) => {
    await expect(page.getByTestId("project-filter")).toBeVisible();
    await expectShows(page, projects);
    await expect(page.getByTestId("filter-clear")).toHaveCount(0);
    await expect(page.getByTestId("filter-empty")).toHaveCount(0);
    await expect(chip(page, "filter-tech-all")).toHaveAttribute("aria-pressed", "true");
  });

  test("the count is an aria-live status region", async ({ page }) => {
    const count = page.getByTestId("filter-count");
    await expect(count).toHaveAttribute("aria-live", /^(polite|assertive)$/);
    await expect(count).toHaveAttribute("role", "status");
  });

  for (const status of presentStatuses) {
    test(`status "${status}" shows the projects computed from the data`, async ({ page }) => {
      test.skip(presentStatuses.length < 2, "status group is hidden with a single status");
      await statusChip(page, status).click();
      await expect(statusChip(page, status)).toHaveAttribute("aria-pressed", "true");
      await expect(chip(page, "filter-status-all")).toHaveAttribute("aria-pressed", "false");
      await expectShows(page, matching(status, null));
    });
  }

  test("the status group offers exactly the statuses present in the data", async ({ page }) => {
    test.skip(presentStatuses.length < 2, "status group is hidden with a single status");
    const ids = await page
      .locator('[data-testid^="filter-status-"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
    expect(ids.sort()).toEqual(
      ["filter-status-all", ...presentStatuses.map((s) => `filter-status-${s}`)].sort(),
    );
  });

  test("a tech chip filters to the projects using that technology", async ({ page }) => {
    const tag = collapsedTags[0];
    await techChip(page, tag).click();
    await expect(techChip(page, tag)).toHaveAttribute("aria-pressed", "true");
    await expectShows(page, matching(null, tag));
  });

  test("every visible tech chip yields the count computed from the data", async ({ page }) => {
    for (const tag of collapsedTags) {
      await techChip(page, tag).click();
      await expectShows(page, matching(null, tag));
      await techChip(page, tag).click();
    }
    await expectCount(page, total);
  });

  test("status and tech combine with AND", async ({ page }) => {
    test.skip(presentStatuses.length < 2, "status group is hidden with a single status");
    // Pick a status/tag pair that matches something but strictly fewer than either filter alone.
    let picked: { status: ProjectStatus; tag: string } | undefined;
    for (const status of presentStatuses) {
      for (const tag of collapsedTags) {
        const both = matching(status, tag).length;
        if (both > 0 && both < matching(status, null).length && both < matching(null, tag).length) {
          picked = { status, tag };
        }
      }
    }
    test.skip(!picked, "no status/tag pair narrows further in the current data");
    const { status, tag } = picked!;
    await statusChip(page, status).click();
    await techChip(page, tag).click();
    await expectShows(page, matching(status, tag));
  });

  test("selecting another chip in a group replaces the previous selection", async ({ page }) => {
    test.skip(presentStatuses.length < 2, "status group is hidden with a single status");
    const [a, b] = presentStatuses;
    await statusChip(page, a).click();
    await statusChip(page, b).click();
    await expect(statusChip(page, a)).toHaveAttribute("aria-pressed", "false");
    await expect(statusChip(page, b)).toHaveAttribute("aria-pressed", "true");
    await expectShows(page, matching(b, null));
  });

  test("re-clicking the active chip deselects it", async ({ page }) => {
    const tag = collapsedTags[0];
    await techChip(page, tag).click();
    await techChip(page, tag).click();
    await expect(techChip(page, tag)).toHaveAttribute("aria-pressed", "false");
    await expect(chip(page, "filter-tech-all")).toHaveAttribute("aria-pressed", "true");
    await expectShows(page, projects);
    await expect(page.getByTestId("filter-clear")).toHaveCount(0);
  });

  test("'Clear filters' appears with an active filter and restores everything", async ({
    page,
  }) => {
    await techChip(page, collapsedTags[0]).click();
    await page.getByTestId("filter-clear").click();
    await expectShows(page, projects);
    await expect(page.getByTestId("filter-clear")).toHaveCount(0);
  });

  test("a combination that matches nothing shows the empty state, and clearing restores all", async ({
    page,
  }) => {
    test.skip(presentStatuses.length < 2, "status group is hidden with a single status");
    let empty: { status: ProjectStatus; tag: string } | undefined;
    for (const status of presentStatuses) {
      for (const tag of collapsedTags) {
        if (matching(status, tag).length === 0) empty ??= { status, tag };
      }
    }
    test.skip(!empty, "every visible status/tag pair has results in the current data");
    await statusChip(page, empty!.status).click();
    await techChip(page, empty!.tag).click();

    await expect(page.getByTestId("filter-empty")).toBeVisible();
    await expect(page.getByTestId("project-card")).toHaveCount(0);
    await expectCount(page, 0);

    await page.getByTestId("filter-empty-clear").click();
    await expect(page.getByTestId("filter-empty")).toHaveCount(0);
    await expectShows(page, projects);
  });

  test("a filtered card still opens its project", async ({ page }) => {
    const tag = collapsedTags[0];
    await techChip(page, tag).click();
    const first = matching(null, tag)[0];
    await page.locator(`[data-testid="project-card"][data-slug="${first.slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
  });

  test("the 'Show all' toggle reveals every tag and keeps a selected tag visible", async ({
    page,
  }) => {
    const all = techTagsByFrequency();
    test.skip(all.length <= 8, "8 or fewer tags: no toggle");
    const toggle = page.getByTestId("filter-tech-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const hidden = all[all.length - 1];
    await expect(techChip(page, hidden)).toHaveCount(0);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(techChip(page, hidden)).toBeVisible();

    await techChip(page, hidden).click();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(techChip(page, hidden)).toHaveAttribute("aria-pressed", "true");
  });

  test("chips are keyboard operable: Enter and Space toggle them", async ({ page }) => {
    const tag = collapsedTags[0];
    const target = techChip(page, tag);
    await target.focus();
    await expect(target).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await expectShows(page, matching(null, tag));

    await page.keyboard.press("Space");
    await expect(target).toHaveAttribute("aria-pressed", "false");
    await expectShows(page, projects);
  });

  test("Tab reaches the chips in order from the start of the filter bar", async ({ page }) => {
    const first = page.getByTestId("project-filter").locator("button").first();
    await first.focus();
    await page.keyboard.press("Tab");
    const focusedIsChip = await page.evaluate(
      () =>
        document.activeElement?.tagName === "BUTTON" &&
        !!document.activeElement.closest('[data-testid="project-filter"]'),
    );
    expect(focusedIsChip).toBe(true);
  });
});

test.describe("/projects without JavaScript", () => {
  test("server HTML already contains a card for every project", async ({ request }) => {
    const response = await request.get("/projects");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html.match(/data-testid="project-card"/g) ?? []).toHaveLength(total);
    for (const project of projects) expect(html).toContain(`data-slug="${project.slug}"`);
  });

  test("renders all cards with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/projects");
    await expect(page.getByTestId("project-card")).toHaveCount(total);
    await context.close();
  });
});
