# UI/UX improvement backlog

Audit of the merged site (`integration` at 2d6682a) at 1440px and 390px: home, projects, a project
detail page (`/projects/lumen-analytics`), about and contact. This is a menu for the site owner to
pick from. **Nothing here is implemented unless the "Status" column says so.**

Effort: **S** = under half a day, **M** = about a day, **L** = several days or needs new content or
data. "Files" are the paths a change would touch (owner in brackets: UI = UI/UX, ST = Structure).

Legend for status: `Done (round 2)` = covered by the scroll-driven section theming work
(`docs/dom-hooks.md`, "Section theming" section); `Partly` = the theming work improves it but does
not fully solve it; `Open` = not started.

## Verdicts on the coordinator's starting observations

| #   | Observation                                           | Verified?                                                                                                                                                        | Status                                                             |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | One dark tone, sections blend, no rhythm              | Yes. Every section shares one canvas; only whitespace separates them.                                                                                            | Done (round 2): alternating void / violet / midnight sections      |
| 2   | Hero gap under the CTAs, no visual anchor             | Yes. About 230px of empty space between the CTAs and "Selected work" on desktop, and the hero is text-only.                                                      | Partly: violet section now starts a visible band below the hero    |
| 3   | Contact page lopsided                                 | Yes. Header and form both hug the left 40% of a 72rem container.                                                                                                 | Open                                                               |
| 4   | Detail: narrow column, gallery far down, no prev/next | Yes. Body text is 44rem wide with the right ~40% empty, first gallery image starts ~900px down, no way to reach the next project without going back to the list. | Partly: body and gallery now sit in their own violet band          |
| 5   | Projects page has no filtering or count               | Yes.                                                                                                                                                             | Open                                                               |
| 6   | No cursor spotlight / animated gradient borders       | Yes. Cards only have a static gradient hairline and a tilt.                                                                                                      | Open                                                               |
| 7   | Header has no scroll state, no progress, no dots      | Yes for scroll state (header is always the same). The header now adapts to the theme under it.                                                                   | Partly: theme adaptation done; tighten-on-scroll and progress open |
| 8   | Footer minimal                                        | Yes. One line plus social pills; no nav, no back-to-top, no contact prompt.                                                                                      | Open                                                               |
| 9   | Word-by-word headline reveal                          | Reasonable, but the gradient-clipped text makes per-word spans fiddly (each span needs its own `background-clip`). See item 11 below for the caveats.            | Open                                                               |
| 10  | Gallery lightbox                                      | Yes. Images are 1200px wide and non-interactive; a lightbox also helps on mobile.                                                                                | Open                                                               |
| 11  | Marquee / stats strip / closing CTA banner            | Yes: the home page ended abruptly after a text CTA.                                                                                                              | Done (round 2): tech marquee, stats strip, midnight CTA section    |

## Prioritised backlog

### P1: high impact, low to medium effort

1. **Two-column contact page with a details aside.** (S/M) The form card is 36rem wide on a 72rem
   container, so the right half is empty. Put the intro, email, location (`siteContent.site.location`),
   socials and a "typical reply time" note in an aside card on the right; stack under the form below
   ~56rem. Files: `app/contact/page.tsx` (ST), `styles/components.css` (UI). Existing hooks
   (`page__header`, `page__email`) can be reused.
2. **Project detail: sticky meta sidebar plus wider layout.** (M) Body is 44rem; make the detail a
   two-column grid at >= 64rem: prose on the left, role / timeframe / stack / links in a sticky
   sidebar on the right, gallery full-width below. Moves the gallery up ~300px and uses the empty
   right side. Files: `components/project/ProjectDetail.tsx` (ST), `styles/components.css` (UI).
3. **Prev / next project navigation on the detail page.** (S) Two cards at the bottom
   ("Previous" / "Next" with cover thumbnail and title), from `getAllProjects()` order. Removes the
   dead end after the gallery. Files: `components/project/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx`
   (ST), `styles/components.css` (UI).
4. **Projects filter: status and tech chips with a result count.** (M) A chip row above the grid
   (All / Active / In progress / Archived, then the most common tech), `aria-pressed` toggles, a live
   region "Showing 5 of 8 projects", empty state reuses `project-grid__empty`. Needs a small client
   component; must keep `data-testid="project-card"` counts on the un-filtered default. Files:
   new `components/project/ProjectFilters.tsx` (ST), `app/projects/page.tsx` (ST), CSS (UI).
5. **Hero visual anchor.** (M) The hero is centred text only. Options: a floating "code / dashboard"
   glass card cluster using the existing cover SVGs (`public/images/projects/*`), an orbiting ring
   of tech-tag chips, or an animated gradient mesh. Also trim the ~230px dead space under the CTAs
   (reduce `.hero` bottom padding or overlap the first violet band). Files: `components/sections/Hero.tsx`
   (ST), `styles/components.css` (UI), optionally a new decorative component in `components/motion` (UI).

### P2: polish that makes the site feel premium

