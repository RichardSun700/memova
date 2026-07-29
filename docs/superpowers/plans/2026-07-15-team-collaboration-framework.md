# Memova Website Team Collaboration Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a GitHub-first collaboration and guarded deployment workflow that human contributors and coding agents can discover immediately, with a read-only OneDrive mirror for the team.

**Architecture:** GitHub `main` remains the canonical production source. Repository-root agent entry files point to one canonical instruction file and one Chinese human guide; pull requests run validation but never deploy; the production script only deploys a clean commit exactly equal to `origin/main`. OneDrive mirrors the guide for discovery and explicitly redirects edits back to GitHub.

**Tech Stack:** Markdown, GitHub Actions, Bash, Git, Node.js 24, pnpm 10, Vitest, Vite, Cloudflare Wrangler, OneDrive local sync.

## Global Constraints

- Do not enable automatic production deployment.
- Do not modify OAuth provider settings, credentials, repository secrets, GitHub branch protection, or Cloudflare configuration.
- Do not invent OAuth scopes, privacy promises, retention claims, or legal language.
- GitHub `main` is canonical; OneDrive is a read-only discovery mirror.
- Never deploy from a dirty checkout or from a commit different from the latest `origin/main`.
- Preserve the existing ODM, Jiang Weili, privacy alias, SEO, and application routes.

---

### Task 1: Add agent and contributor entry points

**Files:**
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `.github/copilot-instructions.md`
- Create: `README.md`
- Create: `docs/team/website-collaboration-guide.md`

**Interfaces:**
- Consumes: Design rules in `docs/superpowers/specs/2026-07-15-team-collaboration-framework-design.md`.
- Produces: A canonical `AGENTS.md`, a Chinese team guide, and thin discovery pointers for common agents.

- [ ] **Step 1: Create the canonical agent contract**

Write `AGENTS.md` with these enforceable sections and commands:

```markdown
# Memova Website Agent Instructions

## Start here
Before editing, run `git status -sb`, `git remote -v`, and `git fetch origin main`.
Create a scoped branch from current `origin/main`; do not work in another contributor's checkout.

## Source of truth
GitHub `RichardSun700/memova-website` and its `main` branch are canonical. OneDrive copies are read-only mirrors.

## Change isolation
Keep OAuth/privacy, ODM, SEO, and unrelated application work in separate pull requests. Do not discard or rewrite changes you did not create.

## OAuth and privacy
Do not invent scopes, data-use claims, retention periods, deletion promises, credentials, or legal conclusions. Call out every OAuth/privacy impact in the pull request and require human content review.

## Validation
Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm run check`, `pnpm run build`, `pnpm run check:seo`, and `pnpm run check:production-source`.

## Deployment
Deploy only when explicitly requested. `pnpm run deploy:production` must run from a clean commit exactly matching current `origin/main`; never bypass its guard.

## Handoff
Report branch, commit, checks, affected routes, merge status, and production deployment status.
```

- [ ] **Step 2: Create cross-agent pointers**

Write `CLAUDE.md` and `.github/copilot-instructions.md` as short pointers to `AGENTS.md`. Both must repeat only three emergency rules: read `AGENTS.md`, start from current `origin/main`, and never deploy without an explicit request plus a passing guard.

- [ ] **Step 3: Create the team guide and repository README**

Write `docs/team/website-collaboration-guide.md` in Chinese with the workflow `fetch -> scoped branch -> validation -> PR -> review -> merge -> explicit deploy`, named route-sensitive areas, conflict guidance, OAuth/privacy review requirements, and an Agent quick-start block. Write `README.md` with the production URL, repository purpose, validation commands, and links to `AGENTS.md` and the guide.

- [ ] **Step 4: Validate instruction consistency**

Run:

```bash
rg -n "origin/main|deploy:production|OAuth|privacy|OneDrive" AGENTS.md CLAUDE.md .github/copilot-instructions.md README.md docs/team/website-collaboration-guide.md
git diff --check
```

Expected: every entry point identifies `origin/main` and deployment safety; no whitespace errors.

- [ ] **Step 5: Commit the documentation entry points**

```bash
git add AGENTS.md CLAUDE.md .github/copilot-instructions.md README.md docs/team/website-collaboration-guide.md
git commit -m "docs: add website collaboration guide"
```

### Task 2: Add pull-request governance and continuous validation

**Files:**
- Create: `.github/pull_request_template.md`
- Create: `.github/workflows/validate.yml`

**Interfaces:**
- Consumes: Existing package scripts `test`, `check`, `build`, `check:seo`, and `check:production-source`.
- Produces: A non-deploying `validate` workflow and a review checklist for every pull request.

- [ ] **Step 1: Create the pull-request template**

Include checkboxes for change type, affected routes/files, separate OAuth/privacy impact, local checks, screenshots when UI changes, rollback notes, and confirmation that no secrets were committed. Require a human reviewer for OAuth/privacy language.

- [ ] **Step 2: Create the validation workflow**

Write `.github/workflows/validate.yml` with this behavior:

```yaml
name: Validate
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: validate-${{ github.ref }}
  cancel-in-progress: true
