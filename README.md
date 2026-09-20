# Portfolio Website

Dark, modern (cool light-purple accent) developer portfolio. Next.js (App Router) + TypeScript +
Tailwind CSS v4 + Framer Motion. Built by a five-agent workflow — see
`2026-09-20-portfolio-website-plan.docx` and `docs/interfaces.md`.

```bash
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint | typecheck | test | e2e | lhci
```

## Adding a project

Add one object to `data/projects.ts` (shape: `lib/types.ts`). No component changes needed.

## Layout

| Path                                                  | What                              |
| ----------------------------------------------------- | --------------------------------- |
| `app/`                                                | routes                            |
| `components/{layout,common,sections,project,contact}` | structure components              |
| `components/motion/`                                  | Framer Motion wrappers            |
| `data/`                                               | projects, site copy, SEO metadata |
| `styles/`                                             | design tokens + component styles  |
| `tests/`, `e2e/`                                      | Vitest, Playwright                |
