import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  SITE_URL,
  SOCIAL_IMAGE,
  getCanonicalUrl,
  getSitePage,
  getStructuredData,
  sitePages,
} from "../client/src/seo/sitePages.ts";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const outputDir = path.join(projectRoot, "dist", "public");
const privacyPolicyPath = path.join(
  projectRoot,
  "client",
  "src",
  "content",
  "privacy-policy.md"
);
const termsOfServicePath = path.join(
  projectRoot,
  "client",
  "src",
  "content",
  "terms-of-service.md"
);

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

const SEO_SHELL_STYLE_ID = "memova-seo-shell-styles";
const SEO_SHELL_VERSION = "2";
const SEO_SHELL_STYLES = `
    html, body { min-height: 100%; margin: 0; background: #fafcff; }
    .memova-seo-shell, .memova-seo-shell * { box-sizing: border-box; }
    .memova-seo-shell {
      min-height: 100vh;
      overflow-x: hidden;
      background:
        radial-gradient(circle at 14% 24%, rgba(142, 156, 199, 0.18), transparent 30rem),
        radial-gradient(circle at 83% 72%, rgba(179, 41, 243, 0.08), transparent 28rem),
        #fafcff;
      color: #2d3a5c;
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .memova-seo-shell a { color: inherit; text-decoration: none; }
    .memova-seo-shell__nav {
      position: relative;
      z-index: 2;
      display: flex;
      min-height: 5rem;
      align-items: center;
      justify-content: space-between;
      width: min(80rem, calc(100% - 2rem));
      margin: 0 auto;
    }
    .memova-seo-shell__brand { display: inline-flex; align-items: center; gap: 0.5rem; }
    .memova-seo-shell__brand img { width: auto; height: 4rem; object-fit: contain; }
    .memova-seo-shell__brand span {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .memova-seo-shell__nav-group {
      display: flex;
      align-items: center;
      gap: clamp(1rem, 2.4vw, 2rem);
    }
    .memova-seo-shell__nav-links {
      display: flex;
      align-items: center;
      gap: clamp(0.9rem, 1.8vw, 1.5rem);
      color: #637083;
      font-size: 0.78rem;
      font-weight: 650;
    }
    .memova-seo-shell__nav-cta,
    .memova-seo-shell__primary,
    .memova-seo-shell__secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1;
    }
    .memova-seo-shell__nav-cta {
      min-height: 2.25rem;
      padding: 0.75rem 1.25rem;
      background: #2d3a5c;
      color: white !important;
      box-shadow: 0 10px 28px rgba(45, 58, 92, 0.13);
    }
    .memova-seo-shell__hero {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.02fr) minmax(18rem, 0.98fr);
      gap: clamp(2.5rem, 6vw, 5.5rem);
      align-items: center;
      width: min(80rem, calc(100% - 2rem));
      min-height: calc(100vh - 5rem);
      margin: 0 auto;
      padding: 4rem 0 6rem;
    }
    .memova-seo-shell__hero::before {
      content: "";
      position: absolute;
      inset: 0 -15vw;
      z-index: -1;
      opacity: 0.42;
      background-image:
        linear-gradient(to right, #eef2f8 1px, transparent 1px),
        linear-gradient(to bottom, #eef2f8 1px, transparent 1px);
      background-size: 4rem 4rem;
      -webkit-mask-image: radial-gradient(ellipse 62% 58% at 50% 48%, #000 55%, transparent 100%);
      mask-image: radial-gradient(ellipse 62% 58% at 50% 48%, #000 55%, transparent 100%);
    }
    .memova-seo-shell__copy { max-width: 38rem; }
    .memova-seo-shell__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.75rem;
      border: 1px solid rgba(142, 156, 199, 0.28);
      border-radius: 999px;
      background: rgba(142, 156, 199, 0.11);
      font-size: 0.67rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .memova-seo-shell__eyebrow::before { content: "✦"; color: #6479be; }
    .memova-seo-shell__title {
      max-width: 37rem;
      margin: 1.5rem 0 0;
      font-family: "DM Serif Display", Georgia, serif;
      font-size: clamp(3rem, 5.2vw, 4.75rem);
      font-weight: 400;
      letter-spacing: -0.035em;
      line-height: 1.04;
    }
    .memova-seo-shell__title span {
      display: block;
      color: #5f6fbd;
      background: linear-gradient(90deg, #2864f5, #6658d8 54%, #a72de4);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .memova-seo-shell__lead {
      max-width: 34rem;
      margin: 1.4rem 0 0;
      color: #475569;
      font-size: clamp(1rem, 1.6vw, 1.12rem);
      line-height: 1.72;
    }
    .memova-seo-shell__actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
    .memova-seo-shell__primary,
    .memova-seo-shell__secondary { min-height: 3rem; padding: 0.9rem 1.65rem; }
    .memova-seo-shell__primary {
      color: white !important;
      background: linear-gradient(90deg, #2864f5, #6658d8 54%, #a72de4);
      box-shadow: 0 14px 32px rgba(83, 88, 201, 0.18);
    }
    .memova-seo-shell__secondary {
      border: 1px solid #dde6ff;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 7px 22px rgba(45, 58, 92, 0.06);
    }
    .memova-seo-shell__trust {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      margin: 1.7rem 0 0;
      padding: 0;
      list-style: none;
    }
    .memova-seo-shell__trust li {
      padding: 0.48rem 0.72rem;
      border: 1px solid #e8eef7;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.9);
      color: #637083;
      font-size: 0.64rem;
      font-weight: 700;
      box-shadow: 0 5px 15px rgba(45, 58, 92, 0.04);
    }
    .memova-seo-shell__panel {
      position: relative;
      width: min(100%, 33rem);
      margin-left: auto;
      padding: 1.25rem;
      border: 1px solid rgba(203, 213, 225, 0.78);
      border-radius: 1.75rem;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 30px 80px rgba(45, 58, 92, 0.12);
      -webkit-backdrop-filter: blur(16px);
      backdrop-filter: blur(16px);
    }
    .memova-seo-shell__panel-label {
      margin: 0 0 0.9rem;
      color: #94a3b8;
      font-size: 0.67rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .memova-seo-shell__card {
      padding: 1.05rem;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 8px 26px rgba(45, 58, 92, 0.05);
    }
    .memova-seo-shell__card + .memova-seo-shell__card { margin-top: 0.85rem; }
    .memova-seo-shell__card strong {
      display: block;
      margin-bottom: 0.65rem;
      color: #94a3b8;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .memova-seo-shell__card p { margin: 0; color: #526075; font-size: 0.78rem; line-height: 1.6; }
    .memova-seo-shell__card--ready {
      border-color: #cdd7ff;
      background: linear-gradient(135deg, rgba(238, 242, 255, 0.95), white);
    }
    .memova-seo-shell__connector {
      display: grid;
      width: 1.8rem;
      height: 1.8rem;
      place-items: center;
      margin: 0.55rem auto;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      background: #f8fafc;
      color: #94a3b8;
      font-size: 0.8rem;
    }
    .memova-seo-shell__story-copy {
      width: min(66rem, calc(100% - 2rem));
      margin: 0 auto;
      padding: 6rem 0;
      border-top: 1px solid #e8eef7;
    }
    .memova-seo-shell__story-copy h2 {
      margin: 0;
      font-family: "DM Serif Display", Georgia, serif;
      font-size: clamp(2rem, 4vw, 3.5rem);
      font-weight: 400;
      line-height: 1.1;
    }
    .memova-seo-shell__story-copy p {
      max-width: 52rem;
      margin: 1rem 0 0;
      color: #637083;
      font-size: 1rem;
      line-height: 1.75;
    }
    .memova-seo-shell--page .memova-seo-shell__hero {
      display: flex;
      max-width: 62rem;
      min-height: calc(100vh - 5rem);
      justify-content: center;
      text-align: center;
    }
    .memova-seo-shell--page .memova-seo-shell__copy { margin: 0 auto; }
    .memova-seo-shell--page .memova-seo-shell__title { max-width: 58rem; }
    .memova-seo-shell--page .memova-seo-shell__lead { max-width: 48rem; }
    .memova-seo-shell--page .memova-seo-shell__actions { justify-content: center; }
    .memova-seo-legal__header {
      border-bottom: 1px solid rgba(232, 240, 248, 0.9);
      background: rgba(255, 255, 255, 0.86);
    }
    .memova-seo-legal__header-inner {
      display: flex;
      width: min(72rem, calc(100% - 2rem));
      min-height: 4rem;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin: 0 auto;
    }
    .memova-seo-legal__brand {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.18em;
    }
    .memova-seo-legal__brand img {
      width: 5.6rem;
      height: 1.8rem;
      object-fit: cover;
      object-position: 50% 69%;
      mix-blend-mode: multiply;
    }
    .memova-seo-legal__home {
      color: rgba(46, 91, 130, 0.7) !important;
      font-size: 0.8rem;
      font-weight: 650;
    }
    .memova-seo-legal__main {
      width: min(48rem, calc(100% - 2rem));
      margin: 0 auto;
      padding: 3rem 0 5rem;
    }
    .memova-seo-legal__tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .memova-seo-legal__tab {
      padding: 0.55rem 1rem;
      border: 1px solid #dcebf6;
      border-radius: 999px;
      background: white;
      color: #2e5b82 !important;
      font-size: 0.75rem;
      font-weight: 750;
    }
    .memova-seo-legal__tab[aria-current="page"] {
      border-color: #0f2b3c;
      background: #0f2b3c;
      color: white !important;
    }
    .memova-seo-legal__article {
      padding: clamp(2rem, 5vw, 3rem);
      border: 1px solid #dcebf6;
      border-radius: 0.9rem;
      background: white;
      box-shadow: 0 24px 60px rgba(46, 91, 130, 0.06);
    }
    .memova-seo-legal__title {
      margin: 0;
      color: #0f2b3c;
      font-family: "DM Serif Display", Georgia, serif;
      font-size: clamp(2.4rem, 6vw, 3.2rem);
      font-weight: 400;
      line-height: 1.08;
    }
    .memova-seo-legal__section-title {
      margin: 2.5rem 0 0;
      padding-top: 2rem;
      border-top: 1px solid #e8f0f8;
      color: #0f2b3c;
      font-size: clamp(1.15rem, 2.5vw, 1.35rem);
      line-height: 1.25;
    }
    .memova-seo-legal__subheading {
      margin: 1.75rem 0 0;
      color: #0f2b3c;
      font-size: 0.98rem;
      line-height: 1.3;
    }
    .memova-seo-legal__paragraph,
    .memova-seo-legal__list {
      color: rgba(46, 91, 130, 0.78);
      font-size: clamp(0.875rem, 1.7vw, 0.94rem);
      line-height: 1.85;
    }
    .memova-seo-legal__paragraph { margin: 1.25rem 0 0; }
    .memova-seo-legal__paragraph--lead { margin-top: 0.75rem; }
    .memova-seo-legal__list {
      margin: 1rem 0 0;
      padding-left: 1.25rem;
    }
    .memova-seo-legal__list li + li { margin-top: 0.5rem; }
    .memova-seo-app {
      display: grid;
      min-height: calc(100vh - 5rem);
      place-items: center;
      width: min(40rem, calc(100% - 2rem));
      margin: 0 auto;
      padding: 4rem 0;
      text-align: center;
    }
    .memova-seo-app__card {
      width: min(100%, 34rem);
      padding: clamp(2rem, 6vw, 3.5rem);
      border: 1px solid rgba(221, 230, 255, 0.9);
      border-radius: 1.75rem;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: 0 28px 80px rgba(45, 58, 92, 0.1);
    }
    .memova-seo-app__status {
      display: inline-flex;
      padding: 0.45rem 0.7rem;
      border: 1px solid rgba(40, 100, 245, 0.18);
      border-radius: 999px;
      background: rgba(40, 100, 245, 0.07);
      color: #2864f5;
      font-size: 0.67rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .memova-seo-app h1 {
      margin: 1.25rem 0 0;
      font-family: "DM Serif Display", Georgia, serif;
      font-size: clamp(2.4rem, 7vw, 3.75rem);
      font-weight: 400;
      line-height: 1.08;
    }
    .memova-seo-app p {
      margin: 1rem auto 0;
      color: #637083;
      line-height: 1.7;
    }
    @media (max-width: 860px) {
      .memova-seo-shell__hero {
        grid-template-columns: 1fr;
        gap: 2.5rem;
        padding-top: 3rem;
      }
      .memova-seo-shell__panel { width: 100%; margin: 0; }
      .memova-seo-shell__nav-links { display: none; }
    }
    @media (max-width: 560px) {
      .memova-seo-shell__nav { min-height: 4.5rem; }
      .memova-seo-shell__brand img { height: 3.25rem; }
      .memova-seo-shell__nav-cta { display: none; }
      .memova-seo-shell__hero { min-height: calc(100vh - 4.5rem); padding: 2.5rem 0 4rem; }
      .memova-seo-shell__title { font-size: clamp(2.55rem, 12.5vw, 3.35rem); }
      .memova-seo-shell__lead { font-size: 0.95rem; }
      .memova-seo-shell__primary, .memova-seo-shell__secondary { width: 100%; }
      .memova-seo-shell__panel { padding: 1rem; border-radius: 1.35rem; }
    }`;

