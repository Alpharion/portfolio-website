import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { projects } from "@/data/projects";
import { getFeaturedProjects } from "@/lib/projects";
import { makeProject, projectWithoutImages } from "../helpers/fixtures";

describe("ProjectCard", () => {
  it("is a single link to /projects/<slug> carrying the test hooks", () => {
    const project = makeProject();
    render(<ProjectCard project={project} />);
    const card = screen.getByTestId("project-card");
    expect(card.tagName).toBe("A");
    expect(card).toHaveAttribute("href", `/projects/${project.slug}`);
    expect(card).toHaveAttribute("data-slug", project.slug);
  });

  it("shows the title, summary and every tech tag", () => {
    const project = makeProject();
    render(<ProjectCard project={project} />);
    const card = screen.getByTestId("project-card");
    expect(within(card).getByText(project.title)).toBeInTheDocument();
    expect(within(card).getByText(project.summary)).toBeInTheDocument();
    for (const tech of project.techStack) {
      expect(within(card).getByText(tech)).toBeInTheDocument();
    }
  });

  it("renders the cover image with its alt text", () => {
    const project = makeProject();
    render(<ProjectCard project={project} />);
    expect(screen.getByRole("img", { name: project.images[0].alt })).toBeInTheDocument();
  });

  it("falls back gracefully (no throw, no <img>) when images is empty", () => {
    expect(() => render(<ProjectCard project={projectWithoutImages} />)).not.toThrow();
    const card = screen.getByTestId("project-card");
    expect(within(card).queryByRole("img")).toBeNull();
    expect(card.querySelector("img")).toBeNull();
    expect(card).toHaveAttribute("href", `/projects/${projectWithoutImages.slug}`);
  });

  it.each(projects.map((p) => [p.slug, p] as const))("renders real project %s", (slug, project) => {
    render(<ProjectCard project={project} />);
    expect(screen.getByTestId("project-card")).toHaveAttribute("href", `/projects/${slug}`);
    expect(screen.getByText(project.title)).toBeInTheDocument();
  });
});

describe("ProjectGrid", () => {
  it("renders one card per project, in order, with the right hrefs", () => {
    render(<ProjectGrid projects={projects} />);
    const cards = screen.getAllByTestId("project-card");
    expect(cards).toHaveLength(projects.length);
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute("data-slug", projects[i].slug);
      expect(card).toHaveAttribute("href", `/projects/${projects[i].slug}`);
    });
  });

  it("renders without cards (and does not throw) for an empty list", () => {
    expect(() => render(<ProjectGrid projects={[]} />)).not.toThrow();
    expect(screen.queryAllByTestId("project-card")).toHaveLength(0);
  });

  it("handles a mix of projects with and without images", () => {
    render(<ProjectGrid projects={[makeProject(), projectWithoutImages]} />);
    expect(screen.getAllByTestId("project-card")).toHaveLength(2);
  });
});

describe("FeaturedProjects", () => {
  it("renders a card for each featured project and no link to the full project list", () => {
    const featured = getFeaturedProjects();
    render(<FeaturedProjects projects={featured} />);
    expect(screen.getAllByTestId("project-card")).toHaveLength(featured.length);
    // The section is a carousel now: the "view all projects" link was removed on purpose.
    const hrefs = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(hrefs).not.toContain("/projects");
    expect(hrefs.every((h) => h?.startsWith("/projects/"))).toBe(true);
  });

  it("renders nothing when there are no featured projects", () => {
    const { container } = render(<FeaturedProjects projects={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ProjectDetail", () => {
  it("renders the project-detail root with the title as the only h1", () => {
    const project = makeProject();
    render(<ProjectDetail project={project} />);
    expect(screen.getByTestId("project-detail")).toBeInTheDocument();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(project.title);
  });

  it("renders every description paragraph", () => {
    const project = makeProject();
    render(<ProjectDetail project={project} />);
    for (const paragraph of project.description.split("\n\n")) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("shows role, timeframe, tech stack and summary", () => {
    const project = makeProject();
    render(<ProjectDetail project={project} />);
    expect(screen.getByText(project.role)).toBeInTheDocument();
    expect(screen.getByText(project.timeframe)).toBeInTheDocument();
    expect(screen.getByText(project.summary)).toBeInTheDocument();
    for (const tech of project.techStack) expect(screen.getByText(tech)).toBeInTheDocument();
  });

  it("links to the live site and repo when provided", () => {
    const project = makeProject();
    render(<ProjectDetail project={project} />);
    const hrefs = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(hrefs).toContain(project.liveUrl);
    expect(hrefs).toContain(project.repoUrl);
  });

  it("omits external links that are absent", () => {
    render(<ProjectDetail project={makeProject({ liveUrl: undefined, repoUrl: undefined })} />);
    const external = screen
      .getAllByRole("link")
      .filter((l) => /^https?:/.test(l.getAttribute("href") ?? ""));
    expect(external).toHaveLength(0);
  });

  it("renders every image with alt text", () => {
    const project = makeProject();
    render(<ProjectDetail project={project} />);
    for (const image of project.images) {
      expect(screen.getByAltText(image.alt)).toBeInTheDocument();
    }
  });

  it("does not throw and renders no <img> when images is empty", () => {
    expect(() => render(<ProjectDetail project={projectWithoutImages} />)).not.toThrow();
    expect(screen.getByTestId("project-detail").querySelector("img")).toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it.each(projects.map((p) => [p.slug, p] as const))("renders real project %s", (_s, project) => {
    render(<ProjectDetail project={project} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(project.title);
    // Every image the project declares must carry a non-empty accessible name.
    for (const image of project.images) {
      expect(screen.getAllByAltText(image.alt).length).toBeGreaterThan(0);
    }
  });
});
