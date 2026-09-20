import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { rootMetadata } from "@/data/metadata";
import { projects } from "@/data/projects";
import { siteContent } from "@/data/site-content";
import type { ProjectStatus } from "@/lib/types";

/**
 * Generic data-integrity checks: they hold for ANY valid content, not just the placeholder stubs.
 */

const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const STATUSES: ProjectStatus[] = ["active", "archived", "in-progress"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nonEmpty = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;
const publicFileExists = (p: string): boolean =>
  fs.existsSync(path.join(PUBLIC_DIR, p.replace(/^\//, "")));
const isAbsoluteUrl = (v: string): boolean => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:";
  } catch {
    return false;
  }
};

describe("data/projects", () => {
  it("has at least one project and at least one featured project", () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((p) => p.featured)).toBe(true);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe.each(projects.map((p) => [p.slug, p] as const))("project %s", (_slug, project) => {
    it("has a lowercase, URL-safe slug", () => {
      expect(project.slug).toMatch(SLUG_RE);
      expect(encodeURIComponent(project.slug)).toBe(project.slug);
    });

    it("has all required text fields non-empty", () => {
      for (const key of ["title", "summary", "description", "role", "timeframe"] as const) {
        expect(nonEmpty(project[key]), `${key} must be non-empty`).toBe(true);
      }
    });

    it("has a non-empty tech stack of non-empty labels", () => {
      expect(project.techStack.length).toBeGreaterThan(0);
      for (const tag of project.techStack) expect(nonEmpty(tag)).toBe(true);
    });

    it("has a valid status and boolean featured flag", () => {
      expect(STATUSES).toContain(project.status);
      expect(typeof project.featured).toBe("boolean");
    });

    it("has absolute http(s) liveUrl / repoUrl when provided", () => {
      for (const url of [project.liveUrl, project.repoUrl]) {
        if (url === undefined) continue;
        expect(url).toMatch(/^https?:\/\//);
        expect(() => new URL(url)).not.toThrow();
      }
    });

    it("has images that exist under public/ and carry alt text", () => {
      expect(Array.isArray(project.images)).toBe(true);
      for (const image of project.images) {
        expect(image.src.startsWith("/"), `${image.src} must be a root-relative path`).toBe(true);
        expect(publicFileExists(image.src), `public${image.src} must exist`).toBe(true);
        expect(nonEmpty(image.alt), `${image.src} needs alt text`).toBe(true);
        if (image.width !== undefined) expect(image.width).toBeGreaterThan(0);
        if (image.height !== undefined) expect(image.height).toBeGreaterThan(0);
      }
    });
  });
});

describe("data/site-content", () => {
  it("has non-empty site identity and an absolute origin without trailing slash", () => {
    const { site } = siteContent;
    for (const key of ["name", "tagline", "description", "url"] as const) {
      expect(nonEmpty(site[key]), `site.${key}`).toBe(true);
    }
    expect(() => new URL(site.url)).not.toThrow();
    expect(site.url).toMatch(/^https?:\/\//);
    expect(site.url.endsWith("/")).toBe(false);
  });

  it("has nav items with labels and root-relative hrefs, unique hrefs, including home", () => {
    const { nav } = siteContent;
    expect(nav.length).toBeGreaterThan(0);
    for (const item of nav) {
      expect(nonEmpty(item.label)).toBe(true);
      expect(item.href.startsWith("/")).toBe(true);
    }
    expect(new Set(nav.map((n) => n.href)).size).toBe(nav.length);
    expect(nav.some((n) => n.href === "/")).toBe(true);
  });

  it("has hero copy and CTAs with root-relative or absolute hrefs", () => {
    const { hero } = siteContent;
    for (const key of ["eyebrow", "headline", "subheadline"] as const) {
      expect(nonEmpty(hero[key]), `hero.${key}`).toBe(true);
    }
    for (const cta of [hero.primaryCta, hero.secondaryCta]) {
      expect(nonEmpty(cta.label)).toBe(true);
      expect(cta.href.startsWith("/") || isAbsoluteUrl(cta.href)).toBe(true);
    }
  });

  it("has about content with paragraphs, skills and highlights", () => {
    const { about } = siteContent;
    expect(nonEmpty(about.heading)).toBe(true);
    expect(about.bio.length).toBeGreaterThan(0);
    about.bio.forEach((p) => expect(nonEmpty(p)).toBe(true));
    for (const group of about.skills) {
      expect(nonEmpty(group.group)).toBe(true);
      expect(group.items.length).toBeGreaterThan(0);
      group.items.forEach((i) => expect(nonEmpty(i)).toBe(true));
    }
    for (const h of about.highlights) {
      expect(nonEmpty(h.label)).toBe(true);
      expect(nonEmpty(h.value)).toBe(true);
    }
  });

  it("has an avatar that exists under public/ with alt text when provided", () => {
    const { avatar } = siteContent.about;
    if (!avatar) return;
    expect(publicFileExists(avatar.src), `public${avatar.src} must exist`).toBe(true);
    expect(nonEmpty(avatar.alt)).toBe(true);
  });

  it("has contact content with a plausible email", () => {
    const { contact } = siteContent;
    expect(nonEmpty(contact.heading)).toBe(true);
    expect(nonEmpty(contact.blurb)).toBe(true);
    expect(contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has a résumé label and a href pointing to an existing file in public/", () => {
    const { resume } = siteContent;
    expect(nonEmpty(resume.label)).toBe(true);
    expect(resume.href.startsWith("/")).toBe(true);
    expect(publicFileExists(resume.href), `public${resume.href} must exist`).toBe(true);
  });

  it("has social links with labels, known icons and absolute URLs", () => {
    const icons = ["github", "linkedin", "twitter", "mail", "link"];
    expect(siteContent.socials.length).toBeGreaterThan(0);
    for (const s of siteContent.socials) {
      expect(nonEmpty(s.label)).toBe(true);
      expect(icons).toContain(s.icon);
      expect(isAbsoluteUrl(s.href), `${s.href} must be an absolute URL`).toBe(true);
    }
  });

  it("has a footer note", () => {
    expect(nonEmpty(siteContent.footer.note)).toBe(true);
  });
});

describe("data/metadata", () => {
  it("has a parseable metadataBase matching the site URL", () => {
    const base = rootMetadata.metadataBase;
    expect(base).toBeInstanceOf(URL);
    expect((base as URL).origin).toBe(new URL(siteContent.site.url).origin);
  });

  it("has a title and description", () => {
    expect(rootMetadata.title).toBeTruthy();
    expect(nonEmpty(rootMetadata.description)).toBe(true);
  });
});