jobs:
  test-build:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.4.1
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm run check
      - run: pnpm run build
      - run: pnpm run check:seo
      - run: pnpm run check:production-source
```

The workflow must contain no deploy command and request no write permissions or secrets.

- [ ] **Step 3: Validate workflow syntax and intent**

Run:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('.github/workflows/validate.yml','utf8'); if(!s.includes('pull_request:')||!s.includes('permissions:')||s.includes('wrangler pages deploy')) process.exit(1)"
git diff --check
```

Expected: exit code 0 and no whitespace errors.

- [ ] **Step 4: Commit governance files**

```bash
git add .github/pull_request_template.md .github/workflows/validate.yml
git commit -m "ci: validate website pull requests"
```

### Task 3: Replace branch-name deployment checks with exact production identity

**Files:**
- Create: `scripts/verify-deploy-head.mjs`
- Create: `client/src/seo/verifyDeployHead.test.mjs`
- Modify: `scripts/deploy-production.sh`

**Interfaces:**
- Produces: `findDeployHeadViolation(headSha: string, originMainSha: string): string | null`.
- Consumes: `node scripts/verify-deploy-head.mjs HEAD origin/main` from the deployment script.

- [ ] **Step 1: Write the failing unit tests**

Create `client/src/seo/verifyDeployHead.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { findDeployHeadViolation } from "../../../scripts/verify-deploy-head.mjs";

describe("findDeployHeadViolation", () => {
  it("accepts an exact production commit", () => {
    expect(findDeployHeadViolation("abc123", "abc123")).toBeNull();
  });

  it("rejects a stale, divergent, or unmerged commit", () => {
    expect(findDeployHeadViolation("abc123", "def456")).toContain(
      "does not exactly match origin/main",
    );
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```bash
pnpm test -- client/src/seo/verifyDeployHead.test.mjs
```

Expected: FAIL because `scripts/verify-deploy-head.mjs` does not exist.

- [ ] **Step 3: Implement the commit-identity verifier**

Create `scripts/verify-deploy-head.mjs` exporting `findDeployHeadViolation`. Its CLI resolves two git revisions with `git rev-parse`, prints `Production commit verified: HEAD exactly matches origin/main.` on equality, and exits nonzero with `Production deployment stopped: HEAD does not exactly match origin/main` otherwise.

- [ ] **Step 4: Update the production script**

In `scripts/deploy-production.sh`:

- Keep the whole-worktree clean check.
- Remove the local branch-name requirement.
- Fetch `origin main` immediately after the clean check.
- Run `node scripts/verify-deploy-head.mjs HEAD origin/main`.
- Keep Wrangler authentication and all test/build checks.
- Remove `git push origin HEAD:main` and the second fetch/identity block.
- Keep the final Cloudflare Pages deployment command unchanged.

- [ ] **Step 5: Run focused and repository checks**

Run:

```bash
pnpm test -- client/src/seo/verifyDeployHead.test.mjs
node scripts/verify-deploy-head.mjs HEAD HEAD
pnpm run check:production-source
bash -n scripts/deploy-production.sh
```

Expected: tests pass; the verifier accepts `HEAD HEAD`; production source verifies; Bash syntax passes. Do not run the deploy command from the feature branch because it must reject a commit not yet merged into `origin/main`.

- [ ] **Step 6: Commit the deployment guard**

```bash
git add scripts/verify-deploy-head.mjs client/src/seo/verifyDeployHead.test.mjs scripts/deploy-production.sh
git commit -m "fix: require exact main commit for deployment"
```

### Task 4: Validate the complete repository and preserve production pages

**Files:**
- Verify: `client/public/odmpartnership/index.html`
- Verify: `client/public/team/weilijiang/index.html`
- Verify: `client/public/_headers`
- Verify: `client/public/_redirects`

**Interfaces:**
- Consumes: All repository changes from Tasks 1-3.
- Produces: A validation record suitable for the pull request description.

- [ ] **Step 1: Install exactly locked dependencies**

Run `pnpm install --frozen-lockfile`.

Expected: exit code 0 without changing `pnpm-lock.yaml`.

- [ ] **Step 2: Run the complete validation sequence**

Run:

```bash
pnpm test
pnpm run check
pnpm run build
pnpm run check:seo
pnpm run check:production-source
```

Expected: every command exits 0. Existing warnings for undefined Vite analytics placeholders may be reported but must not fail the build.

- [ ] **Step 3: Confirm protected static pages survive the build**

Run:

```bash
test -f dist/public/odmpartnership/index.html
test -f dist/public/team/weilijiang/index.html
rg -n "privacy|odmpartnership|weilijiang" client/public/_redirects client/public/_headers
git status -sb
```

Expected: both built pages exist; route configuration is present; only intended committed changes are listed.

### Task 5: Publish the review branch and mirror the guide to OneDrive

**Files:**
- Create outside Git: `公司文档库/开发文档库/Memova Website 协作与部署/README.md`
- Copy outside Git: `公司文档库/开发文档库/Memova Website 协作与部署/Memova Website 协作与部署指南.md`

**Interfaces:**
- Consumes: `docs/team/website-collaboration-guide.md` and the validated Git branch.
- Produces: GitHub review branch, draft pull request, and a discoverable OneDrive mirror.

- [ ] **Step 1: Push the collaboration branch**

Run:

```bash
git push -u origin codex/team-collaboration-framework
```

Expected: remote tracking is established without modifying `main`.

- [ ] **Step 2: Open a draft pull request**

Create a draft PR into `main` summarizing the agent entry points, validation workflow, exact-main deployment guard, full check results, and the fact that no production deployment occurs.

- [ ] **Step 3: Create the OneDrive discovery mirror**

Create the target folder under `/Users/mingyusun/Library/CloudStorage/OneDrive-杭州能量橙子科技有限公司/公司共享盘 - Documents/公司文档库/开发文档库/`. Copy the repository guide verbatim and add `README.md` stating:

```markdown
# Memova Website 协作与部署

