#!/usr/bin/env bash

set -euo pipefail

fail() {
  printf 'Production deployment stopped: %s\n' "$1" >&2
  exit 1
}

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

node scripts/verify-production-source.mjs

if [[ -n "$(git status --porcelain=v1 --untracked-files=all)" ]]; then
  fail "the worktree contains uncommitted or untracked files"
fi

git fetch origin main
node scripts/verify-deploy-head.mjs HEAD origin/main

npx wrangler whoami >/dev/null
pnpm run check
pnpm run build
pnpm test
pnpm run check:seo

npx wrangler pages deploy dist/public --project-name=memova --branch=main
