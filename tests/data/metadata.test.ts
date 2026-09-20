import { describe, expect, it } from "vitest";
import { projectMetadata, routeMetadata } from "@/data/metadata";
import { projects } from "@/data/projects";

/** A Next.js title may be a string or an object form (`absolute` / `default`). */
function titleText(title: unknown): string {
  if (typeof title === "string") return title;
  if (title && typeof title === "object") {
    const t = title as { absolute?: unknown; default?: unknown };
    if (typeof t.absolute === "string") return t.absolute;
    if (typeof t.default === "string") return t.default;
  }
  return "";
}

describe("route metadata", () => {
  it("defines a non-empty title for every static route", () => {
    for (const [route, meta] of Object.entries(routeMetadata)) {
      expect(titleText(meta.title).length, route).toBeGreaterThan(0);
    }
  });

  it("derives project metadata from title and summary", () => {
    for (const project of projects) {
      const meta = projectMetadata(project);
      expect(titleText(meta.title)).toBe(project.title);
      expect(meta.description).toBe(project.summary);
    }
  });
});
