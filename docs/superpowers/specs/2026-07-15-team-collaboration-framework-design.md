# Memova Website Team Collaboration Framework

Date: 2026-07-15

## Purpose

Create one collaboration system for human contributors and coding agents working on the Memova website. The system must prevent an older local checkout from overwriting newer OAuth, privacy, ODM, SEO, or team-page changes while keeping deployment understandable and deliberate.

## Source of truth

- GitHub repository `RichardSun700/memova-website` is the canonical code and rule source.
- The `main` branch represents the production candidate after review and validation.
- OneDrive contains a team-readable mirror of the operating guide, not a second editable source of truth.
- Cloudflare Pages remains a deliberate deployment target. A merge does not automatically publish to production in this phase.

## Repository entry points

The repository will expose the rules through multiple agent-compatible entry points without duplicating the full policy:

- `AGENTS.md`: canonical instructions for coding agents and contributors.
- `CLAUDE.md`: short pointer to `AGENTS.md` for Claude-based tools.
- `.github/copilot-instructions.md`: short pointer and critical safety summary for GitHub Copilot.
- `docs/team/website-collaboration-guide.md`: human-readable Chinese operating guide.
- `README.md`: brief contributor section linking to the guide.

Only `AGENTS.md` and the collaboration guide will contain substantive rules. Pointer files remain short so instructions cannot silently diverge.

## Collaboration workflow

1. Start from a freshly fetched `origin/main`.
2. Create one branch per concern, such as OAuth, privacy, ODM, or SEO.
3. Keep unrelated changes in separate pull requests.
4. Run local validation before pushing.
5. Open a pull request into `main` and describe affected routes and validation evidence.
6. Merge only after automated checks pass and the relevant content owner has reviewed sensitive OAuth or legal-policy wording.
7. Deploy only from a clean checkout whose commit exactly matches the latest `origin/main`.

Direct edits to another contributor's working directory and deployment from stale or dirty checkouts are explicitly prohibited.

## Pull request and automated checks

The repository will add:

- A pull request template covering scope, affected routes, OAuth/privacy impact, screenshots or verification, and rollback notes.
- A GitHub Actions workflow triggered for pull requests and pushes to `main`.
- Checks for install reproducibility, tests, TypeScript, production build, SEO/static-route integrity, and production-source integrity.

The workflow will not deploy. Its job is to make a revision safe to review and merge.

## Production deployment guard

The production script will be changed to validate commit identity rather than a local branch name:

- The worktree must be clean, including untracked files.
- `origin/main` must be fetched immediately before validation.
- Local `HEAD` must equal `origin/main` exactly.
- Test, typecheck, build, SEO, and static production-source checks must pass.
- Deployment happens from the verified build artifact.
- The script will not commit, merge, rebase, pull, or push automatically.

This makes the deployment process safe for any clean temporary worktree and avoids coupling production safety to a branch named `main`.

## Sensitive change boundaries

OAuth and privacy content require extra review because incorrect wording or configuration may affect platform approval and legal commitments:

- Agents may implement and validate scoped changes.
- Agents must not invent OAuth scopes, data-retention promises, legal claims, credentials, or production secrets.
- Changes to OAuth scopes, consent-screen configuration, privacy wording, data deletion, or third-party data handling must be called out explicitly in the pull request.
- Repository secrets and Cloudflare credentials must never be written into documentation or committed files.

## OneDrive mirror

The team guide will be copied to:

`公司共享盘 - Documents/公司文档库/开发文档库/Memova Website 协作与部署/`

The folder will contain:

- `README.md`: a fast agent/human entry point with the repository URL and source-of-truth warning.
- `Memova Website 协作与部署指南.md`: synchronized copy of the repository guide.

Each mirrored file will state that edits must be proposed in GitHub. OneDrive is for discovery and reading, preventing two independently edited rule sets.

## Agent quick-start contract

Every agent starting website work must:

1. Read repository-root `AGENTS.md` before editing.
2. Run `git status -sb`, `git remote -v`, and `git fetch origin main`.
3. Confirm the task branch is based on current `origin/main`.
4. Inspect open or concurrent changes that overlap the same files when that information is available.
5. Keep OAuth/privacy, ODM, SEO, and unrelated application work separated.
6. Never deploy unless the user explicitly requests it and the deployment guard passes.
7. Report branch, commit, checks, affected routes, and whether production was deployed.

## Verification

Implementation is complete when:

- All entry-point and guide files are present and internally consistent.
- GitHub Actions syntax is valid and package commands complete successfully locally.
- The production script rejects a commit that is not exactly `origin/main` and accepts a clean checkout at `origin/main` through its pre-deployment validation path.
- Existing ODM, Jiang Weili profile, privacy aliases, SEO files, and application build remain intact.
- The OneDrive mirror exists and matches the repository guide by checksum.
- The framework is committed and pushed to a GitHub branch for review.

## Rollout boundary

This implementation does not enable automatic production deployment, modify OAuth provider settings, change credentials, configure GitHub branch protection, or merge its own pull request. Those actions require separate approval after the team has reviewed the framework.
