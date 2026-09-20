import type { Project } from "@/lib/types";

/**
 * Adding a project = adding one object here. No component changes required.
 * Schema lives in lib/types.ts.
 */
export const projects: Project[] = [
  {
    slug: "example-project",
    title: "Example Project",
    summary: "Placeholder entry — the Content Agent replaces this.",
    description: "Placeholder description.\n\nSecond paragraph.",
    techStack: ["TypeScript", "Next.js"],
    role: "Developer",
    timeframe: "2024",
    images: [],
    status: "active",
    featured: true,
  },
];
