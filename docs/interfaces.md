# Interfaces — the shared contract (FROZEN after Phase 0)

Every agent builds against this file, `lib/types.ts`, `lib/contact-schema.ts`, `lib/projects.ts`,
`components/motion/*` (prop API) and `styles/tokens.css` (token names). Do not edit them on a
feature branch; if something is genuinely wrong, say so in your final report and work around it.

> **Next.js 16 / Tailwind v4 warning.** This is not the Next.js of older docs. Before writing
> route/metadata/font/API code, read the relevant guide in `node_modules/next/dist/docs/`.
> Tailwind v4 is CSS-first: there is no `tailwind.config.js`; the theme lives in `@theme` in
> `styles/tokens.css`.

## 1. Ownership map

| Path                                                                                                                                                                                                | Owner                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `app/**` (except `globals.css`), `components/layout`, `components/sections`, `components/project`, `components/contact`, `components/common`, `lib/projects.ts` helpers' usage, `docs/dom-hooks.md` | **Structure**                        |
| `data/projects.ts` entries, `data/site-content.ts`, `data/metadata.ts`, `public/images/**`, `public/resume.pdf`                                                                                     | **Content**                          |
| `app/globals.css`, `styles/**`, `components/motion/**`                                                                                                                                              | **UI/UX**                            |
| `.github/**`, `vercel.json`, `docs/deployment.md`, `.env.example`                                                                                                                                   | **CI/CD**                            |
| `tests/**`, `e2e/**`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `lighthouserc.json`                                                                                            | **Testing**                          |
| `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `lib/types.ts`, `lib/contact-schema.ts`, `docs/interfaces.md`                                        | **Frozen (scaffold)** — nobody edits |

All dependencies are already installed (framer-motion, lucide-react, react-hook-form, zod,
@hookform/resolvers, clsx, vitest, @testing-library/*, jsdom, @playwright/test, @lhci/cli,
prettier). **Do not run `npm install <pkg>`** or touch `package.json` — that would create merge
conflicts. Scripts available: `dev`, `build`, `start`, `lint`, `typecheck`, `format`,
`format:check`, `test` (vitest run), `test:watch`, `e2e` (playwright), `lhci`.

## 2. Routes (Structure)

| Route                         | File                              | Metadata source                                                                                                                                                                                                                    |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | `app/page.tsx`                    | `routeMetadata.home`                                                                                                                                                                                                               |
| `/projects`                   | `app/projects/page.tsx`           | `routeMetadata.projects`                                                                                                                                                                                                           |
| `/projects/[slug]`            | `app/projects/[slug]/page.tsx`    | `projectMetadata(project)` via `generateMetadata`; `generateStaticParams` from `getProjectSlugs()`; `notFound()` for unknown slug                                                                                                  |
| `/about`                      | `app/about/page.tsx`              | `routeMetadata.about`                                                                                                                                                                                                              |
| `/contact`                    | `app/contact/page.tsx`            | `routeMetadata.contact`                                                                                                                                                                                                            |
| `POST /api/contact`           | `app/api/contact/route.ts`        | validates with `contactSchema`; if `process.env.CONTACT_FORM_ENDPOINT` is set, forwards the JSON there, else logs server-side and succeeds. Responds `{ ok: true }` (200) or `{ ok: false, errors }` (400) / `{ ok: false }` (502) |
| 404                           | `app/not-found.tsx`               | —                                                                                                                                                                                                                                  |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` | built from `siteContent.site.url` + `getAllProjects()`                                                                                                                                                                             |

Resume download is a plain link to `siteContent.resume.href` (`/resume.pdf`), no route.
Root layout (`app/layout.tsx`): `export const metadata = rootMetadata`, renders `SiteHeader`,
`<main id="main">`, `SiteFooter`, wraps children in `PageTransition`, includes a skip-to-content link.
Route files never define their own metadata objects — they re-export from `data/metadata.ts`.
Pages are Server Components; only leaf components that need state/motion use `"use client"`.

