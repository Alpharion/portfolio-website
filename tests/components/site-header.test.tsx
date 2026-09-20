import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteContent } from "@/data/site-content";

afterEach(() => {
  globalThis.__TEST_PATHNAME__ = undefined;
});

describe("SiteHeader", () => {
  it("renders the header with a Primary nav landmark", () => {
    render(<SiteHeader />);
    const header = screen.getByTestId("site-header");
    expect(within(header).getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });

  it("renders one nav-link per configured nav item with the right href", () => {
    render(<SiteHeader />);
    const links = screen.getAllByTestId("nav-link");
    expect(links).toHaveLength(siteContent.nav.length);
    siteContent.nav.forEach((item, i) => {
      expect(links[i]).toHaveAttribute("href", item.href);
      expect(links[i]).toHaveTextContent(item.label);
    });
  });

  it("links the site name/brand to the home page", () => {
    render(<SiteHeader />);
    const home = screen
      .getAllByRole("link")
      .find(
        (l) => l.getAttribute("href") === "/" && l.textContent?.includes(siteContent.site.name),
      );
    expect(home).toBeDefined();
  });

  it("marks only the current route's link as active", () => {
    globalThis.__TEST_PATHNAME__ = "/projects";
    render(<SiteHeader />);
    const links = screen.getAllByTestId("nav-link");
    const active = links.filter((l) => l.classList.contains("is-active"));
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute("href", "/projects");
  });

  it("treats nested routes as belonging to their section", () => {
    globalThis.__TEST_PATHNAME__ = "/projects/anything";
    render(<SiteHeader />);
    const active = screen
      .getAllByTestId("nav-link")
      .filter((l) => l.classList.contains("is-active"));
    expect(active.map((l) => l.getAttribute("href"))).toEqual(["/projects"]);
  });

  describe("mobile menu toggle", () => {
    it("starts collapsed and points aria-controls at an element in the DOM", () => {
      render(<SiteHeader />);
      const toggle = screen.getByTestId("nav-toggle");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      const controls = toggle.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });

    it("toggles aria-expanded on each click", async () => {
      const user = userEvent.setup();
      render(<SiteHeader />);
      const toggle = screen.getByTestId("nav-toggle");
      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    it("has an accessible name", () => {
      render(<SiteHeader />);
      expect(screen.getByTestId("nav-toggle")).toHaveAccessibleName();
    });

    it("collapses again after choosing a nav link", async () => {
      const user = userEvent.setup();
      render(<SiteHeader />);
      const toggle = screen.getByTestId("nav-toggle");
      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      await user.click(screen.getAllByTestId("nav-link")[0]);
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("SiteFooter", () => {
  it("renders the footer with a link for every social", () => {
    render(<SiteFooter />);
    const footer = screen.getByTestId("site-footer");
    for (const social of siteContent.socials) {
      const link = within(footer)
        .getAllByRole("link")
        .find((l) => l.getAttribute("href") === social.href);
      expect(link, `${social.label} link`).toBeDefined();
      expect(link).toHaveAccessibleName();
    }
  });
});
