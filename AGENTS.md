# Memova Website Agent Instructions

These instructions apply to the entire repository. Human contributors and coding agents share the same Git and deployment rules.

## Start here

Before editing:

```bash
git status -sb
git remote -v
git fetch origin main
```

Create a scoped branch or isolated worktree from the current `origin/main`. Do not work in another contributor's checkout, discard changes you did not create, or assume a local `main` branch is current.

## Source of truth

- GitHub repository `RichardSun700/memova-website` is the canonical code and rule source.
- `origin/main` is the production candidate after review and validation.
- OneDrive copies are team discovery mirrors. Propose rule changes in GitHub rather than editing a second rule set in OneDrive.
- Production is `https://memova.ai` on Cloudflare Pages.

## Change isolation

- Use one branch and pull request per coherent concern.
- Keep OAuth/privacy, ODM pages, SEO/GEO, and unrelated application work in separate pull requests.
- Before touching a shared file, inspect recent commits and any concurrent branch or pull-request context available to you.
- Resolve conflicts deliberately. Never overwrite a newer file with a copy from an older checkout.

## OAuth and privacy

OAuth and privacy changes require explicit human content review.

- Do not invent OAuth scopes, data-use claims, retention periods, deletion promises, legal conclusions, credentials, or production secrets.
- State every impact on consent, scopes, user data, deletion, third-party handling, and affected policy routes in the pull request.
- Keep secrets in approved secret stores. Never commit tokens, client secrets, private keys, or Cloudflare credentials.

## Validation

For a clean checkout, build before the full test suite because SEO tests inspect `dist/public`:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm test
pnpm run check:seo
pnpm run check:production-source
```

Also verify every route changed by the task. Required production assets include:

- `client/public/odmpartnership/index.html`
- `client/public/team/weilijiang/index.html`
- `client/public/_headers`
- `client/public/_redirects`

## Pull requests

- Describe the scope, affected routes, checks run, user-visible impact, and rollback path.
- Include desktop/mobile evidence for visible UI changes.
- Mark OAuth/privacy impact explicitly even when the answer is "none."
- Do not merge with failing required checks.

## Deployment

- Deploy only when the user explicitly requests production deployment.
- `pnpm run deploy:production` must run from a clean commit exactly matching freshly fetched `origin/main`.
- Never bypass the deployment guard, deploy uncommitted files, or use a stale build artifact.
- A pull request or merge does not deploy automatically.

## Handoff

Report:

- branch and commit;
- pull request and merge status;
- checks and route verification performed;
- OAuth/privacy impact;
- whether production was deployed and, if so, the verified URL.

The detailed Chinese team guide is at `docs/team/website-collaboration-guide.md`.
