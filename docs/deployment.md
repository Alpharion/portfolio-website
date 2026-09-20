# Deployment guide

The site is a Next.js app hosted on Vercel. GitHub Actions runs CI and performs deployments with
the Vercel CLI. Everything below is a one-time setup done by the repo owner.

## 1. Create and link the Vercel project

1. Sign in at <https://vercel.com> and choose **Add New... -> Project**. Import
   `Alpharion/portfolio-website`. Vercel detects Next.js; `vercel.json` sets the install and build
   commands (`npm ci`, `npm run build`).
2. **Disable Vercel's own Git deployments** so deploys are only made by the GitHub workflow (no
   duplicate builds): Project Settings -> Git -> "Ignored Build Step" set to `exit 0`, or simply
   disconnect the Git repository after import.
3. Collect the three IDs the workflow needs:
   - **Token**: Account Settings -> Tokens -> Create Token (scope: the team that owns the project).
   - **Org ID** and **Project ID**: run `npx vercel link` once locally, then read
     `.vercel/project.json` (`orgId`, `projectId`). `.vercel` is git-ignored, do not commit it.

## 2. Add secrets and environment variables

GitHub: repo -> Settings -> Secrets and variables -> Actions -> **New repository secret**.

| Secret              | Value                         |
| ------------------- | ----------------------------- |
| `VERCEL_TOKEN`      | The Vercel access token       |
| `VERCEL_ORG_ID`     | `orgId` from project.json     |
| `VERCEL_PROJECT_ID` | `projectId` from project.json |

Vercel: Project Settings -> Environment Variables (apply to Production and Preview):

| Variable                | Required | Purpose                                                                                          |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `CONTACT_FORM_ENDPOINT` | No       | URL the contact API route forwards submissions to (e.g. a Formspree endpoint). Unset = log only. |

`vercel pull` in the workflow downloads these, so they never live in GitHub. See `.env.example` for
local development (`.env.local`).

Until the three secrets exist, the deploy workflow skips its jobs with a notice instead of failing.

## 3. How CI and deploys work

Workflows live in `.github/workflows/`.

| Event                  | `ci.yml` jobs                               | `deploy.yml`                                    |
| ---------------------- | ------------------------------------------- | ----------------------------------------------- |
| PR into `integration`  | Quality, Unit tests, Build                  | Preview deploy + PR comment with the URL        |
| Push to `integration`  | Quality, Unit tests, Build, E2E, Lighthouse | none                                            |
| PR into `main`         | Quality, Unit tests, Build, E2E, Lighthouse | Preview deploy + PR comment with the URL        |
| Push to `main` (merge) | none (already proven on the PR)             | Verify production build, then production deploy |

This maps to the build plan (section E.3): feature branches merge into `integration` with a fast
gate (quality, unit, build); the full E2E and Lighthouse suites re-run on `integration` and again on
the PR into `main`, so `main` only ever receives a fully verified release.

Jobs and what they run:

- **Quality**: `npm run lint`, `npm run typecheck`, `npm run format:check`
- **Unit tests**: `npm test` (Vitest)
- **Build**: `npm run build` (caches `.next/cache`; hands the build to E2E and Lighthouse)
- **E2E**: `npx playwright install --with-deps chromium`, then `npm run e2e`. The
  `playwright-report` artifact is uploaded on failure.
- **Lighthouse**: `npm run lhci`. Results are uploaded as the `lighthouse-results` artifact.

Deploy steps: `vercel pull` -> `vercel build` -> `vercel deploy --prebuilt`. Production uses
`--prod`, runs only after the **Verify production build** job passes, and is serialised so two
production deploys never overlap.

E2E and Lighthouse assume the Testing agent's `playwright.config.ts` and `lighthouserc.json` start
the app themselves (for example `npm start` against the downloaded `.next` build).

## 4. Recommended branch protection

Settings -> Branches -> Add rule (or a ruleset).

**`main`**

- Require a pull request before merging; only PRs from `integration` (owner merges).
- Require status checks to pass, and require branches to be up to date. Required checks (use the
  job names exactly): `Quality`, `Unit tests`, `Build`, `E2E`, `Lighthouse`.
- Block force pushes and deletion.

**`integration`**

- Require a pull request; required checks: `Quality`, `Unit tests`, `Build`.
- Merge feature branches with `--no-ff` merge commits (see `AGENTS.md`).

GitHub only offers a check as required once it has run at least once in the last week, so open a
first PR before configuring the rules. `E2E` and `Lighthouse` are skipped on PRs into
`integration`, which GitHub treats as passing.

## 5. Adding a project and redeploying

1. Edit `data/projects.ts` and add one object (shape in `lib/types.ts`). Add images under
   `public/images/<slug>/` if needed; no component changes are required.
2. Open a PR into `integration` and check the preview URL comment.
3. When ready to release, open a PR from `integration` into `main`. After CI passes, merge it. The
   production deploy starts automatically on the merge.

Files under `/images/**` are served with `Cache-Control: immutable` for one year (`vercel.json`), so
use a **new file name** when replacing an image, otherwise visitors keep the old one.

To redeploy without a code change, re-run the failed or latest **Deploy** workflow run from the
Actions tab (Re-run all jobs).

## 6. Custom domain

1. Vercel: Project -> Settings -> Domains -> Add. Enter the domain (e.g. `example.com`).
2. Add the DNS records Vercel shows at your registrar: an `A` record `76.76.21.21` for the apex
   domain and a `CNAME` to `cname.vercel-dns.com` for `www` (or move nameservers to Vercel).
   Vercel issues the TLS certificate automatically.
3. Update `siteContent.site.url` in `data/site-content.ts` to the final URL so the sitemap,
   `robots.txt` and canonical links are correct, and ship it through the normal PR flow.

## 7. Troubleshooting

| Symptom                                        | Likely cause and fix                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Deploy jobs show "skipped" and a notice        | One of `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` is missing. Fork PRs never receive secrets.                          |
| `vercel pull` fails with "Project not found"   | `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` do not match the token's team, or the token has expired. Re-run `vercel link`.             |
| Build fails only on Vercel/CI                  | Run `npm ci && npm run build` locally with Node 24. Check that env vars exist for the right environment (Preview vs Production). |
| `Quality` fails on `format:check`              | Run `npm run format` and commit the result.                                                                                      |
| E2E or Lighthouse cannot connect to the server | The server command in `playwright.config.ts` / `lighthouserc.json` must build or start the app on the expected port.             |
| Required check never appears on the PR         | Check names must match the job `name` values above, and the workflow must have run once on the target branch.                    |
| Two deploys for every push                     | Vercel's Git integration is still enabled. Disable it (step 1.2).                                                                |
| Contact form submissions are not delivered     | `CONTACT_FORM_ENDPOINT` is unset (log only) or wrong in the Vercel environment. Redeploy after changing it.                      |
| Old image still shown after replacing it       | `/images/**` is cached immutably. Rename the file.                                                                               |
