# Memova Production Deployment Boundary

Production site: `https://www.memova.ai`  
Cloudflare Pages project: `memova`  
Production source of truth: GitHub `RichardSun700/memova-website`, branch `main`

## Incident Summary

The live site was rolled back because a deployment was made from an older local build/worktree instead of the latest GitHub `main`. Cloudflare Pages accepted the uploaded `dist/public` output, so the live site reflected that stale local artifact even though GitHub had newer code.

## Root Cause

- Cloudflare direct upload can deploy any local `dist/public` folder.
- A local checkout can be behind GitHub, dirty, detached, or based on a preview branch.
- If a session runs `wrangler pages deploy dist/public` directly, it bypasses the repository checks.
- The live site then has no obvious proof of which GitHub commit produced it.

## Hard Boundary

Production deployment must always be:

```bash
git fetch origin main
git checkout main
git reset --ff-only origin/main
pnpm run deploy:production
```

Never deploy production with:

```bash
wrangler pages deploy dist/public
```

unless the command is being run inside `scripts/deploy-production.sh`.

## Automated Guardrails

`pnpm run deploy:production` now enforces:

- clean worktree, including untracked files
- current branch is `main`
- local `HEAD` exactly equals `origin/main`
- production source files are tracked and clean
- type check, build, tests, and SEO verification pass
- required standalone demo/static routes are present in `dist/public`
- `client/public/demo` and built `/demo` output match
- Wrangler account matches the approved Memova Cloudflare account
- build writes `dist/public/__deployment.json`
- build writes `dist/public/__deployment-<commit>.json`
- post-deploy verification checks that `https://www.memova.ai/__deployment-<commit>.json` exposes the same GitHub commit

## Operator Checklist

- If the site looks wrong, first check `https://www.memova.ai/__deployment.json`.
- Compare `commit` in that file with GitHub `main`.
- If they differ, redeploy from a clean `origin/main` checkout using `pnpm run deploy:production`.
- If a teammate needs a preview branch, deploy it to a preview URL only; do not bind it to production.
