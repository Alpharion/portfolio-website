import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/projects";

describe("lib/projects helpers", () => {
  it("getAllProjects returns every project in data order", () => {
    expect(getAllProjects()).toEqual(projects);
    expect(getAllProjects()).toHaveLength(projects.length);
  });

  it("getFeaturedProjects returns only featured projects", () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
    expect(featured).toHaveLength(projects.filter((p) => p.featured).length);
  });

  it("getProjectSlugs matches the slugs of all projects", () => {
    expect(getProjectSlugs()).toEqual(projects.map((p) => p.slug));
  });

  it("getProjectBySlug finds every project by its slug", () => {
    for (const project of projects) {
      expect(getProjectBySlug(project.slug)).toBe(project);
    }
  });

  it("getProjectBySlug returns undefined for unknown, empty or differently-cased slugs", () => {
    expect(getProjectBySlug("definitely-not-a-project-slug")).toBeUndefined();
    expect(getProjectBySlug("")).toBeUndefined();
    const first = projects[0].slug;
    if (first !== first.toUpperCase()) {
      expect(getProjectBySlug(first.toUpperCase())).toBeUndefined();
    }
  });
});
