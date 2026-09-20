# DOM hooks — class names and state attributes emitted by Structure

Owner: Structure. UI/UX styles these in `styles/components.css`. Everything in "Contract" comes
from `docs/interfaces.md` §4; "Additions" are extra `block__element` classes Structure added.
No component sets any colour, spacing or animation; only these hooks exist.

## Contract (all emitted)

```
Layout   layout-container · layout-section · layout-grid (+ layout-grid--cols-{1..4}) ·
         layout-stack (+ layout-stack--gap-{sm|md|lg})
Header   site-header · site-header__inner · site-header__brand · site-nav · site-nav__list ·
         site-nav__link (+ is-active) · site-nav__toggle · site-nav__menu
Footer   site-footer · site-footer__inner · site-footer__note · site-footer__socials ·
         site-footer__social-link
Common   section-heading · section-heading__eyebrow · section-heading__title ·
         section-heading__description · btn (+ btn--primary | btn--secondary | btn--ghost) ·
         tech-tag · status-badge (+ status-badge--active | --archived | --in-progress) · skip-link
Hero     hero · hero__inner · hero__eyebrow · hero__title · hero__subtitle · hero__actions ·
         hero__glow
Project  project-card · project-card__media · project-card__placeholder · project-card__body ·
         project-card__title · project-card__summary · project-card__tags · project-grid ·
         featured-projects
Detail   project-detail · project-detail__header · project-detail__title ·
         project-detail__summary · project-detail__meta · project-detail__meta-item ·
         project-detail__body · project-detail__gallery · project-detail__links
About    about-block · about-block__bio · about-block__avatar · about-block__skills ·
         about-block__skill-group · about-block__highlights · about-block__highlight
Contact  contact-form · contact-form__field · contact-form__label · contact-form__input ·
         contact-form__error · contact-form__status · contact-form__submit
Page     page · page__header
```

## Additions (not in the contract)

| Class                                                             | Element                                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `page__title`                                                     | The route's `h1` inside `.page__header` (all routes except home and project detail) |
| `page__description`                                               | Intro paragraph(s) inside `.page__header`                                           |
| `page__email`                                                     | Email `mailto:` link on the contact page                                            |
| `page__actions`                                                   | Button row at the bottom of About and 404 (contains the résumé link on About)       |
| `page--not-found`                                                 | Modifier on `.page` of the 404 page                                                 |
| `site-footer__social-label`                                       | Visible text label next to each footer social icon                                  |
| `project-grid__item`                                              | `li` wrapping each card in the grid                                                 |
| `project-grid__empty`                                             | Message shown when the project list is empty                                        |
| `featured-projects__actions`                                      | "View all projects" button wrapper                                                  |
| `project-detail__back`                                            | "All projects" back link in the detail header                                       |
| `project-detail__tags`                                            | Tech-tag list inside the meta block                                                 |
| `project-detail__figure`                                          | `figure` around each gallery image                                                  |
| `project-detail__placeholder`                                     | Placeholder block when a project has no images (`role="img"`)                       |
| `about-block__skill-title` · `about-block__skill-list`            | Group heading (`h2`) and its tag list                                               |
| `about-block__highlight-label` · `about-block__highlight-value`   | `dt` / `dd` of each highlight                                                       |
| `contact-form__status--success` · `contact-form__status--failure` | Modifiers on `.contact-form__status`                                                |
| `home-about` · `home-about__actions`                              | Home page about-teaser section and its button wrapper                               |
| `home-cta` · `home-cta__actions`                                  | Home page closing contact call-to-action section and its button wrapper             |

The contact submit button is `btn btn--primary contact-form__submit`. The résumé link on About is
`btn btn--secondary` (plain `<a download>`).

## State and structural attributes

- Mobile nav: `button.site-nav__toggle[aria-expanded="true|false"]` controls
  `.site-nav__menu[data-open="true|false"]` (`aria-controls` points at its id). Structure ships no
  hide/show CSS, so UI/UX must collapse `.site-nav__menu` below the desktop breakpoint unless
  `data-open="true"`, and hide `.site-nav__toggle` at desktop widths. The active link has
  `.is-active` and `aria-current="page"`.
