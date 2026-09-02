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
    expect(homepage).toContain(
      '<link rel="manifest" href="/site.webmanifest">'
    );
    expect(homepage).toContain(
      '"logo":{"@type":"ImageObject","url":"https://memova.ai/favicon.png"'
    );
    expect(homepage).not.toContain("favicon.ico?v=");

    expect(readPngSize("favicon-96x96.png")).toEqual({ width: 96, height: 96 });
    expect(readPngSize("favicon-192x192.png")).toEqual({
      width: 192,
      height: 192,
    });
    expect(readPngSize("favicon.png")).toEqual({ width: 512, height: 512 });
    expect(readPngSize("apple-touch-icon.png")).toEqual({
      width: 180,
      height: 180,
    });

    const ico = fs.readFileSync(path.join(publicDir, "favicon.ico"));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThanOrEqual(6);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(publicDir, "site.webmanifest"), "utf8")
    );
    expect(manifest.name).toBe("Memova");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/favicon-192x192.png",
          sizes: "192x192",
        }),
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

  it("shows the community invitation immediately before the inert app download placeholder", () => {
    const communityButton = homepage.indexOf('"Join Community"');
    const appDownloadPlaceholder = homepage.indexOf(
      '"Download the app"',
      communityButton
    );

    expect(communityButton).toBeGreaterThan(-1);
    expect(appDownloadPlaceholder).toBeGreaterThan(communityButton);
    expect(homepage).toContain(
      'h("span", { className: "five-button five-button-small five-app-download-placeholder", "aria-disabled": "true", "data-app-download-placeholder": "true" }, "Download the app")'
    );
    expect(homepage).not.toContain(
      'href: "#waitlist", onClick: () => setOpen(false) }, "Download the app"'
    );
    expect(homepage).toContain("/community/discord-community-qr.png");
    expect(homepage).toContain("https://discord.gg/wAeCmpy86");
    expect(homepage).toContain('role: "dialog"');
  });

  it("shows the signed-in Memova account in the standalone homepage header", () => {
    const appDownloadControl = homepage.indexOf(
      'h("span", { className: "five-button five-button-small five-app-download-placeholder"'
    );
    const accountControl = homepage.indexOf(
      'authUser\n                    ? h("div", { className: "five-account-menu"'
    );

    expect(homepage).toContain(
      'const HOMEPAGE_AUTH_STORAGE_KEY = "memova.auth.v1";'
    );
    expect(homepage).toContain(
      'const HOMEPAGE_LOGIN_HREF = "/login?source=homepage&v=20260831";'
    );
    expect(homepage).toContain("window.location.assign(HOMEPAGE_LOGIN_HREF)");
    expect(homepage).toContain("function readHomepageAuthUser()");
    expect(homepage).toContain("async function fetchHomepageAuthUser()");
    expect(homepage).toContain("authUser?.avatar_url_expires_at");
    expect(homepage).toContain('className: "five-account-trigger"');
    expect(homepage).toContain('className: "five-account-popover"');
    expect(homepage).toContain('"aria-haspopup": "menu"');
    expect(homepage).toContain('h("span", null, "Profile")');
    expect(homepage).toContain('"Log out"');
    expect(homepage).toContain(
      'return user?.display_name?.trim() || "Memova account";'
    );
    expect(homepage).not.toContain('h("small", null, authUser.email)');
    expect(homepage).not.toContain("authUser.email || homepageAccountLabel");
    expect(homepage).not.toContain('user?.email?.split("@")[0]');
    expect(appDownloadControl).toBeGreaterThan(-1);
    expect(accountControl).toBeGreaterThan(appDownloadControl);
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
      "personal-manual-discovery-stack.css?v=20260901-chapter2-preview-ratio1"
    );
    expect(captureScript).toContain("Neil’s Personal Manual");
    expect(captureScript).toContain("Understand Your Work Type");
    expect(captureScript).toContain('data-learning-target="types"');
    expect(captureScript).not.toContain('class="agent-learning-switcher"');
    expect(captureScript).toContain("CLICK TO VIEW ↗");
    const discoveryStyles = fs.readFileSync(
      path.join(publicDir, "personal-manual-discovery-stack.css"),
      "utf8"
    );
    expect(discoveryStyles).not.toContain(".agent-learning-switcher");
    expect(discoveryStyles).toContain(
      "linear-gradient(135deg, #3d568f 0%, #5570ac 100%)"
    );
    expect(discoveryStyles).toContain(
      "linear-gradient(135deg, #f7c94f 0%, #edab32 100%)"
    );
    expect(discoveryStyles).toContain("transition-duration: 380ms !important;");
    expect(captureScript).toContain(
      'class="agent-manual-browser__viewport agent-learning-browser__viewport--neil"'
    );
    expect(discoveryStyles).toContain(
      ".agent-learning-browser__viewport--neil iframe"
    );
    expect(discoveryStyles).toContain("width: 200%;");
    expect(discoveryStyles).toContain("transform: scale(.5);");
    expect(discoveryStyles).toContain("width: 145%;");
    expect(discoveryStyles).toContain("transform: scale(.69);");
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
      "capture-personal-manual-integration.js?v=20260902-desktop-guide2"
    );
    expect(homepage).toContain(
      "capture-personal-manual-integration.css?v=20260902-desktop-guide2"
    );
    expect(homepage).toContain(
      "scatter-relations.js?v=20260828-observer-root1"
    );
    expect(scatterScript).toContain(
      "const observationRoot = document.body || document.documentElement;"
    );
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
        new RegExp(
          `<article class="axis-card"><h3>${axis}</h3>[\\s\\S]*?</article>`
        )
      )?.[0];
      expect(block, `${axis} axis`).toBeTruthy();
      expect(
        block?.match(/class="user-pole"/g),
        `${axis} selected pole`
      ).toHaveLength(1);
      expect(block, `${axis} selected label`).toMatch(
        new RegExp(
          `class="user-pole"[\\s\\S]*?class="axis-subtitle">${label}</span>`
        )
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
    expect(neilManual).not.toContain(
      'name="robots" content="noindex,nofollow"'
    );
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
    expect(captureScript).toContain(
      "After Prompt 01, restart Codex. Then run Prompt 02."
    );
    expect(captureScript).toContain("CHATGPT · CLAUDE · CURSOR · DESKTOP");
    expect(captureScript).toContain("ChatGPT works here too.");
    expect(captureScript).toContain("Start in your AI client’s desktop app.");
    expect(captureScript).not.toContain("THE GUIDE · DESKTOP APP REQUIRED");
    expect(captureScript).not.toContain("A friendly heads-up:");
    expect(captureScript).not.toContain("other agents</span>");
    expect(captureScript).toContain(
      "/personal-manual/work-types/assets/dogs/12_引导者_The_Guide.png"
    );
    expect(captureStyles).toContain(".agent-desktop-app-notice");
    expect(captureStyles).toContain(
      'grid-template-areas:\n    "eyebrow eyebrow"\n    "title description"'
    );
    expect(captureStyles).toContain("min-height: 315px;");
    expect(captureStyles).toContain("font-size: 8.8px;");
    expect(captureStyles).toContain(
      "transition: transform 620ms cubic-bezier(.16, 1, .3, 1);"
    );
    expect(captureStyles).toContain("overflow-y: auto;");
    expect(captureStyles).toContain(
      "grid-template-rows: minmax(min-content, 1.25fr) minmax(min-content, .75fr);"
    );
    expect(captureStyles).toContain(
      "grid-template-rows: minmax(min-content, 1.55fr) auto minmax(min-content, .65fr);"
    );
    expect(captureStyles).toContain("max-height: max(560px, 76vh);");
    expect(captureStyles).toContain("@keyframes agent-client-back-content-in");
    expect(captureStyles).toContain("transition-duration: 460ms !important;");
    expect(captureStyles).toContain(
      ".agent-generated-browser__viewport iframe {\n  width: 200%;\n  height: 200%;\n  transform: scale(.5);"
    );
    expect(captureStyles).toContain(
      ".agent-generated-browser {\n  top: 1.5%;\n  right: 1%;\n  width: 96%;\n  height: 80%;"
    );
    expect(captureStyles).toContain(
      ".agent-generated-browser__viewport iframe { width: 100%; height: 100%; transform: none; }"
    );
    expect(captureScript).toContain(
      "userNickname: session.user.display_name?.trim()"
    );
    expect(captureScript).toContain("function flowAccountLabel(flow)");
    expect(captureScript).not.toContain("manualFlow.userEmail");
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
    expect(captureScript).toContain(
      'const SETUP_STORAGE_KEY = "memova_personal_manual_setup_v1"'
    );
    expect(captureScript).toContain(
      'renderCapture(section, { state: "audience", flow, session, activeClient: flow.clientType })'
    );
    expect(captureScript).toContain("NO SIGN-IN YET");
    expect(captureScript).toContain("No sign-in yet. Instruction 1 will guide you.");
    expect(captureScript).toContain("ensureAuthenticatedFlow(manualFlow, session)");
    expect(captureScript).not.toContain("renderAuthRequired");
    expect(captureScript).not.toContain("Sign in before you create.");
    expect(captureScript).toContain(
      'section.querySelectorAll("[data-reset-manual]").forEach'
    );
    const clientChoiceHandler = captureScript.slice(
      captureScript.indexOf('section.querySelectorAll("[data-client-type]")'),
      captureScript.indexOf('section.querySelectorAll("[data-flip-back]")')
    );
    expect(clientChoiceHandler).toContain(
      'card.classList.toggle("is-flipped", active)'
    );
    expect(clientChoiceHandler).toContain("manualFlow.clientType = clientType");
    expect(clientChoiceHandler).not.toContain("createRemoteJob");
    expect(clientChoiceHandler).not.toContain('state: "handoff"');
    expect(captureScript).toContain(
      'const AUTH_STORAGE_KEY = "memova.auth.v1"'
    );
    expect(captureScript).toContain("/v1/personal-manual/current");
    expect(captureScript).toContain("/overview/preview");
    expect(captureScript).toContain("function snapshot(manual)");
    expect(captureScript).toContain("function isNewResult(baseline, current)");
    expect(captureScript).toContain(
      "current.latest_note_version_id !== baseline.versionId"
    );
    expect(captureScript).toContain('cache: "no-store"');
    expect(captureScript).toContain(
      'document.addEventListener("visibilitychange"'
    );
    expect(captureScript).toContain("const POLL_TIMEOUT_MS = 15 * 60_000");
    expect(captureScript).toContain('error.message === "RATE_LIMITED"');
    expect(captureScript).toContain('error.message === "AUTH_REQUIRED"');
    expect(captureScript).toContain(
      "window.localStorage.removeItem(AUTH_STORAGE_KEY)"
    );
    expect(captureScript).toContain('data-pause-manual>Pause checking');
    expect(captureScript).toContain('data-reset-manual>Exit setup');
    expect(captureScript).toContain("You do not need to wait on this website.");
    expect(captureScript).toContain("No need to wait here.");
    expect(captureScript).toContain("Download the app");
    expect(captureScript).toContain("appear automatically in Notes");
    expect(captureScript).toContain('data-app-download-placeholder="true"');
    expect(captureScript).not.toContain("Keep this page open.");
    expect(captureStyles).toContain(".agent-wait-app-card");
    expect(captureStyles).toContain("pointer-events: none;");
    const progressActionsStart = captureScript.indexOf(
      'if (["progress", "timeout"].includes(state))'
    );
    const progressActions = captureScript.slice(
      progressActionsStart,
      captureScript.indexOf('if (state === "result")', progressActionsStart)
    );
    expect(progressActions).toContain('class="agent-wait-app-card"');
    expect(progressActions).not.toContain("href=");
    expect(progressActions).not.toContain("<button");
    expect(captureScript).toContain("Open the app.<br>Find it in<br>Notes.");
    expect(captureScript).toContain("Your Personal Manual is ready in Notes.");
    expect(captureScript).toContain('class="agent-result-app-location"');
    expect(captureScript).toContain("SAVED IN NOTES");
    expect(captureScript).not.toContain("Open full Manual");
    expect(captureScript).not.toContain("Download Personal Manual HTML");
    expect(captureScript).not.toContain("data-download-result");
    expect(captureScript).not.toContain("manualPublicUrl");
    expect(captureScript).not.toContain("manualFlow.publicUrl");
    expect(captureScript).toContain("function clearManualStateFromUrl()");
    expect(captureScript).toContain("function pauseProgressOnPageExit()");
    expect(captureScript).toContain('manualFlow.pauseReason = "page-exit"');
    expect(captureScript).toContain(
      'window.addEventListener("pagehide", pauseProgressOnPageExit)'
    );
    expect(captureStyles).toContain(".agent-progress-controls");
    expect(captureScript).not.toContain("/api/personal-manual/jobs");
    expect(captureScript).not.toContain("createRemoteJob");
    expect(captureScript).not.toContain("fetchRemoteJob");
    expect(captureScript).not.toContain("When the complete HTML is ready");
    expect(captureScript).not.toContain("POST only that HTML");
    expect(captureScript).not.toContain("complete self-contained HTML file");
    expect(captureScript).toContain('srcdoc="${escapeHtml(previewHtml)}"');
    expect(captureScript).toContain("secureManualHtml(manualFlow.resultHtml)");
    expect(captureScript).toContain("script-src 'none'");
    const generatedResult = captureScript.slice(
      captureScript.indexOf("function renderGeneratedResult("),
      captureScript.indexOf("function copyForState(")
    );
    expect(generatedResult).toContain('sandbox=""');
    expect(generatedResult).not.toContain("allow-downloads");
    expect(captureScript).not.toContain("RESULT_URL");
    expect(captureScript).not.toContain("generated-conductor");
    expect(captureScript).not.toContain("5 Codex conversations found");
  });
});
