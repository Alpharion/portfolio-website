import type { Project } from "@/lib/types";

/** Small, copy-independent fixtures for component tests. */
export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "fixture-project",
    title: "Fixture Project",
    summary: "A one-line fixture summary.",
    description: "First paragraph of the description.\n\nSecond paragraph of the description.",
    techStack: ["TypeScript", "React"],
    role: "Engineer",
    timeframe: "2024",
    liveUrl: "https://example.com/live",
    repoUrl: "https://github.com/example/repo",
    images: [
      { src: "/images/fixture-1.svg", alt: "Fixture cover", width: 1200, height: 750 },
      { src: "/images/fixture-2.svg", alt: "Fixture detail" },
    ],
    status: "active",
    featured: true,
    ...overrides,
  };
}

export const projectWithoutImages = makeProject({
  slug: "no-images",
  title: "No Images Project",
  images: [],
  liveUrl: undefined,
  repoUrl: undefined,
});
