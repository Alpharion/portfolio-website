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
