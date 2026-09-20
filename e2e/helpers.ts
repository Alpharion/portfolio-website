import { expect, type Page } from "@playwright/test";
import { siteContent } from "../data/site-content";
import type { Project, ProjectStatus } from "../lib/types";
import { getAllProjects } from "../lib/projects";

export const projects = getAllProjects();
export const nav = siteContent.nav;

/** Every static route plus every project detail route. */
export const allRoutes: string[] = [
  ...new Set([...nav.map((n) => n.href), "/", "/projects", "/about", "/contact"]),
  ...projects.map((p) => `/projects/${p.slug}`),
];

/** Collects console errors and uncaught exceptions; assert on the returned array at the end. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** On narrow viewports the menu sits behind a toggle; open it when it is collapsed. */
export async function openNavIfCollapsed(page: Page): Promise<void> {
  const toggle = page.getByTestId("nav-toggle");
  if ((await toggle.isVisible()) && (await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  }
}

/** Structural invariants every page must satisfy. */
export async function expectPageBasics(page: Page): Promise<void> {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByTestId("site-header")).toBeVisible();
  await expect(page.getByTestId("site-footer")).toBeVisible();
}

/** Ids for filter chips derive from the label: "Next.js" -> "next-js", "+" -> "plus". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Every tech tag, most used first, then alphabetical (the order the filter bar uses). */
export function techTagsByFrequency(list: Project[] = projects): string[] {
  const counts = new Map<string, number>();
  for (const p of list)
    for (const t of new Set(p.techStack)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

export function matching(status: ProjectStatus | null, tech: string | null): Project[] {
  return projects.filter(
    (p) =>
      (status === null || p.status === status) && (tech === null || p.techStack.includes(tech)),
  );
}

export const STATUS_ORDER: ProjectStatus[] = ["active", "in-progress", "archived"];
export const presentStatuses = STATUS_ORDER.filter((s) => projects.some((p) => p.status === s));

/** Wait until React has hydrated the element (clicks before that would be lost). */
export async function waitForHydration(page: Page, testId: string): Promise<void> {
  await page.waitForFunction((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
  }, testId);
}
