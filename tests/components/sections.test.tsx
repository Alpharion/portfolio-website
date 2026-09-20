import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutBlock } from "@/components/sections/AboutBlock";
import { Hero } from "@/components/sections/Hero";
import { siteContent } from "@/data/site-content";

describe("Hero", () => {
  it("renders the hero root with the headline as the only h1", () => {
    render(<Hero content={siteContent.hero} />);
    const hero = screen.getByTestId("hero");
    const h1s = within(hero).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(siteContent.hero.headline);
  });

  it("renders both CTAs with the configured hrefs", () => {
    render(<Hero content={siteContent.hero} />);
    for (const cta of [siteContent.hero.primaryCta, siteContent.hero.secondaryCta]) {
      expect(screen.getByRole("link", { name: cta.label })).toHaveAttribute("href", cta.href);
    }
  });

  it("renders supplied fixture content, not hard-coded copy", () => {
    render(
      <Hero
        content={{
          eyebrow: "EYEBROW-XYZ",
          headline: "HEADLINE-XYZ",
          subheadline: "SUB-XYZ",
          primaryCta: { label: "PRIMARY-XYZ", href: "/a" },
          secondaryCta: { label: "SECONDARY-XYZ", href: "/b" },
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "HEADLINE-XYZ" })).toBeInTheDocument();
    expect(screen.getByText("EYEBROW-XYZ")).toBeInTheDocument();
    expect(screen.getByText("SUB-XYZ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PRIMARY-XYZ" })).toHaveAttribute("href", "/a");
    expect(screen.getByRole("link", { name: "SECONDARY-XYZ" })).toHaveAttribute("href", "/b");
  });
});

describe("AboutBlock", () => {
  it("renders every bio paragraph, skill group/item and highlight", () => {
    const { about } = siteContent;
    render(<AboutBlock content={about} />);
    for (const paragraph of about.bio) expect(screen.getByText(paragraph)).toBeInTheDocument();
    for (const group of about.skills) {
      expect(screen.getByText(group.group)).toBeInTheDocument();
      for (const item of group.items) expect(screen.getAllByText(item).length).toBeGreaterThan(0);
    }
    for (const h of about.highlights) {
      expect(screen.getByText(h.label)).toBeInTheDocument();
      expect(screen.getByText(h.value)).toBeInTheDocument();
    }
  });

  it("renders the avatar with alt text when provided and omits it otherwise", () => {
    const base = { bio: ["Bio."], skills: [], highlights: [], heading: "About" };
    const { rerender } = render(<AboutBlock content={base} />);
    expect(screen.queryByRole("img")).toBeNull();

    rerender(
      <AboutBlock content={{ ...base, avatar: { src: "/images/avatar.svg", alt: "Me" } }} />,
    );
    expect(screen.getByRole("img", { name: "Me" })).toBeInTheDocument();
  });

  it("copes with empty skills and highlights", () => {
    expect(() =>
      render(
        <AboutBlock content={{ heading: "H", bio: ["Only bio."], skills: [], highlights: [] }} />,
      ),
    ).not.toThrow();
    expect(screen.getByText("Only bio.")).toBeInTheDocument();
  });
});