## 3. Component files & props (Structure builds; named exports only)

```
components/layout/     Container, Section, Grid, Stack, SiteHeader, SiteFooter
components/common/     SectionHeading, ButtonLink, TechTag, StatusBadge
components/sections/   Hero, FeaturedProjects, AboutBlock
components/project/    ProjectCard, ProjectGrid, ProjectDetail
components/contact/    ContactForm
```

One file per component: `components/<dir>/<Name>.tsx`, imported as
`import { ProjectCard } from "@/components/project/ProjectCard"`.

| Component          | Props                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `Container`        | `{ children, className?, as? }`                                                                         |
| `Section`          | `{ children, className?, id?, as? }`                                                                    |
| `Grid`             | `{ children, className?, cols?: 1\|2\|3\|4 }`                                                           |
| `Stack`            | `{ children, className?, gap?: "sm"\|"md"\|"lg" }`                                                      |
| `SiteHeader`       | `{}` — reads `siteContent.nav` / `.site.name`; client component for active-link + mobile menu           |
| `SiteFooter`       | `{}` — reads `siteContent.socials` / `.footer`                                                          |
| `SectionHeading`   | `{ eyebrow?: string, title: string, description?: string }`                                             |
| `ButtonLink`       | `{ href: string, children, variant?: "primary"\|"secondary"\|"ghost", external?: boolean, className? }` |
| `TechTag`          | `{ label: string }`                                                                                     |
| `StatusBadge`      | `{ status: ProjectStatus }`                                                                             |
| `Hero`             | `{ content: SiteContent["hero"] }`                                                                      |
| `FeaturedProjects` | `{ projects: Project[] }`                                                                               |
| `AboutBlock`       | `{ content: SiteContent["about"] }`                                                                     |
| `ProjectCard`      | `{ project: Project }` (whole card links to `/projects/${slug}`)                                        |
| `ProjectGrid`      | `{ projects: Project[] }`                                                                               |
| `ProjectDetail`    | `{ project: Project }`                                                                                  |
| `ContactForm`      | `{}` — react-hook-form + `zodResolver(contactSchema)`, `fetch("/api/contact", { method: "POST" })`      |

Pages compose these. Content-bearing components take content as **props**, never import copy
directly (except `SiteHeader`/`SiteFooter`, which read `siteContent`). Use `next/image` for images
(local SVG/PNG under `/public`), `lucide-react` for icons, and the `FadeIn` / `HoverTilt`
motion wrappers where sensible (they are pass-through stubs until the UI/UX branch merges).
Home page order: Hero → FeaturedProjects → short About teaser → contact CTA. Empty `images` must
render a graceful placeholder block (no broken `<Image>`).

**Structure applies NO visual styling** beyond the semantic class names below (and the bare
minimum, e.g. `sr-only`, to keep DOM accessible). No colors, no spacing, no animation.

## 4. DOM hooks — semantic class names (Structure emits, UI/UX styles)

BEM-ish. Structure must put these exact class names on these elements. It may add further
`block__element` classes for its own components but must list every addition in
`docs/dom-hooks.md` (a file only Structure edits). UI/UX styles all of them in
`styles/components.css` via `@apply`/plain CSS using tokens.

```
Layout      layout-container · layout-section · layout-grid (+ layout-grid--cols-{1..4}) ·
            layout-stack (+ layout-stack--gap-{sm|md|lg})
Header      site-header · site-header__inner · site-header__brand · site-nav ·
            site-nav__list · site-nav__link (+ is-active) · site-nav__toggle · site-nav__menu
Footer      site-footer · site-footer__inner · site-footer__note · site-footer__socials ·
            site-footer__social-link
Common      section-heading · section-heading__eyebrow · section-heading__title ·
            section-heading__description ·
            btn (+ btn--primary | btn--secondary | btn--ghost) · tech-tag ·
            status-badge (+ status-badge--active | --archived | --in-progress) ·
            skip-link
Hero        hero · hero__inner · hero__eyebrow · hero__title · hero__subtitle · hero__actions ·
            hero__glow (empty decorative div, aria-hidden)
Project     project-card · project-card__media · project-card__placeholder · project-card__body ·
            project-card__title · project-card__summary · project-card__tags ·
            project-grid · featured-projects
Detail      project-detail · project-detail__header · project-detail__title ·
            project-detail__summary · project-detail__meta · project-detail__meta-item ·
            project-detail__body · project-detail__gallery · project-detail__links
About       about-block · about-block__bio · about-block__avatar · about-block__skills ·
            about-block__skill-group · about-block__highlights · about-block__highlight
Contact     contact-form · contact-form__field · contact-form__label · contact-form__input ·
            contact-form__error · contact-form__status · contact-form__submit
Page        page (on each route's outermost element) · page__header
```