function cleanMarkdownText(value) {
  return value.replace(/\\([\\`*_[\]{}()#+\-.!>])/g, "$1").trim();
}

function renderInlineMarkdown(value) {
  const escaped = escapeText(cleanMarkdownText(value));
  const italic = escaped.match(/^\*(.+)\*$/);
  if (italic) return `<em>${italic[1]}</em>`;
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function parseLegalMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: `h${heading[1].length}`, text: heading[2] });
      continue;
    }

    const listItem = line.match(/^-\s+(.+)$/);
    if (listItem) {
      const items = [listItem[1]];
      let cursor = index + 1;
      while (cursor < lines.length) {
        while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
        const nextItem = lines[cursor]?.trim().match(/^-\s+(.+)$/);
        if (!nextItem) break;
        items.push(nextItem[1]);
        index = cursor;
        cursor += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const paragraph = [line];
    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim();
      if (!nextLine || /^(#{1,3})\s+/.test(nextLine) || /^-\s+/.test(nextLine))
        break;
      paragraph.push(nextLine);
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderLegalBlocks(markdown) {
  return parseLegalMarkdown(markdown)
    .map((block, index) => {
      if (block.type === "h1") {
        return `<h1 class="memova-seo-legal__title">${renderInlineMarkdown(block.text)}</h1>`;
      }
      if (block.type === "h2") {
        return `<h2 class="memova-seo-legal__section-title">${renderInlineMarkdown(block.text)}</h2>`;
      }
      if (block.type === "h3") {
        return `<h3 class="memova-seo-legal__subheading">${renderInlineMarkdown(block.text)}</h3>`;
      }
      if (block.type === "ul") {
        const items = block.items
          .map(item => `<li>${renderInlineMarkdown(item)}</li>`)
          .join("");
        return `<ul class="memova-seo-legal__list">${items}</ul>`;
      }
      const modifier = index === 1 ? " memova-seo-legal__paragraph--lead" : "";
      return `<p class="memova-seo-legal__paragraph${modifier}">${renderInlineMarkdown(block.text)}</p>`;
    })
    .join("");
}

function renderLegalPolicySnapshot(page, markdownPath, currentPath) {
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const policy = renderLegalBlocks(markdown);
  const privacyCurrent =
    currentPath === "/privacy" ? ' aria-current="page"' : "";
  const termsCurrent = currentPath === "/terms" ? ' aria-current="page"' : "";

  return `<div id="root"><div class="memova-seo-shell memova-seo-shell--legal" data-seo-snapshot="true" data-seo-shell-version="${SEO_SHELL_VERSION}" data-page-summary="${escapeAttribute(page.summary)}"><header class="memova-seo-legal__header"><div class="memova-seo-legal__header-inner"><a class="memova-seo-legal__brand" href="/"><img alt="Memova" src="/manus-storage/memova_logo_0eb30acc.png" width="90" height="29" /><span>MEMOVA</span></a><a class="memova-seo-legal__home" href="/">&larr; Home</a></div></header><main class="memova-seo-legal__main"><nav class="memova-seo-legal__tabs" aria-label="Legal documents"><a class="memova-seo-legal__tab" href="/privacy"${privacyCurrent}>Privacy Policy</a><a class="memova-seo-legal__tab" href="/terms"${termsCurrent}>Terms of Service</a></nav><article class="memova-seo-legal__article">${policy}</article></main></div></div>`;
}

export function renderPrivacyPolicySnapshot(page) {
  return renderLegalPolicySnapshot(page, privacyPolicyPath, "/privacy");
}

export function renderTermsOfServiceSnapshot(page) {
  return renderLegalPolicySnapshot(page, termsOfServicePath, "/terms");
}

function renderSeoShellNav() {
  return `<header class="memova-seo-shell__nav"><a class="memova-seo-shell__brand" href="/" aria-label="Memova home"><img src="/memova-logo-transparent.png" alt="Memova" width="87" height="64" /><span>Memova</span></a><div class="memova-seo-shell__nav-group"><nav class="memova-seo-shell__nav-links" aria-label="Primary"><a href="/how-it-works">How It Works</a><a href="/agent-memory">Agent Memory</a><a href="/user-cases">Use Cases</a><a href="/mcp">Plugins &amp; MCP</a></nav><a class="memova-seo-shell__nav-cta" href="/#waitlist">Join iOS Early Access</a></div></header>`;
}

function renderHomeSnapshot(page) {
  return `<div id="root"><div class="memova-seo-shell" data-seo-snapshot="true" data-seo-shell-version="${SEO_SHELL_VERSION}" data-page-summary="${escapeAttribute(page.summary)}">${renderSeoShellNav()}<main><section class="memova-seo-shell__hero" aria-labelledby="memova-seo-hero-title"><div class="memova-seo-shell__copy"><span class="memova-seo-shell__eyebrow">Agent memory for everyday context</span><h1 class="memova-seo-shell__title" id="memova-seo-hero-title">Your everyday context,<span>ready for agents.</span></h1><p class="memova-seo-shell__lead">Memova turns the notes, conversations, and ideas you choose to capture into private agent memory—and useful workflows you approve.</p><div class="memova-seo-shell__actions"><a class="memova-seo-shell__primary" href="/#waitlist">Join iOS Early Access</a><a class="memova-seo-shell__secondary" href="#product-tour">See the workflow</a></div><ul class="memova-seo-shell__trust" aria-label="Memova privacy principles"><li>You choose what to capture</li><li>Private, exportable memory</li><li>Approve before action</li></ul></div><div class="memova-seo-shell__panel" aria-hidden="true"><p class="memova-seo-shell__panel-label">Alignment Loop</p><div class="memova-seo-shell__card"><strong>Context inputs</strong><p>Notes, conversations, decisions, and ideas you choose to remember.</p></div><span class="memova-seo-shell__connector">↓</span><div class="memova-seo-shell__card memova-seo-shell__card--ready"><strong>Agent-ready</strong><p>Structured context becomes useful, reviewable workflows with traceable sources.</p></div></div></section><section class="memova-seo-shell__story-copy" aria-labelledby="memova-seo-story-title"><h2 id="memova-seo-story-title">${escapeText(page.title)}</h2><p>${escapeText(page.summary)}</p><p>${escapeText(page.description)}</p></section></main></div></div>`;
}

function renderGenericSnapshot(page) {
  const hero = page.hero || {
    eyebrow: "Memova",
    title: page.title,
    intro: page.description,
  };

  return `<div id="root"><div class="memova-seo-shell memova-seo-shell--page" data-seo-snapshot="true" data-seo-shell-version="${SEO_SHELL_VERSION}" data-page-summary="${escapeAttribute(page.summary)}">${renderSeoShellNav()}<main><section class="memova-seo-shell__hero"><div class="memova-seo-shell__copy"><span class="memova-seo-shell__eyebrow">${escapeText(hero.eyebrow)}</span><h1 class="memova-seo-shell__title">${escapeText(hero.title)}</h1><p class="memova-seo-shell__lead">${escapeText(hero.intro)}</p></div></section><section class="memova-seo-shell__story-copy" aria-label="About this page"><h2>${escapeText(page.title)}</h2><p>${escapeText(page.summary)}</p><p>${escapeText(page.description)}</p></section></main></div></div>`;
}

function renderPrivateAppSnapshot(page) {
  return `<div id="root"><div class="memova-seo-shell memova-seo-shell--app" data-seo-snapshot="true" data-seo-shell-version="${SEO_SHELL_VERSION}" data-page-summary="${escapeAttribute(page.summary)}">${renderSeoShellNav()}<main class="memova-seo-app"><section class="memova-seo-app__card"><span class="memova-seo-app__status">Secure Memova</span><h1>${escapeText(page.hero?.title || page.title)}</h1><p>${escapeText(page.hero?.intro || "Opening the requested Memova page…")}</p></section></main></div></div>`;
}

function renderNotFoundSnapshot(page) {
  return `<div id="root"><div class="memova-seo-shell memova-seo-shell--app" data-seo-snapshot="true" data-seo-shell-version="${SEO_SHELL_VERSION}" data-page-summary="${escapeAttribute(page.summary)}">${renderSeoShellNav()}<main class="memova-seo-app"><section class="memova-seo-app__card"><span class="memova-seo-app__status">404</span><h1>Page Not Found</h1><p>Sorry, the page you are looking for does not exist. It may have been moved or deleted.</p><div class="memova-seo-shell__actions" style="justify-content:center"><a class="memova-seo-shell__primary" href="/">Go Home</a></div></section></main></div></div>`;
}

function stripManagedHead(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, "")
    .replace(
      /<meta[^>]+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
      ""
    )
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(
      new RegExp(
        `<style[^>]+id=["']${SEO_SHELL_STYLE_ID}["'][^>]*>[\\s\\S]*?<\\/style>\\s*`,
        "gi"
      ),
      ""
    )
    .replace(
      /<script[^>]+id=["']memova-structured-data["'][^>]*>[\s\S]*?<\/script>\s*/gi,
      ""
    );
}

export function renderPageHtml(template, page) {
  const canonical = getCanonicalUrl(page);
  const robots = page.index
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, nofollow";
  const structuredData = JSON.stringify(getStructuredData(page)).replaceAll(
    "<",
    "\\u003c"
  );
  const head = `
    <title>${escapeText(page.title)}</title>
    <meta name="description" content="${escapeAttribute(page.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeAttribute(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Memova" />
    <meta property="og:title" content="${escapeAttribute(page.title)}" />
    <meta property="og:description" content="${escapeAttribute(page.description)}" />
    <meta property="og:url" content="${escapeAttribute(canonical)}" />
    <meta property="og:image" content="${escapeAttribute(SOCIAL_IMAGE)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <style id="${SEO_SHELL_STYLE_ID}">${SEO_SHELL_STYLES}</style>
    <script id="memova-structured-data" type="application/ld+json">${structuredData}</script>`;
  const snapshot =
    page.path === "/privacy"
      ? renderPrivacyPolicySnapshot(page)
      : page.path === "/terms"
        ? renderTermsOfServiceSnapshot(page)
        : page.path === "/"
          ? renderHomeSnapshot(page)
          : page.path === "/404"
            ? renderNotFoundSnapshot(page)
            : page.index
              ? renderGenericSnapshot(page)
              : renderPrivateAppSnapshot(page);

  return stripManagedHead(template)
    .replace(/<html(?:\s+[^>]*)?>/i, '<html lang="en-US">')
    .replace("</head>", `${head}\n  </head>`)
    .replace(/<div id=["']root["']>\s*<\/div>/i, snapshot);
}

export function renderSitemap(pages) {
  const entries = pages
    .filter(page => page.index)
    .map(
      page => `  <url>
    <loc>${escapeText(getCanonicalUrl(page))}</loc>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority.toFixed(2)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

const protectedRules = [
  "Disallow: /login",
  "Disallow: /profile",
  "Disallow: /connected-clients",
  "Disallow: /settings/",
  "Disallow: /mcp/oauth/",
  "Disallow: /bay-area-agent-demo-2",
  "Disallow: /user-cases/demos/",
];

function crawlerGroup(userAgent) {
  return [`User-agent: ${userAgent}`, "Allow: /", ...protectedRules].join("\n");
}

export function renderRobots() {
  return `${crawlerGroup("*")}

${crawlerGroup("OAI-SearchBot")}

${crawlerGroup("PerplexityBot")}

User-agent: GPTBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export const LEGAL_SPA_ROUTES = ["/privacy-policy", "/privacy"];

function createPrivateSpaPage(pathname, title, intro) {
  return {
    path: pathname,
    title: `${title} — Memova`,
    description: intro,
    index: false,
    changeFrequency: "yearly",
    priority: 0,
    summary: intro,
    schemaType: "WebPage",
    hero: {
      eyebrow: "Secure Memova",
      title,
      intro,
    },
  };
}

export const PRIVATE_SPA_PAGES = [
  createPrivateSpaPage(
    "/login",
    "Sign in to Memova",
    "Use your email to access profile settings and MCP client authorization."
  ),
  createPrivateSpaPage(
    "/profile",
    "Profile",
    "Manage your Memova account and connected MCP clients."
  ),
  createPrivateSpaPage(
    "/connected-clients",
    "Connected clients",
    "Review the MCP clients authorized to access your Memova workspace."
  ),
  createPrivateSpaPage(
    "/settings/connected-clients",
    "Connected clients",
    "Review the MCP clients authorized to access your Memova workspace."
  ),
  createPrivateSpaPage(
    "/mcp/oauth/consent",
    "Connect app",
    "Review and approve the requested Memova MCP permissions."
  ),
  createPrivateSpaPage(
    "/bay-area-agent-demo-2",
    "湾区买房首次咨询 for Violet",
    "正在打开为 Violet 整理的湾区首次买房咨询。"
  ),
];

export function writeLegalSpaShells(template, destinationDir) {
  const privacyPage = sitePages.find(page => page.path === "/privacy");
  if (!privacyPage) throw new Error("Missing /privacy page metadata");
  const privacyHtml = renderPageHtml(template, privacyPage);

  for (const route of LEGAL_SPA_ROUTES) {
    const destination = path.join(
      destinationDir,
      `${route.replace(/^\//, "")}.html`
    );
    fs.writeFileSync(destination, privacyHtml);
  }
}

export function writePrivateSpaShells(template, destinationDir) {
  for (const page of PRIVATE_SPA_PAGES) {
    const destination = path.join(
      destinationDir,
      `${page.path.replace(/^\//, "")}.html`
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, renderPageHtml(template, page));
  }
}

export function generateSeoPages() {
  const templatePath = path.join(outputDir, "index.html");
  const template = fs.readFileSync(templatePath, "utf8");

  for (const page of sitePages.filter(candidate => candidate.index)) {
    const destination =
      page.path === "/"
        ? templatePath
        : path.join(outputDir, page.path.replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, renderPageHtml(template, page));
  }

  // Cloudflare Pages serves top-level HTML files at extensionless URLs.
  // Dedicated legal shells preserve /privacy-policy and /privacy while the
  // React router renders the corresponding LegalPage content client-side.
  writeLegalSpaShells(template, outputDir);
  writePrivateSpaShells(template, outputDir);

  // Cloudflare Pages serves the root index as a SPA fallback when no top-level
  // 404.html exists. A real 404 document prevents unknown URLs from becoming
  // soft-404 homepage responses while keeping the explicit private rewrites.
  fs.writeFileSync(
    path.join(outputDir, "404.html"),
    renderPageHtml(template, getSitePage("/404"))
  );

  fs.writeFileSync(path.join(outputDir, "robots.txt"), renderRobots());
  fs.writeFileSync(
    path.join(outputDir, "sitemap.xml"),
    renderSitemap(sitePages)
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  generateSeoPages();
}
