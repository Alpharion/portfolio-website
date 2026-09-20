import { expect, type Page } from "@playwright/test";
import { siteContent } from "../data/site-content";
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