这里是团队和 Agent 的发现入口。正式规则和代码以 GitHub 仓库 `RichardSun700/memova-website` 的 `main` 分支为准。

开始工作前：
1. 打开 GitHub 仓库并先读根目录 `AGENTS.md`。
2. 从最新 `origin/main` 建立独立分支。
3. 通过 PR 合并；不要在 OneDrive 直接维护第二套规则。
4. 部署必须由明确请求触发，并通过仓库的生产部署防护。
```

- [ ] **Step 4: Verify the mirrored guide**

Run `shasum -a 256` against the repository guide and the mirrored guide.

Expected: identical SHA-256 values.

### Task 6: Record durable project state in the Memova vault

**Files:**
- Create or modify: `/Users/mingyusun/Library/Mobile Documents/iCloud~md~obsidian/Documents/richardvault/llm-wiki/memova/40_projects/memova/website-collaboration-and-deployment.md`
- Modify: `/Users/mingyusun/Library/Mobile Documents/iCloud~md~obsidian/Documents/richardvault/llm-wiki/log.md`

**Interfaces:**
- Consumes: Final branch, commits, PR URL, checks, and OneDrive path.
- Produces: Concise durable Memova project memory.

- [ ] **Step 1: Write the durable summary**

Record the GitHub source-of-truth rule, agent entry files, PR validation workflow, manual deployment boundary, exact-`origin/main` guard, OneDrive mirror path, branch, commits, PR URL, and any remaining decision about branch protection or automatic deployment.

- [ ] **Step 2: Append the activity log**

Add a dated 2026-07-15 entry linking to the project page and noting that production was not deployed by this framework change.

- [ ] **Step 3: Verify final state**

Run:

```bash
git status -sb
git log --oneline origin/main..HEAD
```

Expected: the repository worktree is clean, the feature commits are visible, and `main` remains unchanged pending review.
