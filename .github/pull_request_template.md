## Summary

<!-- What does this change and why? Link the plan section or issue if relevant. -->

## Type of change

- [ ] Feature branch into `integration`
- [ ] `integration` into `main` (release)
- [ ] Config / CI / docs only

## Checklist

- [ ] `npm run build` succeeds locally and in CI
- [ ] `npm run lint`, `npm run typecheck` and `npm run format:check` pass
- [ ] `npm test` passes
- [ ] Every route renders: `/`, `/projects`, `/projects/[slug]`, `/about`, `/contact`, 404
- [ ] E2E and Lighthouse pass (required for PRs into `main` and on `integration`)
- [ ] Commits are sizeable and use Conventional Commits (see `AGENTS.md`)
- [ ] No merge conflicts were resolved by an agent (conflicts go to the owner for review)

## Agent-owned files touched

<!-- Tick every area this PR modifies (ownership map: docs/interfaces.md section 1). -->

- [ ] Structure: `app/**`, `components/{layout,sections,project,contact,common}`
- [ ] Content: `data/**`, `public/images/**`, `public/resume.pdf`
- [ ] UI/UX: `app/globals.css`, `styles/**`, `components/motion/**`
- [ ] CI/CD: `.github/**`, `vercel.json`, `docs/deployment.md`, `.env.example`
- [ ] Testing: `tests/**`, `e2e/**`, test and Lighthouse configs
- [ ] Frozen files (`package.json`, `lib/types.ts`, `docs/interfaces.md`, ...) — must be unchecked unless the owner approved

## Contract changes

- [ ] No changes to `docs/interfaces.md`, `lib/types.ts`, `lib/contact-schema.ts`, design token names or component props
- [ ] Contract changed (describe what changed and which agents are affected):

## Screenshots / preview

<!-- The Vercel preview URL is posted as a comment on this PR. Add screenshots for visual changes. -->
