import { describe, expect, it } from "vitest";
import { projectMetadata, routeMetadata } from "@/data/metadata";
import { projects } from "@/data/projects";

describe("route metadata", () => {
  it("defines a non-empty title for every static route", () => {
    for (const [route, meta] of Object.entries(routeMetadata)) {
      expect(typeof meta.title, route).toBe("string");
      expect((meta.title as string).length, route).toBeGreaterThan(0);
    }
  });

  it("derives project metadata from title and summary", () => {
    for (const project of projects) {
      const meta = projectMetadata(project);
      expect(meta.title).toBe(project.title);
      expect(meta.description).toBe(project.summary);
    }
  });
});
