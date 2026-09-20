<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Commit conventions (all agents, all branches)

Work is committed as a series of sizeable, logical commits — **never one big commit per branch**.

- **Commit at each meaningful milestone**: one coherent unit of work per commit (e.g. "add layout primitives", "add project detail route", "add design tokens and base styles", "add contact form unit tests"). Aim for roughly 5–12 commits per agent branch for a build of this size.
- **Sizeable, not trivial**: each commit should be a working step a reviewer could understand on its own. Don't commit every single file edit, and don't batch unrelated changes together.
- **Appropriate messages**: use Conventional Commits — `type(scope): imperative summary`, e.g. `feat(structure): add Container, Section, Grid and Stack primitives`. Types: `feat`, `fix`, `style`, `refactor`, `test`, `ci`, `docs`, `chore`. Scope is the agent or area (`structure`, `content`, `ui`, `ci`, `testing`). Add a short body explaining _why_ when it isn't obvious.
- **Stage deliberately**: `git add` specific paths for the commit's scope, not `git add -A`, so each commit contains only what its message says.
- **Attribution**: end every commit message with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- **Never** amend or rewrite history that another branch may depend on, and never commit `node_modules`, `.next`, `.env*`, or build/test output.
- Merges into `integration` use `--no-ff` merge commits with a descriptive message (`merge(structure): integrate feature/structure`).

# Merge conflicts (all agents)

**Never resolve a merge conflict yourself.** If a merge or rebase produces conflicts: abort it (`git merge --abort` / `git rebase --abort`), leave the branches untouched, and open a pull request from the feature branch into the target branch so the repo owner can review and resolve it. Describe which files conflicted and which agent owns each side. Only clean, conflict-free merges may be completed without review.
