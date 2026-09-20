import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectFilter } from "@/components/project/ProjectFilter";
import { projects } from "@/data/projects";
import type { Project, ProjectStatus } from "@/lib/types";
import { makeProject } from "../helpers/fixtures";

/** Filter ids derive from the tag: "Next.js" -> "next-js", "+" -> "plus" (docs/dom-hooks.md). */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const STATUSES: ProjectStatus[] = ["active", "in-progress", "archived"];

function techTagsByFrequency(list: Project[]): string[] {
  const counts = new Map<string, number>();
  for (const p of list)
    for (const t of new Set(p.techStack)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

const matching = (list: Project[], status: ProjectStatus | null, tech: string | null) =>
  list.filter(
    (p) =>
      (status === null || p.status === status) && (tech === null || p.techStack.includes(tech)),
  );

/** The count line contains "X ... Y" (numbers), whatever the surrounding copy is. */
function expectCount(shown: number, total: number) {
  expect(screen.getByTestId("filter-count").textContent).toMatch(
    new RegExp(`(^|\\D)${shown}\\D+${total}(\\D|$)`),
  );
}

const cardSlugs = () =>
  screen.queryAllByTestId("project-card").map((c) => c.getAttribute("data-slug"));
const presentStatuses = STATUSES.filter((s) => projects.some((p) => p.status === s));

describe("ProjectFilter with the real project data", () => {
  it("shows every project and a matching count initially", () => {
    render(<ProjectFilter projects={projects} />);
    expect(screen.getByTestId("project-filter")).toBeInTheDocument();
    expect(cardSlugs()).toEqual(projects.map((p) => p.slug));
    expectCount(projects.length, projects.length);
    expect(screen.queryByTestId("filter-clear")).toBeNull();
    expect(screen.queryByTestId("filter-empty")).toBeNull();
  });

  it("offers a status chip for each status present in the data, and only those", () => {
    render(<ProjectFilter projects={projects} />);
    if (presentStatuses.length > 1) {
      expect(screen.getByTestId("filter-status-all")).toHaveAttribute("aria-pressed", "true");
      for (const status of STATUSES) {
        const chip = screen.queryByTestId(`filter-status-${status}`);
        if (presentStatuses.includes(status)) expect(chip).toBeInTheDocument();
        else expect(chip).toBeNull();
      }
    } else {
      expect(screen.queryByTestId("filter-status-all")).toBeNull();
    }
  });

  it("derives tech chips from the techStack data (top 8 by frequency, then alphabetical)", () => {
    render(<ProjectFilter projects={projects} />);
    const tags = techTagsByFrequency(projects);
    const expected = tags.slice(0, 8);
    for (const tag of expected) {
      expect(screen.getByTestId(`filter-tech-${slugify(tag)}`)).toHaveTextContent(tag);
    }
    for (const tag of tags.slice(8)) {
      expect(screen.queryByTestId(`filter-tech-${slugify(tag)}`)).toBeNull();
    }
    if (tags.length > 8) {
      expect(screen.getByTestId("filter-tech-toggle")).toHaveTextContent(String(tags.length));
    } else {
      expect(screen.queryByTestId("filter-tech-toggle")).toBeNull();
    }
  });

  it.each(presentStatuses)("filtering by status %s narrows the grid and count", async (status) => {
    if (presentStatuses.length < 2) return;
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    await user.click(screen.getByTestId(`filter-status-${status}`));

    const expected = matching(projects, status, null);
    expect(cardSlugs()).toEqual(expected.map((p) => p.slug));
    expectCount(expected.length, projects.length);
    expect(screen.getByTestId(`filter-status-${status}`)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("filter-status-all")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("filter-clear")).toBeInTheDocument();
  });

  it("filters by each visible tech chip using the real data", async () => {
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    for (const tag of techTagsByFrequency(projects).slice(0, 8)) {
      const chip = screen.getByTestId(`filter-tech-${slugify(tag)}`);
      await user.click(chip);
      const expected = matching(projects, null, tag);
      expect(chip).toHaveAttribute("aria-pressed", "true");
      expect(cardSlugs()).toEqual(expected.map((p) => p.slug));
      expectCount(expected.length, projects.length);
      await user.click(chip); // deselect again before the next tag
    }
  });

  it("is single-select per group: choosing another chip replaces the first", async () => {
    if (presentStatuses.length < 2) return;
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    const [a, b] = presentStatuses;
    await user.click(screen.getByTestId(`filter-status-${a}`));
    await user.click(screen.getByTestId(`filter-status-${b}`));
    expect(screen.getByTestId(`filter-status-${a}`)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId(`filter-status-${b}`)).toHaveAttribute("aria-pressed", "true");
    expect(cardSlugs()).toEqual(matching(projects, b, null).map((p) => p.slug));
  });

  it("re-clicking the active chip deselects it and restores everything", async () => {
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    const tag = techTagsByFrequency(projects)[0];
    const chip = screen.getByTestId(`filter-tech-${slugify(tag)}`);
    await user.click(chip);
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("filter-tech-all")).toHaveAttribute("aria-pressed", "true");
    expect(cardSlugs()).toHaveLength(projects.length);
    expect(screen.queryByTestId("filter-clear")).toBeNull();
  });

  it("combines status and tech with AND for every combination present in the data", async () => {
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    const tags = techTagsByFrequency(projects).slice(0, 8);
    for (const status of presentStatuses) {
      if (presentStatuses.length < 2) break;
      for (const tag of tags) {
        await user.click(screen.getByTestId(`filter-status-${status}`));
        await user.click(screen.getByTestId(`filter-tech-${slugify(tag)}`));
        const expected = matching(projects, status, tag);
        if (expected.length > 0) {
          expect(cardSlugs()).toEqual(expected.map((p) => p.slug));
          expectCount(expected.length, projects.length);
        } else {
          expect(screen.getByTestId("filter-empty")).toBeInTheDocument();
          expect(cardSlugs()).toHaveLength(0);
        }
        await user.click(screen.getByTestId("filter-clear"));
      }
    }
  });

  it("'Clear filters' resets both groups", async () => {
    if (presentStatuses.length < 2) return;
    const user = userEvent.setup();
    render(<ProjectFilter projects={projects} />);
    await user.click(screen.getByTestId(`filter-status-${presentStatuses[0]}`));
    await user.click(
      screen.getByTestId(`filter-tech-${slugify(techTagsByFrequency(projects)[0])}`),
    );
    await user.click(screen.getByTestId("filter-clear"));
    expect(cardSlugs()).toHaveLength(projects.length);
    expect(screen.getByTestId("filter-status-all")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("filter-tech-all")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByTestId("filter-clear")).toBeNull();
  });

  it("announces the count politely as a status region", () => {
    render(<ProjectFilter projects={projects} />);
    const count = screen.getByTestId("filter-count");
    expect(count).toHaveAttribute("aria-live", "polite");
    expect(count).toHaveAttribute("role", "status");
  });
});

describe("ProjectFilter with fixtures", () => {
  const fixtures = [
    makeProject({ slug: "a", title: "A", status: "active", techStack: ["Alpha"] }),
    makeProject({ slug: "b", title: "B", status: "archived", techStack: ["Beta"] }),
    makeProject({ slug: "c", title: "C", status: "active", techStack: ["Alpha", "Beta"] }),
  ];

  it("shows the empty state for a status+tech combination that matches nothing, and clears it", async () => {
    const user = userEvent.setup();
    render(<ProjectFilter projects={fixtures} />);
    await user.click(screen.getByTestId("filter-status-archived"));
    await user.click(screen.getByTestId("filter-tech-alpha"));

    expect(screen.getByTestId("filter-empty")).toBeInTheDocument();
    expect(screen.queryAllByTestId("project-card")).toHaveLength(0);
    expectCount(0, 3);

    await user.click(screen.getByTestId("filter-empty-clear"));
    expect(screen.queryByTestId("filter-empty")).toBeNull();
    expect(cardSlugs()).toEqual(["a", "b", "c"]);
    expectCount(3, 3);
  });

  it("ANDs the filters: only projects with both the status and the tag remain", async () => {
    const user = userEvent.setup();
    render(<ProjectFilter projects={fixtures} />);
    await user.click(screen.getByTestId("filter-status-active"));
    await user.click(screen.getByTestId("filter-tech-beta"));
    expect(cardSlugs()).toEqual(["c"]);
    expectCount(1, 3);
  });

  it("hides the status group when every project shares one status", () => {
    render(<ProjectFilter projects={fixtures.filter((p) => p.status === "active")} />);
    expect(screen.queryByTestId("filter-status-all")).toBeNull();
    expect(screen.getByTestId("filter-tech-all")).toBeInTheDocument();
  });

  it("copes with an empty project list", () => {
    expect(() => render(<ProjectFilter projects={[]} />)).not.toThrow();
    expect(screen.queryAllByTestId("project-card")).toHaveLength(0);
  });

  describe("Show all toggle", () => {
    // t01..t10, one project each with two of them so ordering is by count then alphabet.
    const tags = Array.from({ length: 10 }, (_, i) => `Tag${String(i + 1).padStart(2, "0")}`);
    const many = tags.map((tag, i) =>
      makeProject({ slug: `p${i + 1}`, title: `P${i + 1}`, techStack: [tag] }),
    );
    const chipTestIds = () =>
      screen
        .getAllByRole("button")
        .map((b) => b.getAttribute("data-testid") ?? "")
        .filter(
          (id) =>
            id.startsWith("filter-tech-") &&
            !["filter-tech-all", "filter-tech-toggle"].includes(id),
        );

    it("collapses to 8 tags, expands to all, and reports aria-expanded", async () => {
      const user = userEvent.setup();
      render(<ProjectFilter projects={many} />);
      const toggle = screen.getByTestId("filter-tech-toggle");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveTextContent("10");
      expect(chipTestIds()).toHaveLength(8);

      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(chipTestIds()).toHaveLength(10);

      await user.click(toggle);
      expect(chipTestIds()).toHaveLength(8);
    });

    it("keeps a selected hidden tag visible after collapsing again", async () => {
      const user = userEvent.setup();
      render(<ProjectFilter projects={many} />);
      const toggle = screen.getByTestId("filter-tech-toggle");
      await user.click(toggle);
      const last = tags[9];
      expect(screen.queryByTestId(`filter-tech-${slugify(last)}`)).toBeInTheDocument();
      await user.click(screen.getByTestId(`filter-tech-${slugify(last)}`));
      await user.click(toggle); // collapse
      const kept = screen.getByTestId(`filter-tech-${slugify(last)}`);
      expect(kept).toHaveAttribute("aria-pressed", "true");
      expect(chipTestIds()).toHaveLength(9);
      expect(
        within(screen.getByTestId("project-filter")).getAllByTestId("project-card"),
      ).toHaveLength(1);
    });

    it("has no toggle when 8 or fewer tags exist", () => {
      render(<ProjectFilter projects={many.slice(0, 8)} />);
      expect(screen.queryByTestId("filter-tech-toggle")).toBeNull();
    });
  });
});
