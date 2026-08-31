import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const homepage = fs.readFileSync(
  path.resolve(process.cwd(), "client/homepage/index.html"),
  "utf8"
);
const publicDir = path.resolve(process.cwd(), "client/public");

function readPngSize(fileName: string) {
  const png = fs.readFileSync(path.join(publicDir, fileName));
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("production homepage", () => {
  it("uses the current Liquid Blue Mist icon as the stable search favicon", () => {
    expect(homepage).toContain(
      '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">'
    );
    expect(homepage).toContain(
      '<link rel="icon" type="image/svg+xml" href="/brand/memova-app-icon-liquid-blue.svg">'
    );
    expect(homepage).toContain('<link rel="manifest" href="/site.webmanifest">');
    expect(homepage).toContain('"logo":{"@type":"ImageObject","url":"https://memova.ai/favicon.png"');
    expect(homepage).not.toContain("favicon.ico?v=");

    expect(readPngSize("favicon-96x96.png")).toEqual({ width: 96, height: 96 });
    expect(readPngSize("favicon-192x192.png")).toEqual({ width: 192, height: 192 });
    expect(readPngSize("favicon.png")).toEqual({ width: 512, height: 512 });
    expect(readPngSize("apple-touch-icon.png")).toEqual({ width: 180, height: 180 });

    const ico = fs.readFileSync(path.join(publicDir, "favicon.ico"));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThanOrEqual(6);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(publicDir, "site.webmanifest"), "utf8")
    );
    expect(manifest.name).toBe("Memova");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/favicon-192x192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/favicon.png", sizes: "512x512" }),
      ])
    );
  });

  it("submits early-access signups to the production waitlist API", () => {
    expect(homepage).toContain('fetch("/api/waitlist"');
    expect(homepage).toContain('source: "home-ios-early-access"');
    expect(homepage).toContain('trackEvent("waitlist_submit_success"');
    expect(homepage).toContain("Please enter a valid email.");
    expect(homepage).toContain("noValidate: true");
    expect(homepage).not.toContain("setSubmitted(true)");
  });

  it("shows the community invitation immediately before early access", () => {
    const communityButton = homepage.indexOf('"Join Community"');
    const earlyAccessButton = homepage.indexOf('"Join early access"', communityButton);

    expect(communityButton).toBeGreaterThan(-1);
    expect(earlyAccessButton).toBeGreaterThan(communityButton);
    expect(homepage).toContain("/community/discord-community-qr.png");
    expect(homepage).toContain("https://discord.gg/wAeCmpy86");
    expect(homepage).toContain('role: "dialog"');
  });

  it("pairs Neil's sample with the Work Types guide before creation", () => {
    const captureScript = fs.readFileSync(
      path.join(publicDir, "capture-personal-manual-integration.js"),
      "utf8"
    );
    const scatterScript = fs.readFileSync(
      path.join(publicDir, "scatter-relations.js"),
      "utf8"
    );
    const workTypesPage = path.join(
      publicDir,
      "personal-manual/work-types/index.html"
    );
    const neilManualPage = path.join(
      publicDir,
      "personal-manual/neil-armstrong/index.html"
    );

    expect(homepage).toContain(
      "personal-manual-discovery-stack.css?v=20260828-chapter2-tab-highlight1"
    );
    expect(captureScript).toContain("Neil’s Personal Manual");
    expect(captureScript).toContain("Understand Your Work Type");
    expect(captureScript).toContain("data-learning-target=\"types\"");
    expect(captureScript).not.toContain('class="agent-learning-switcher"');
    expect(captureScript).toContain("CLICK TO VIEW ↗");
    const discoveryStyles = fs.readFileSync(
      path.join(publicDir, "personal-manual-discovery-stack.css"),
      "utf8"
    );
    expect(discoveryStyles).not.toContain(".agent-learning-switcher");
    expect(discoveryStyles).toContain("linear-gradient(135deg, #3d568f 0%, #5570ac 100%)");
    expect(discoveryStyles).toContain("linear-gradient(135deg, #f7c94f 0%, #edab32 100%)");
    expect(discoveryStyles).toContain("transition-duration: 380ms !important;");
    expect(captureScript).toContain(
      'src="./personal-manual/work-types/index.html?embed=1"'
    );
    expect(captureScript).toContain(
      'src="./personal-manual/neil-armstrong/index.html?embed=1&v=neil-v7-modified-flat1"'
    );
    expect(scatterScript).toContain(
      'src="./personal-manual/neil-armstrong/index.html?embed=1&v=neil-v7-modified-flat1"'
    );
    expect(captureScript).not.toContain("neil-armstrong-v7-preview");
    expect(captureScript).not.toContain("neil-armstrong-v7-remake");
    expect(scatterScript).not.toContain("neil-armstrong-v7-preview");
    expect(scatterScript).not.toContain("neil-armstrong-v7-remake");
    expect(captureScript).not.toContain("neil-v7-score-2");
    expect(scatterScript).not.toContain("neil-v7-score-2");
    expect(homepage).toContain(
      "capture-personal-manual-integration.js?v=20260831-personal-manual-polling1"
    );
    expect(homepage).toContain(
      "capture-personal-manual-integration.css?v=20260828-client-cards-flip2"
    );
    expect(homepage).toContain(
      "scatter-relations.js?v=20260828-observer-root1"
    );
    expect(scatterScript).toContain("const observationRoot = document.body || document.documentElement;");
    expect(fs.existsSync(workTypesPage)).toBe(true);
    expect(fs.readFileSync(workTypesPage, "utf8")).toContain(
      "MEMOVA Work Types · Understand Your Personal Manual"
    );
    expect(fs.readFileSync(neilManualPage, "utf8")).toContain(
      "Neil Armstrong’s Personal Manual · Memova"
    );
    expect(fs.readFileSync(neilManualPage, "utf8")).toContain(
      "Historical reconstruction · Apollo 11"
    );

    const neilManual = fs.readFileSync(neilManualPage, "utf8");
    const selectedPoles = new Map([
      ["Clarity", "Think it through"],
      ["Navigation", "Find the path"],
      ["Scope", "Go deeper"],
      ["Expression", "Understated"],
    ]);
    for (const [axis, label] of selectedPoles) {
      const block = neilManual.match(
        new RegExp(`<article class="axis-card"><h3>${axis}</h3>[\\s\\S]*?</article>`)
      )?.[0];
      expect(block, `${axis} axis`).toBeTruthy();
      expect(block?.match(/class="user-pole"/g), `${axis} selected pole`).toHaveLength(1);
      expect(block, `${axis} selected label`).toMatch(
        new RegExp(`class="user-pole"[\\s\\S]*?class="axis-subtitle">${label}</span>`)
      );
    }

    expect(neilManual).toContain(
      '<meta name="memova-manual-version" content="neil-armstrong-v7-modified" />'
    );
    expect(neilManual).toContain(
      '<meta name="memova-website-embed" content="flat-1" />'
    );
    expect(neilManual.match(/<iframe/g) ?? []).toHaveLength(0);
    expect(neilManual).not.toContain("mobile-card-cover");
    expect(neilManual).not.toContain("phone-specific v5 homepage");
    expect(neilManual).not.toContain("mobileCardSource");
    expect(neilManual.match(/id="dimensions"/g) ?? []).toHaveLength(1);
    expect(neilManual).toContain(
      'html:not([data-memova-app-ready="true"]) body[data-memova-embed="app"]'
    );
    expect(neilManual).not.toContain('name="robots" content="noindex,nofollow"');
    expect(neilManual).not.toContain("V7 REMAKE PREVIEW");
  });

  it("routes Personal Manual creation through Codex or Memova MCP instructions", () => {
    const captureScript = fs.readFileSync(
      path.join(publicDir, "capture-personal-manual-integration.js"),
      "utf8"
    );
    const captureStyles = fs.readFileSync(
      path.join(publicDir, "capture-personal-manual-integration.css"),
      "utf8"
    );

    expect(captureScript).toContain('renderClientCard("codex", 1');
    expect(captureScript).toContain('renderClientCard("mcp", 2');
    expect(captureScript).toContain('data-client-type="${clientType}"');
    expect(captureScript).toContain('data-client-card="${clientType}"');
    expect(captureScript).toContain('class="agent-client-flip__inner"');
    expect(captureScript).toContain('data-flip-back="${clientType}"');
    expect(captureScript).toContain("I have run both instructions");
    expect(captureScript).toContain(
      "Please install or update Memova from gxyfred/memova-codex-plugin to the latest version and complete sign-in. When finished, remind me to restart Codex."
    );
    expect(captureScript).toContain("@memova Personal Manual");
    expect(captureScript).not.toContain("one-time website handoff");
    expect(captureScript).not.toContain("submitUrl");
    expect(captureScript).toContain(
      "Please connect to the Memova MCP: https://api.memova.ai/mcp and complete sign-in. If the client needs to be reloaded, remind me."
    );
    expect(captureScript).toContain(
      "Use Memova to generate my Personal Manual."
    );
    expect(captureScript).toContain("After Prompt 01, restart Codex. Then run Prompt 02.");
    expect(captureScript).toContain("CHATGPT · CLAUDE · CURSOR · ANY AGENT");
    expect(captureScript).toContain("ChatGPT works here too.");
    expect(captureStyles).toContain('grid-template-areas:\n    "eyebrow eyebrow"\n    "title description"');
    expect(captureStyles).toContain("min-height: 315px;");
    expect(captureStyles).toContain("font-size: 8.8px;");
    expect(captureStyles).toContain("transition: transform 620ms cubic-bezier(.16, 1, .3, 1);");
    expect(captureStyles).toContain("@keyframes agent-client-back-content-in");
    expect(captureStyles).toContain("transition-duration: 460ms !important;");
    expect(captureScript).toContain("const CLIENT_CARD_FLIP_SETTLE_MS = 660;");
    expect(captureScript).toContain("await flipComplete;");
    const compactInstruction = captureScript.slice(
      captureScript.indexOf("function renderCompactInstruction("),
      captureScript.indexOf("function jobPrompt(")
    );
    expect(compactInstruction.indexOf("data-copy-instruction")).toBeLessThan(
      compactInstruction.indexOf("<p>")
    );
    const defaultSample = captureScript.slice(
      captureScript.indexOf("function renderNeilSample()"),
      captureScript.indexOf("function renderInstruction(")
    );
    expect(defaultSample).not.toContain('data-client-type="codex"');
    expect(defaultSample).not.toContain('data-client-type="mcp"');
    expect(captureScript).toMatch(
      /if \(state === "sample"\)[\s\S]*?data-create-manual/
    );
    expect(captureScript).toContain('state: "prepare", flow: null, session');
    expect(captureScript).toContain(
      'section.querySelectorAll("[data-reset-manual]").forEach'
    );
    const clientChoiceHandler = captureScript.slice(
      captureScript.indexOf('section.querySelectorAll("[data-client-type]")'),
      captureScript.indexOf('section.querySelectorAll("[data-flip-back]")')
    );
    expect(clientChoiceHandler).toContain('card.classList.toggle("is-flipped", active)');
    expect(clientChoiceHandler).toContain("manualFlow.clientType = clientType");
    expect(clientChoiceHandler).not.toContain("createRemoteJob");
    expect(clientChoiceHandler).not.toContain('state: "handoff"');
    expect(captureScript).toContain('const AUTH_STORAGE_KEY = "memova.auth.v1"');
    expect(captureScript).toContain("/v1/personal-manual/current");
    expect(captureScript).toContain("/overview/preview");
    expect(captureScript).toContain("function snapshot(manual)");
    expect(captureScript).toContain("function isNewResult(baseline, current)");
    expect(captureScript).toContain("current.latest_note_version_id !== baseline.versionId");
    expect(captureScript).toContain('cache: "no-store"');
    expect(captureScript).toContain('document.addEventListener("visibilitychange"');
    expect(captureScript).toContain("const POLL_TIMEOUT_MS = 15 * 60_000");
    expect(captureScript).toContain('error.message === "RATE_LIMITED"');
    expect(captureScript).toContain('error.message === "AUTH_REQUIRED"');
    expect(captureScript).toContain("window.localStorage.removeItem(AUTH_STORAGE_KEY)");
    expect(captureScript).toContain('window.addEventListener("pagehide", stopProgress)');
    expect(captureScript).not.toContain('/api/personal-manual/jobs');
    expect(captureScript).not.toContain("createRemoteJob");
    expect(captureScript).not.toContain("fetchRemoteJob");
    expect(captureScript).not.toContain("When the complete HTML is ready");
    expect(captureScript).not.toContain("POST only that HTML");
    expect(captureScript).not.toContain("complete self-contained HTML file");
    expect(captureScript).toContain('srcdoc="${escapeHtml(previewHtml)}"');
    expect(captureScript).toContain("secureManualHtml(manualFlow.resultHtml)");
    expect(captureScript).toContain("script-src 'none'");
    expect(captureScript).toContain('sandbox="allow-downloads"');
    expect(captureScript).not.toContain("RESULT_URL");
    expect(captureScript).not.toContain("generated-conductor");
    expect(captureScript).not.toContain("5 Codex conversations found");
  });
});
