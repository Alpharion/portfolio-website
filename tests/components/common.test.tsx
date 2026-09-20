import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonLink } from "@/components/common/ButtonLink";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TechTag } from "@/components/common/TechTag";
import type { ProjectStatus } from "@/lib/types";

describe("StatusBadge", () => {
  it.each<ProjectStatus>(["active", "archived", "in-progress"])(
    "renders visible text and a modifier class for %s",
    (status) => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(`status-badge--${status}`);
      expect(badge?.textContent?.trim().length).toBeGreaterThan(0);
    },
  );

  it("renders distinct text per status", () => {
    const texts = (["active", "archived", "in-progress"] as const).map((status) => {
      const { container, unmount } = render(<StatusBadge status={status} />);
      const text = container.textContent;
      unmount();
      return text;
    });
    expect(new Set(texts).size).toBe(3);
  });
});

describe("TechTag", () => {
  it("renders its label inside a tech-tag element", () => {
    render(<TechTag label="TypeScript" />);
    const tag = screen.getByText("TypeScript");
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass("tech-tag");
  });
});

describe("ButtonLink", () => {
  it("renders an internal link with the given href and default primary variant", () => {
    render(<ButtonLink href="/projects">Go</ButtonLink>);
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/projects");
    expect(link).toHaveClass("btn", "btn--primary");
    expect(link).not.toHaveAttribute("target");
  });

  it.each(["primary", "secondary", "ghost"] as const)("applies the %s variant class", (variant) => {
    render(
      <ButtonLink href="/x" variant={variant}>
        Label
      </ButtonLink>,
    );
    expect(screen.getByRole("link")).toHaveClass("btn", `btn--${variant}`);
  });

  it("opens external links safely in a new tab", () => {
    render(
      <ButtonLink href="https://example.com" external>
        Out
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Out" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("merges a custom className", () => {
    render(
      <ButtonLink href="/x" className="extra">
        Label
      </ButtonLink>,
    );
    expect(screen.getByRole("link")).toHaveClass("btn", "extra");
  });
});

describe("SectionHeading", () => {
  it("renders the title as a heading", () => {
    render(<SectionHeading title="My Title" />);
    expect(screen.getByRole("heading", { name: "My Title" })).toBeInTheDocument();
  });

  it("renders eyebrow and description only when provided", () => {
    const { container, rerender } = render(<SectionHeading title="T" />);
    expect(container.querySelector(".section-heading__eyebrow")).toBeNull();
    expect(container.querySelector(".section-heading__description")).toBeNull();

    rerender(<SectionHeading eyebrow="Eyebrow text" title="T" description="Description text" />);
    expect(screen.getByText("Eyebrow text")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("does not render an h1 (page titles belong to the routes)", () => {
    render(<SectionHeading title="T" />);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});
