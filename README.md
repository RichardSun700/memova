# Memova Website

Memova's public website and production static pages for [memova.ai](https://memova.ai).

## Team and Agent entry points

- Coding agents must read [`AGENTS.md`](./AGENTS.md) before editing.
- Team members should read the Chinese [website collaboration and deployment guide](./docs/team/website-collaboration-guide.md).
- GitHub `main` is the canonical source. OneDrive contains a read-only discovery mirror.

## Local validation

SEO tests inspect the generated `dist/public` tree, so run the build before the full test suite in a clean checkout:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm test
pnpm run check:seo
pnpm run check:production-source
```

## Production

Production deployment is manual and must be explicitly requested:

```bash
pnpm run deploy:production
```

The deployment command refuses dirty worktrees and commits that do not exactly match the latest `origin/main`.