6. **Cursor-follow spotlight on cards and hero.** (S/M) A radial gradient that tracks the pointer
   inside `.project-card`, the stat cards and the hero (CSS variables `--mx` / `--my` set from a
   tiny pointer handler, extending `HoverTilt`). Pair with a conic-gradient border that rotates on
   hover (`@property --angle`). Must be off for touch and reduced motion. Files:
   `components/motion/HoverTilt.tsx`, `styles/components.css` (UI).
7. **Header scroll state and scroll-progress hairline.** (S) After ~24px of scroll: shrink height
   (`--header-height` 4rem to 3.5rem), stronger blur and a bottom border glow; add a 2px accent
   progress bar under the header driven by `useScroll`. The theme-under-header adaptation already
   exists (`components/motion/section-theme-driver.ts`), so this is an extra data attribute
   (`data-scrolled`). Files: `components/motion/*` (UI), `styles/components.css` (UI).
8. **Richer footer.** (S) Add a nav column, a "Let's talk" mini-CTA with the email, a back-to-top
   button, and a subtle violet gradient wash so the page ends on a themed band. Files:
   `components/layout/SiteFooter.tsx` (ST), CSS (UI).
9. **Gallery lightbox.** (M) Click a figure to open a dialog (`<dialog>` + focus trap, arrow-key
   navigation, `Esc`, caption from `alt`). Needs a client component; images are already 1200px.
   Files: new `components/project/GalleryLightbox.tsx` (ST), `components/project/ProjectDetail.tsx` (ST),
   CSS (UI).
10. **Project grid: fix the orphan card and empty card middles.** (S) With 7 projects the last row has
    one card; cards are equal-height so short summaries leave a large gap above the tags. Make the
    first card of the list span two columns (featured layout) or use a masonry-like
    `grid-auto-flow: dense` with a wide "feature" card; clamp summary to 2 lines on the small cards.
    Files: `components/project/ProjectGrid.tsx` (ST), CSS (UI).
11. **Hero headline word-by-word reveal.** (S/M) Split the headline into word spans with a stagger.
    Caveats: the headline uses `background-clip: text`, so each span needs `background-attachment: fixed`
    or its own gradient offset; the `<h1>` text must stay one accessible string (`aria-label` on
    the h1 plus `aria-hidden` on the spans); respect reduced motion. Files: `components/sections/Hero.tsx` (ST),
    `components/motion/*` (UI).

### P3: nice to have

12. **Animated gradient / aurora backgrounds inside violet bands.** (S) Slow-drifting glow blobs
    (CSS keyframes on `::before` background-position) so the violet bands feel alive. Paused under
    reduced motion. Files: `styles/components.css`.
13. **Section index dots / side rail.** (M) A fixed right-edge dot rail on desktop showing the
    current section on long pages (home, about); can reuse the section registry from the theme
    driver. Files: `components/motion/*`, CSS.
14. **Form polish.** (S) Placeholders and helper text, character counter on the message, inline
    success state that replaces the form, animated check icon. The inputs are currently blank
    boxes. Files: `components/contact/ContactForm.tsx` (ST), CSS.
15. **Real exit transitions between pages.** (M) `PageTransition` only animates entrances; a
    shared-layout exit needs a frozen-router pattern in the App Router. Watch the e2e note about the
    outgoing and incoming page briefly coexisting. Files: `components/motion/PageTransition.tsx`.
16. **Image quality.** (S) Blur placeholders, `loading="eager"` / `priority` on the first row of
    project covers (the projects page logs an LCP warning for the first cover), consistent aspect
    ratios. Files: `components/project/ProjectCard.tsx` (ST).
17. **Light theme and toggle.** (L) Tokens are per-scope now, so a light scope is a token block plus a
    toggle and `prefers-color-scheme` handling; every gradient and glow needs a light equivalent.
    Files: `styles/tokens.css`, `app/layout.tsx` (ST).
18. **`prefers-contrast` and forced-colors pass.** (S) Stronger borders in `prefers-contrast: more`,
    and `forced-colors` fallbacks for the gradient-clipped headings (they rely on
    `-webkit-text-fill-color: transparent`). Files: `styles/components.css`, `app/globals.css`.
19. **Print stylesheet.** (S) Especially for the about page as a mini-CV: drop backgrounds, show
    link URLs. Files: `app/globals.css`.
20. **Social and share polish.** (M) Open Graph images per project generated from the cover SVG,
    a proper favicon / app icon. Files: `app/**` (ST), `public/**` (Content).

## Notes on what round 2 changes (for reviewers)

- All theme work lives in tokens (`styles/tokens.css`), section wrappers (`components/motion/SectionTheme.tsx`)
  and one CSS block; components still consume tokens only, so items above that add components inherit
  both themes for free. New components should be placed in a themed `Section` and use only `var(--color-*)`.
- Anything that adds motion must respect `useReducedMotion()` and the no-JS fallback (visible by
  default; see `[data-fade-in]` handling in `app/globals.css`).
