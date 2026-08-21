# Memova Website Deployment Boundary

These rules apply to Codex and human operators working in this repository.

## Production Source Of Truth

- GitHub `origin/main` is the only production source of truth for `memova.ai`.
- Do not deploy from a dirty worktree, detached head, preview branch, local-only commit, generated `dist/` folder, zip export, or another Codex session's temporary workspace.
- All production changes must be committed and pushed to GitHub first. Production deployment must happen only after local `HEAD` exactly matches `origin/main`.
- Use `pnpm run deploy:production` for Cloudflare Pages production deployment. Do not run `wrangler pages deploy dist/public` directly for production.

## Required Deploy Sequence

1. Merge or push the intended website change to GitHub `main`.
2. Start from a clean local checkout of `origin/main`.
3. Run `pnpm run deploy:production`.
4. Confirm the deployed `/__deployment-<commit>.json` metadata matches the GitHub `main` commit.

## Why This Exists

A previous session rolled the live site back by deploying an older local build directly to Cloudflare. The guardrails above prevent local build artifacts from becoming a shadow source of truth.
