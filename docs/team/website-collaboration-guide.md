# Memova Website 团队协作与部署指南

更新日期：2026-07-15

## 一句话规则

GitHub `RichardSun700/memova-website` 的 `main` 分支是唯一正式源；每项工作从最新 `origin/main` 建独立分支，通过 PR 合并，并且只有在明确要求上线后才能从最新、干净的正式提交部署。

## 为什么需要这套流程

网站同时包含 OAuth、隐私政策、ODM 介绍、SEO/GEO、团队成员页面和主站应用。多人或多个 Agent 如果从不同时间的本地副本直接部署，旧文件可能覆盖已经合并的新内容。统一 GitHub 正式源和部署防护，可以让并行修改保留下来，同时让每次上线都有清晰证据。

## 标准工作流

```text
读取 AGENTS.md
      ↓
fetch 最新 origin/main
      ↓
为单一事项建立分支 / worktree
      ↓
修改并完成本地验证
      ↓
提交并发起 PR
      ↓
自动检查 + 相关负责人审核
      ↓
合并 main
      ↓
明确要求部署后，从与 origin/main 完全一致的干净提交上线
```

开始前执行：

```bash
git status -sb
git remote -v
git fetch origin main
git log --oneline --decorate -8 origin/main
```

从最新正式源建立分支，例如：

```bash
git switch -c feature/oauth-consent-copy origin/main
```

分支名称不决定能否部署；提交是否与最新 `origin/main` 完全一致才决定能否部署。

## 工作如何拆分

一个 PR 只处理一个清晰主题：

- OAuth 或登录授权；
- Privacy Policy、Terms 或数据删除说明；
- ODM 合作页；
- SEO/GEO、robots、sitemap、redirects 或 headers；
- 主站 UI/功能；
- 团队成员页。

不要把 OAuth/Privacy 与无关的视觉改版放在同一个 PR。这样相关负责人可以单独审核法律和平台合规含义，出现问题时也容易回滚。

## OAuth 和 Privacy 特别规则

OAuth、隐私政策及数据处理说明可能影响平台审核和公司承诺，因此：

- Agent 不得自行编造 OAuth scope、数据用途、保存期限、删除承诺或法律结论；
- 任何 scope、consent、Gmail/Calendar 数据、第三方处理、删除与保留方式的变化，都必须在 PR 中单独列出；
- 修改后的文字必须由业务或合规负责人做人类审核；
- token、client secret、private key、Cloudflare 凭据不得进入 Git、截图或文档；
- 如果只是代码结构变化但不改变数据行为，也要在 PR 中写明“OAuth/Privacy 行为无变化”。

## 修改前避免冲突

如果其他成员也在工作：

1. 先查看 GitHub 中同文件、同路由的开放 PR；
2. 告知对方计划修改的文件和边界；
3. 各自在独立分支/worktree 工作；
4. 合并前重新 fetch，并把最新 `origin/main` 整合进自己的分支；
5. 对冲突逐段判断，不能用整份旧文件覆盖新文件。

本地 `main` 可能已经过期。看到 `ahead/behind` 不为零时，不要直接从该目录构建或部署。

## 本地验证

全新工作区中的 SEO 测试依赖构建生成的 `dist/public`，因此推荐顺序是：

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm test
pnpm run check:seo
pnpm run check:production-source
```

同时检查本次修改涉及的真实路由。关键静态资源包括：

- `/odmpartnership/`
- `/team/weilijiang/`
- `/privacy-policy` 与 `/privacy`
- `robots.txt`
- `sitemap.xml`
- 未知地址的真实 404

涉及可见页面时，至少检查桌面和手机布局。

## PR 应该写什么

每个 PR 需要说明：

- 改了什么、为什么改；
- 涉及哪些文件和线上路由；
- OAuth/Privacy 是否受影响；
- 执行了哪些检查，结果如何；
- UI 改动的桌面/手机证据；
- 发生问题时如何回滚。

GitHub 自动检查只验证代码和构建，不会自动部署，也不能代替 OAuth/Privacy 的人类内容审核。

## 部署规则

合并 PR 不会自动上线。只有在负责人明确提出部署后，才运行：

```bash
pnpm run deploy:production
```

部署脚本必须确认：

- 当前 worktree 没有未提交或未跟踪文件；
- 已即时 fetch 最新 `origin/main`；
- 当前 `HEAD` 与 `origin/main` 是同一个提交；
- 类型检查、构建、测试、SEO 和生产静态源检查通过；
- Wrangler 身份验证有效。

不要绕过检查、不要手工上传旧 `dist`、不要让部署脚本替你自动 commit、merge、pull 或 push。

## 出现冲突或失败怎么办

- CI 失败：在自己的分支修复，不要直接在 `main` 上试错；
- 分支落后：fetch 后整合最新 `origin/main`，再完整验证；
- OAuth/Privacy 含义不清：停止修改并找负责人确认，不要猜；
- 部署被拒绝：先看 worktree 是否干净、`HEAD` 是否等于 `origin/main`，不要关闭防护；
- 线上异常：记录部署提交和受影响路由，优先回滚到上一个已验证正式提交。

## Agent 快速开始提示词

团队成员可以把下面这段直接发给自己的 Agent：

```text
你正在修改 Memova 网站仓库 RichardSun700/memova-website。
先完整阅读仓库根目录 AGENTS.md，再执行 git status -sb、git remote -v 和 git fetch origin main。
从最新 origin/main 建立独立分支，只处理我指定的范围，不要覆盖其他成员的改动。
涉及 OAuth 或 Privacy 时，不得编造 scope、数据用途或法律承诺，必须列出影响并等待人类内容审核。
完成后运行仓库规定的全部检查，通过 PR 提交。除非我明确要求部署，否则不要上线；部署时不得绕过 exact-origin/main 防护。
最后报告分支、commit、PR、检查结果、影响路由、OAuth/Privacy 影响以及是否部署。
```

## OneDrive 与 GitHub 的关系

OneDrive 中的本指南用于让团队成员和 Agent 快速发现规则。正式版本仍然是 GitHub 仓库里的 `AGENTS.md` 和本文件。需要修改规则时，请在 GitHub 提交 PR，不要在 OneDrive 维护另一套会逐渐分叉的版本。
