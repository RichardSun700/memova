#!/usr/bin/env bash

set -euo pipefail

fail() {
  printf 'Production deployment stopped: %s\n' "$1" >&2
  exit 1
}

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

if [[ -n "$(git status --porcelain=v1 --untracked-files=all)" ]]; then
  fail "the worktree contains uncommitted or untracked files"
fi

if [[ "$(git branch --show-current)" != "main" ]]; then
  fail "run this command from the local main branch"
fi

git fetch origin main
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  fail "HEAD must exactly match the latest origin/main before deployment"
fi

source_commit=$(git rev-parse HEAD)
source_short_commit=$(git rev-parse --short HEAD)
source_branch=$(git branch --show-current)
built_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

corepack pnpm install --frozen-lockfile
corepack pnpm run check:production-source
corepack pnpm run check
corepack pnpm run build
corepack pnpm test
corepack pnpm run check:seo

cat > dist/public/__deployment.json <<JSON
{
  "site": "memova.ai",
  "project": "memova",
  "source": "github",
  "repository": "RichardSun700/memova-website",
  "branch": "${source_branch}",
  "commit": "${source_commit}",
  "shortCommit": "${source_short_commit}",
  "builtAt": "${built_at}",
  "deployCommand": "pnpm run deploy:production"
}
JSON

cp dist/public/__deployment.json "dist/public/__deployment-${source_commit}.json"

required_build_paths=(
  "dist/public/__deployment.json"
  "dist/public/__deployment-${source_commit}.json"
  "dist/public/demo/index.html"
  "dist/public/demo/year_about_people/index.html"
  "dist/public/demo/Avery_Manual/index.html"
  "dist/public/demo/battle_for_attention/index.html"
  "dist/public/demo/Manifesto_Book/index.html"
  "dist/public/demo/The_Architecture_of_Sleep/index.html"
  "dist/public/avery-portfolio-book/index.html"
  "dist/public/manifesto-the-future-of-being-remembered/index.html"
  "dist/public/thebookofmemova/index.html"
  "dist/public/odmpartnership/index.html"
  "dist/public/team/weilijiang/index.html"
)

for required_path in "${required_build_paths[@]}"; do
  [[ -f "$required_path" ]] || fail "required build output is missing: $required_path"
done

if ! diff -qr client/public/demo dist/public/demo >/dev/null; then
  fail "the built /demo tree does not exactly match client/public/demo"
fi

wrangler_version="4.110.0"
expected_account_id="b02aa028ef87c390b275f53c3c83407f"
wrangler_identity=$(npx --yes "wrangler@${wrangler_version}" whoami)

if [[ "$wrangler_identity" != *"$expected_account_id"* ]]; then
  fail "Wrangler is not authenticated to the approved Memova Cloudflare account"
fi

npx --yes "wrangler@${wrangler_version}" pages deploy dist/public \
  --project-name=memova \
  --branch=main

production_metadata_url="https://www.memova.ai/__deployment-${source_commit}.json"
for attempt in {1..12}; do
  production_metadata=$(curl -fsSL "$production_metadata_url" || true)
  if [[ "$production_metadata" == *"\"commit\": \"${source_commit}\""* ]]; then
    printf 'Production deployment verified: %s\n' "$production_metadata_url"
    exit 0
  fi
  printf 'Waiting for production metadata to propagate (%s/12)...\n' "$attempt"
  sleep 5
done

fail "production did not expose deployment metadata for GitHub commit ${source_commit}"
