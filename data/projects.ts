// PLACEHOLDER CONTENT — replace with the owner's real details
import type { Project } from "@/lib/types";

/**
 * Adding a project = adding one object here. No component changes required.
 * Schema lives in lib/types.ts. Image files live under public/images/projects/.
 */
export const projects: Project[] = [
  {
    slug: "lumen-analytics",
    title: "Lumen Analytics",
    summary:
      "A privacy-first product analytics dashboard that turns raw event streams into readable, shareable insights.",
    description:
      "Lumen Analytics is a lightweight alternative to heavyweight analytics suites, built for small product teams who want answers without tracking individual users. It ingests events through a tiny first-party script, aggregates them into hourly rollups, and renders funnels, retention curves and live traffic in a single fast dashboard.\n\nThe interesting engineering problem was making large time-series queries feel instant. Events land in a Postgres partitioned table, a background worker maintains materialised rollups, and the API serves pre-aggregated buckets that the client stitches into charts with a custom SVG renderer. Typical dashboard loads stay under 300 ms even on a few hundred million rows.\n\nI designed the interface around a strict information hierarchy: one headline number per card, one chart per question, and everything shareable through a signed read-only link. Accessibility was a first-class goal, so every chart ships with a data-table fallback and full keyboard navigation.",
    techStack: ["TypeScript", "Next.js", "PostgreSQL", "tRPC", "Tailwind CSS", "Vitest"],
    role: "Lead developer & designer",
    timeframe: "Feb 2024 – Nov 2024",
    liveUrl: "https://example.com/lumen-analytics",
    repoUrl: "https://github.com/your-handle/lumen-analytics",
    images: [
      {
        src: "/images/projects/lumen-analytics-cover.svg",
        alt: "Analytics dashboard with three headline metric cards above a purple area chart trending upward",
        width: 1600,
        height: 900,
      },
      {
        src: "/images/projects/lumen-analytics-detail.svg",
        alt: "Dashboard variant showing a bar chart of daily events with cyan highlights on peak days",
        width: 1600,
        height: 900,
      },
    ],
    status: "active",
    featured: true,
  },
  {
    slug: "tideline",
    title: "Tideline",
    summary:
      "An offline-first budgeting app that shows what is safe to spend today, not just what you spent last month.",
    description:
      "Tideline is a mobile-first progressive web app for people who find spreadsheets tedious and traditional budgeting apps guilt-inducing. Instead of category totals, its home screen shows a single ring: how much of today's flexible budget remains, recalculated every time an expense is logged.\n\nEverything works offline. Data lives in IndexedDB, syncs through a conflict-free merge strategy when a connection returns, and is end-to-end encrypted before it leaves the device. Adding an expense takes two taps and a number, and recurring bills are detected automatically from repeated entries.\n\nThe app is still in active development. Current work covers shared household budgets, a receipt-scanning experiment using on-device models, and a much better empty state for brand-new users.",
    techStack: ["React", "TypeScript", "IndexedDB", "Workbox", "Zod", "Playwright"],
    role: "Solo developer",
    timeframe: "Aug 2025 – Present",
    repoUrl: "https://github.com/your-handle/tideline",
    images: [
      {
        src: "/images/projects/tideline-cover.svg",
        alt: "Three overlapping phone screens showing a transaction list and a circular daily-budget ring",
        width: 1600,
        height: 900,
      },
      {
        src: "/images/projects/tideline-detail.svg",
        alt: "Close-up of the budget ring screen beside a weekly spending bar chart",
        width: 1600,
        height: 900,
      },
    ],
    status: "in-progress",
    featured: true,
  },
  {
    slug: "collaborative-whiteboard",
    title:
      "Meridian: A Real-Time Collaborative Whiteboard and Diagramming Workspace for Distributed Engineering Teams",
    summary:
      "Multiplayer canvas for sketching architecture diagrams, with live cursors, comments and version history.",
    description:
      "Meridian started as an internal tool for a distributed team that kept losing architecture sketches in screenshots and chat threads. It provides an infinite canvas with shapes, connectors and sticky notes, plus a kanban-style boards view for turning diagrams into tracked work.\n\nCollaboration is built on CRDTs, so edits merge cleanly even when someone drops offline mid-session. Presence, live cursors and follow-mode make remote design reviews feel closer to standing at a physical whiteboard. Every change is recorded in a version history that can be scrubbed like a video timeline.\n\nPerformance was the hard part: rendering thousands of objects at 60 fps meant moving hit-testing to a spatial index, batching draw calls, and virtualising everything outside the viewport. The result stays smooth with over ten thousand shapes on a mid-range laptop.",
    techStack: ["TypeScript", "React", "WebSockets", "Yjs", "Canvas API", "Node.js", "Redis"],
    role: "Full-stack engineer",
    timeframe: "Mar 2023 – Jan 2024",
    liveUrl: "https://example.com/meridian",
    images: [
      {
        src: "/images/projects/collaborative-whiteboard-cover.svg",
        alt: "Infinite canvas of connected rounded boxes and circles with three coloured collaborator cursors",
        width: 1600,
        height: 900,
      },
      {
        src: "/images/projects/collaborative-whiteboard-canvas.svg",
        alt: "Sparser canvas layout with a short chain of dashed connectors between diagram nodes",
        width: 1600,
        height: 900,
      },
      {
        src: "/images/projects/collaborative-whiteboard-boards.svg",
        alt: "Four kanban columns of task cards with assignee dots, the boards view of the workspace",
        width: 1600,
        height: 900,
      },
    ],
    status: "active",
    featured: true,
  },
  {
    slug: "atlas-design-system",
    title: "Atlas Design System",
    summary:
      "An accessible, themeable React component library and token pipeline shared across four product teams.",
    description:
      "Atlas is the design system I built and maintained to replace three diverging in-house UI kits. It ships around fifty accessible components, a token pipeline that outputs CSS variables, iOS and Android values from a single source of truth, and a documentation site with live, editable examples.\n\nEvery component is tested against WCAG 2.2 AA with automated checks and manual screen-reader passes. Focus management, reduced-motion handling and high-contrast themes are built in rather than bolted on, so product teams inherit good behaviour by default.\n\nAdoption was the real project: migration codemods, a contribution guide, office hours and a visual-regression suite turned a risky rewrite into a gradual, low-friction rollout.",
    techStack: [
      "React",
      "TypeScript",
      "Storybook",
      "Radix UI",
      "Style Dictionary",
      "CSS Variables",
      "Vitest",
      "Testing Library",
      "Chromatic",
      "Changesets",
      "pnpm",
      "Turborepo",
    ],
    role: "Design systems engineer",
    timeframe: "Jun 2022 – Feb 2023",
    liveUrl: "https://example.com/atlas",
    repoUrl: "https://github.com/your-handle/atlas-design-system",
    images: [
      {
        src: "/images/projects/atlas-design-system-cover.svg",
        alt: "Component sheet with buttons, toggles, inputs, a colour palette and a grid of cards",
        width: 1600,
        height: 900,
      },
    ],
    status: "active",
    featured: true,
  },
  {
    slug: "relay-webhooks",
    title: "Relay",
    summary:
      "A self-hostable webhook gateway that retries, signs and fans out events with a full delivery log.",
    description:
      "Relay sits between an application and the outside world, accepting events once and delivering them reliably to any number of subscriber endpoints. It handles exponential backoff, HMAC signing, per-endpoint rate limits and dead-letter queues so product teams do not have to rebuild that plumbing every time.\n\nThe delivery log was the feature people actually loved: every attempt is searchable, replayable with one click, and diffable against the previous payload. A small Go service does the delivery, while a web console written in TypeScript provides the inspection tools.\n\nThe project is archived now that the hosted platform it targeted has been retired, but the code remains a useful reference for at-least-once delivery patterns.",
    techStack: ["Go", "PostgreSQL", "Redis", "Docker", "OpenAPI"],
    role: "Backend engineer",
    timeframe: "Sep 2022 – Dec 2022",
    repoUrl: "https://github.com/your-handle/relay-webhooks",
    images: [
      {
        src: "/images/projects/relay-webhooks-cover.svg",
        alt: "Glowing hub node at the centre of a web of connected subscriber nodes",
        width: 1600,
        height: 900,
      },
    ],
    status: "archived",
    featured: false,
  },
  {
    slug: "harbor-notes",
    title: "Harbor Notes",
    summary:
      "A local-first markdown notes app with backlinks, full-text search and a distraction-free preview.",
    description:
      "Harbor Notes is a small desktop-and-web notes app for people who want plain markdown files they actually own. Notes are stored as ordinary files, indexed locally for instant full-text search, and linked together through wiki-style backlinks that build a browsable graph.\n\nThe editor pairs a fast source view with a live preview pane, keyboard-driven navigation, and a command palette for everything else. There is no account and no server, which made it a fun exercise in doing more with less.\n\nDevelopment paused when my own workflow moved elsewhere, and the project is archived, but it remains a tidy example of a small, focused product.",
    techStack: ["Electron", "TypeScript", "SQLite", "CodeMirror"],
    role: "Solo developer",
    timeframe: "2021",
    images: [
      {
        src: "/images/projects/harbor-notes-cover.svg",
        alt: "Markdown editor window with a note list on the left, source text in the middle and a rendered preview on the right",
        width: 1600,
        height: 900,
      },
    ],
    status: "archived",
    featured: false,
  },
  {
    slug: "fernwood-cli",
    title: "Fernwood CLI",
    summary:
      "A command-line scaffolding tool that generates opinionated, production-ready project skeletons in seconds.",
    description:
      "Fernwood is a small command-line tool that scaffolds new services and libraries with sensible defaults: linting, formatting, CI pipelines, container builds and a starter test suite, all wired together and ready to commit.\n\nTemplates are plain folders with a tiny manifest, so teams can fork and extend them without learning a plugin API. A dry-run mode previews every file before it is written, and an update command can re-apply template changes to existing projects without clobbering local edits.\n\nIt is still early: the template registry, an interactive prompt flow and better Windows support are next on the list, and screenshots will follow once the terminal UI settles.",
    techStack: ["Node.js", "TypeScript", "Commander", "Handlebars"],
    role: "Author & maintainer",
    timeframe: "Nov 2025 – Present",
    images: [],
    status: "in-progress",
    featured: false,
  },
];