Form controls carry `contact-form__input` (inputs and textarea alike).

## 5. Test hooks — `data-testid` and accessibility (Structure emits, Testing uses)

Testing must not depend on copy (it is placeholder and changes). It depends on these ids, on
roles/labels, and on `data/projects.ts` (iterate the real entries).

| Element                          | Hook                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header / footer                  | `data-testid="site-header"` / `"site-footer"`                                                                                                       |
| Each nav link                    | `data-testid="nav-link"` (inside `<nav aria-label="Primary">`)                                                                                      |
| Mobile menu toggle               | `data-testid="nav-toggle"` with `aria-expanded`, `aria-controls`                                                                                    |
| Hero                             | `data-testid="hero"`                                                                                                                                |
| Each project card (link element) | `data-testid="project-card"`, `data-slug="<slug>"`                                                                                                  |
| Project detail root              | `data-testid="project-detail"`; title is the page's only `<h1>`                                                                                     |
| Contact form                     | `data-testid="contact-form"`; fields labelled **Name**, **Email**, **Message** (`<label>` associated), submit button `data-testid="contact-submit"` |
| Field error text                 | `data-testid="contact-error"` (`role="alert"`)                                                                                                      |
| Success / failure banner         | `data-testid="contact-success"` / `data-testid="contact-failure"`                                                                                   |
| Résumé link                      | `data-testid="resume-link"` (`href` = `siteContent.resume.href`, `download` attr)                                                                   |
| Every page                       | exactly one `<h1>`, one `<main id="main">`, a working skip link                                                                                     |

The résumé link appears on the About page (and may also appear elsewhere).

## 6. Design tokens (UI/UX owns values; names frozen)

Defined in `styles/tokens.css` via Tailwind v4 `@theme`, so they exist as both CSS variables and
utilities: `bg-bg bg-surface bg-surface-raised border-border border-border-strong text-fg
text-fg-muted text-fg-subtle text-accent bg-accent bg-accent-strong bg-accent-soft text-accent-2
text-success text-danger rounded-sm|md|lg font-sans font-mono`, plus `--duration-{fast,base,slow}`,
`--ease-{out,in-out}`, `--space-section`, `--space-gutter`, `--glow-accent`, `--container-page`.
Dark theme only for now; keep `color-scheme: dark`.

## 7. Motion wrappers (UI/UX owns; API frozen)

`FadeIn { children, delay?, direction?, className? }`, `PageTransition { children }`,
`HoverTilt { children, className?, maxTilt? }`, all exported from `@/components/motion`.
They must honour `prefers-reduced-motion`. Other agents import, never edit.

## 8. Git rules

- Work only in your own worktree/branch. Follow the **Commit conventions in `AGENTS.md`**:
  several sizeable, logical Conventional-Commit commits per branch — never a single commit.
- Stay inside your ownership map. Need a change elsewhere? Note it in your final report.
- Never resolve merge conflicts yourself — see "Merge conflicts" in `AGENTS.md`.
- Never merge, rebase onto, or push other branches — the orchestrator merges into `integration`.
- Keep `npm run lint`, `npm run typecheck` and `npm run build` green on your branch where your
  scope allows it (Testing/CI-CD branches only need to leave the app building).
