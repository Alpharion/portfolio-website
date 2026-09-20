import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getProjectSlugs } from "@/lib/projects";
import { siteContent } from "@/data/site-content";

const config = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../lighthouserc.json"), "utf8"),
) as {
  ci: {
    collect: { url: string[]; numberOfRuns: number; settings: { preset: string } };
    assert: { assertions: Record<string, unknown> };
    upload: { target: string };
  };
};

describe("lighthouserc.json", () => {
  const { collect, assert } = config.ci;

  it("audits only routes that exist in the app (guards against slug drift)", () => {
    const staticRoutes = new Set(["/", ...siteContent.nav.map((n) => n.href)]);
    const slugs = new Set(getProjectSlugs());
    for (const url of collect.url) {
      const { pathname } = new URL(url);
      const isProject = pathname.startsWith("/projects/");
      const ok = isProject ? slugs.has(pathname.replace("/projects/", "")) : staticRoutes.has(pathname);
      expect(ok, `${pathname} must be a real route`).toBe(true);
    }
  });

  it("covers every top-level nav route and at least one project detail page", () => {
    const paths = collect.url.map((u) => new URL(u).pathname);
    for (const item of siteContent.nav) expect(paths).toContain(item.href);
    expect(paths.some((p) => p.startsWith("/projects/"))).toBe(true);
  });

  it("uses the desktop preset with multiple runs and a filesystem upload", () => {
    expect(collect.settings.preset).toBe("desktop");
    expect(collect.numberOfRuns).toBeGreaterThanOrEqual(2);
    expect(config.ci.upload.target).toBe("filesystem");
  });

  it("enforces the agreed category budgets", () => {
    const a = assert.assertions as Record<string, [string, { minScore: number }]>;
    expect(a["categories:accessibility"]).toEqual(["error", { minScore: 0.95 }]);
    expect(a["categories:best-practices"]).toEqual(["error", { minScore: 0.9 }]);
    expect(a["categories:seo"]).toEqual(["error", { minScore: 0.9 }]);
    expect(a["categories:performance"]).toEqual(["warn", { minScore: 0.85 }]);
  });

  it("treats the key audits as errors", () => {
    for (const audit of [
      "color-contrast",
      "image-alt",
      "document-title",
      "meta-description",
      "link-name",
      "heading-order",
    ]) {
      expect(assert.assertions[audit]).toBe("error");
    }
  });
});