- `.skip-link` is a plain visible anchor to `#main`; UI/UX should visually hide it until focus.
- `.sr-only` is used for screen-reader-only text (toggle label, "All projects", "Gallery" and
  "About this project" headings). Ensure the utility is available (Tailwind provides it).
- `.hero__glow` is an empty `aria-hidden` div; `.project-card__placeholder` holds the title's
  first letter and is `aria-hidden`.
- `.project-card` is the `<a>` itself (whole card is the link). `.project-card__tags`,
  `.project-detail__tags`, `.about-block__skill-list` are `ul`s of `.tech-tag` spans (reset list
  styles). `.project-grid` is a `ul` (`layout-grid layout-grid--cols-3`).
- Form controls (inputs and textarea) all carry `.contact-form__input`; invalid ones have
  `aria-invalid="true"`.
- `<main id="main" tabindex="-1">` so the skip link moves focus; suppress its focus outline if desired.
- `FadeIn` / `HoverTilt` wrappers add a `div` around each project card in the grid (inside the
  `li`), around the hero content (`FadeIn` receives `className="hero__inner"`), around
  `.about-block` (`FadeIn` receives `className="about-block"`) and each detail gallery figure.

## Section theming (added by UI/UX, round 2)

Pages are built from full-bleed themed bands. The colour tokens are re-scoped per band, so every
component inside re-themes with no extra classes. Palettes live in `styles/tokens.css`; behaviour in
`components/motion/SectionTheme.tsx` and `section-theme-driver.ts`.

| Hook                                                                   | Where / meaning                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-section-theme="void\|violet\|midnight"`                          | On a band's root element. `void` = page canvas (near-black), `violet` = deep violet with inverted (light) accents, `midnight` = subtle navy. Set by `<Section theme="…">` (`components/layout/Section.tsx`) or `<SectionTheme>`; the hero and the two project-detail bands use `SectionTheme` directly. |
| `html[data-header-theme]`                                              | Set at runtime to the theme of the band under the sticky header; the header re-themes through the same tokens. Absent without JS (header stays `void`).                                                                                                                                                 |
| `<Section theme aria-labelledby aria-label>`                           | New optional props on `Section`; `aria-labelledby` points at the band's heading.                                                                                                                                                                                                                        |
| `<SectionHeading titleId>`                                             | New optional prop: id for the `h2` (so a band can be `aria-labelledby` it).                                                                                                                                                                                                                             |
| `skills-showcase`                                                      | Home "Tools I reach for" band (`SkillsShowcase`, id `skills`, theme violet), built from `siteContent.about.skills`.                                                                                                                                                                                     |
| `skills-showcase__rows`                                                | Wrapper of the two marquee rows.                                                                                                                                                                                                                                                                        |
| `marquee` (+ `marquee--reverse`) · `marquee__inner` · `marquee__track` | CSS-only tech marquee. `marquee__inner` is the animated flex row; it holds 4 identical `ul.marquee__track` lists, only the first is exposed to assistive tech (the others are `aria-hidden`). Under reduced motion the row is static, wrapped and shows one list.                                       |
| `about-skills` · `about-highlights`                                    | The violet skills band and the void "At a glance" band on `/about`.                                                                                                                                                                                                                                     |
| `projects-intro` · `projects-list`                                     | The void header band and the violet grid band on `/projects`.                                                                                                                                                                                                                                           |
| `contact-intro` · `contact-panel`                                      | The void header band and the violet form band on `/contact`.                                                                                                                                                                                                                                            |
| `project-detail__top` · `project-detail__content`                      | The two bands inside `article.project-detail`: header/meta/links (void) and body/gallery (violet). Both are `div.layout-section` (not landmarks). `.project-detail` no longer sits inside an outer `Section`.                                                                                           |

Other notes:

- `home-about` (void) now also renders the highlights, styled as a stats strip; `home-cta` is a
  `midnight` band. Home order: hero (void), featured (violet), about (void), skills (violet), CTA
  (midnight).
- `AboutBlock` omits `.about-block__bio` when `bio` is empty, and the skill group titles
  (`about-block__skill-title`) are now `h3` (they sit under a band `h2`). `/about` renders three
  `AboutBlock`s (bio + avatar, skills, highlights), one per band.
