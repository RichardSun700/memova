import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AgentMemory from "./AgentMemory";
import HowItWorks from "./HowItWorks";
import IOS from "./IOS";
import Home from "./Home";
import { UseCaseDetailPage, useCaseDetails } from "./UseCaseDetail";
import HeroSection from "@/components/sections/HeroSection";
import CTASection from "@/components/sections/CTASection";
import { AuthProvider } from "@/contexts/AuthContext";
import { privacyPolicyPaths } from "@/App";
import {
  isNarrationBeatCurrent,
  settleNarrationPlayback,
} from "@/components/demo-story/ContinuousDemoStory";

function render(component: React.ReactElement) {
  return renderToStaticMarkup(component);
}

function findDivsByClass(html: string, className: string) {
  const matches: string[] = [];
  const stack: Array<{ start: number; isMatch: boolean }> = [];
  const divPattern = /<\/?div\b[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = divPattern.exec(html)) !== null) {
    const tag = match[0];
    const index = match.index;

    if (tag.startsWith("</")) {
      const opening = stack.pop();
      if (opening?.isMatch) {
        matches.push(html.slice(opening.start, index + tag.length));
      }
      continue;
    }

    const classes = tag.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];
    stack.push({ start: index, isMatch: classes.includes(className) });
  }

  return matches;
}

describe("US iOS acquisition pages", () => {
  it("keeps both public privacy policy URLs mapped to the legal page", () => {
    expect(privacyPolicyPaths).toEqual(["/privacy", "/privacy-policy"]);
  });

  it("composes the official homepage around the complete product journey", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    expect(html).toContain("Your everyday context");
    expect(html).toContain(
      "See how everyday context becomes reusable knowledge"
    );
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("/demo/index.html?embed=1");
    const storyChapters = [
      "knowledge-base",
      "note",
      "book",
      "output-share",
      "alignment",
      "end",
    ];
    storyChapters.forEach(chapter => {
      expect(html).toContain(`data-story-chapter="${chapter}"`);
    });
    const chapterPositions = storyChapters.map(chapter =>
      html.indexOf(`data-story-chapter="${chapter}"`)
    );
    expect(chapterPositions).toEqual(
      [...chapterPositions].sort((a, b) => a - b)
    );
    expect(html).not.toContain("Previous chapter");
    expect(html).not.toContain("Next chapter");
    expect(html).toContain("Page enters Book");
    expect(html).toContain("Pages form a Book");
    expect(html).toContain("Reveal provenance");
    expect(html).toContain("Ask Memova");
    expect(html).toContain("Real use cases");
    expect(html).toContain("Private. Local.");
    expect(html).toContain("Start with Memova on iPhone");
    expect(html).not.toContain("fixed inset-0");
  });

  it("scopes the Demo-aligned marketing palette away from product-story media", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const themeStyles = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/styles/marketing-theme.css"),
      "utf8"
    );

    expect(html).toContain("memova-home-theme");
    expect(html).toContain("memova-site-hero");
    expect(html).toContain("memova-site-use-cases");
    expect(html).toContain("memova-site-privacy");
    expect(html).toContain("memova-site-cta");
    expect(themeStyles).toContain("--home-gradient");
    expect(themeStyles).toContain(".memova-home-theme .memova-primary-action");
    expect(themeStyles).not.toMatch(/(^|\n)\s*:root\b/);
    expect(themeStyles).not.toContain(".demo-story-shell video");
    expect(themeStyles).not.toContain("touch-action");
    expect(themeStyles).not.toContain("pointer-events");
  });

  it("keeps the legacy hero and its conversion contract available for later reuse", () => {
    const html = render(<HeroSection onSeeWorkflow={() => undefined} />);

    expect(html).toContain("Your everyday context");
    expect(html).toContain("ready for agents");
    expect(html).toContain("Join iOS Early Access");
    expect(html).toContain('data-analytics-event="ios_early_access_click"');
    expect(html).toContain("See the workflow");
    expect(html).not.toContain("Open product tour");
    expect(html).not.toContain('href="/demo/index.html"');
    expect(html).not.toContain('data-analytics-event="investor_demo_click"');
    expect(html).toContain("You choose what to capture");
    expect(html).toContain(
      'aria-label="Show source links for the CRDT action"'
    );
    expect(html).toContain(
      'aria-label="Show source links for the survey action"'
    );
    expect(html).not.toContain("Your personal");
  });

  it("keeps homepage recordings readable, clickable, and compatible with natural page scroll", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const storySource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/ContinuousDemoStory.tsx"
      ),
      "utf8"
    );
    const continuousStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/continuous-overrides.css"
      ),
      "utf8"
    );
    const baseStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/demo-base.css"
      ),
      "utf8"
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Play Note Workflow recording"');
    expect(html).toContain('class="recording-play-control"');
    expect(html).toContain("<video");
    expect(html).toContain('preload="none"');
    expect(storySource).toContain("if (continuous) {");
    expect(storySource).toContain('"var(--recording-readable-height)"');
    expect(storySource).toContain('column.dataset.recordingOverlay = "false"');
    expect(storySource).toContain(
      'column.dataset.recordingFullscreen = "false"'
    );
    expect(storySource).toContain("onClick={src ? toggleVideo : undefined}");
    expect(storySource).toContain("await video.play()");
    expect(storySource).toContain("video.pause()");
    expect(storySource).not.toContain("onWheel=");
    expect(storySource).not.toContain('addEventListener("wheel"');
    expect(storySource).toContain("function useNearViewport");
    expect(storySource).toContain('preload="none"');
    expect(storySource).not.toContain("autoPlay");
    expect(storySource).toContain('inert={stage !== "video"}');
    expect(storySource).toContain('inert={stage !== "case"}');
    expect(storySource).not.toContain(
      '<button type="button">Share link</button>'
    );
    expect(storySource).not.toContain('<button type="button">Edit</button>');
    expect(continuousStyles).toContain(
      "--recording-readable-height: clamp(500px, 66svh, 660px)"
    );
    expect(continuousStyles).toContain(
      "--recording-readable-height: clamp(420px, 61svh, 530px)"
    );
    expect(continuousStyles).toContain("position: relative");
    expect(baseStyles).toContain("touch-action: pan-y pinch-zoom");
    expect(baseStyles).toContain("pointer-events: none");
  });

  it("presents every walkthrough page with the same prominent audio-guide control", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const storySource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/ContinuousDemoStory.tsx"
      ),
      "utf8"
    );
    const continuousStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/continuous-overrides.css"
      ),
      "utf8"
    );
    const narrationRoot = path.resolve(
      process.cwd(),
      "client/public/demo/audio/pages"
    );
    const narrationSegments = [
      {
        id: "01-everyday-context",
        title: "Everyday Context",
        file: "01-everyday-context.m4a",
      },
      {
        id: "01-personal-llm-wiki",
        title: "Personal LLM Wiki",
        file: "01-personal-llm-wiki.m4a",
      },
      {
        id: "01-knowledge-base-ui",
        title: "Knowledge Base Setup",
        file: "01-knowledge-base-ui.m4a",
      },
      {
        id: "01-apollo-case",
        title: "Apollo 11 Case",
        file: "01-apollo-case.m4a",
      },
      {
        id: "02-note-workflow",
        title: "Note Workflow",
        file: "02-note-workflow.m4a",
      },
      {
        id: "02-complete-note",
        title: "The Complete Note",
        file: "02-complete-note.m4a",
      },
      {
        id: "03-project-ingest",
        title: "Sources Into a Book",
        file: "03-project-ingest.m4a",
      },
      {
        id: "03-project-book-ui",
        title: "Project Book Generation",
        file: "03-project-book-ui.m4a",
      },
      {
        id: "04-platform-results",
        title: "Platform Results",
        file: "04-platform-results.m4a",
      },
      {
        id: "04-standalone-note-sharing",
        title: "Standalone Note Sharing",
        file: "04-standalone-note-sharing.m4a",
      },
      {
        id: "04-project-html-sharing",
        title: "Project HTML Sharing",
        file: "04-project-html-sharing.m4a",
      },
      {
        id: "05-context-return",
        title: "Context Return",
        file: "05-context-return.m4a",
      },
      {
        id: "05-ask-memova",
        title: "Ask Memova",
        file: "05-ask-memova.m4a",
      },
      {
        id: "06-end",
        title: "End",
        file: "06-end.m4a",
      },
    ];
    const renderedNarrationIds = [
      "01-everyday-context",
      "02-note-workflow",
      "02-complete-note",
      "03-project-ingest",
      "03-project-book-ui",
      "04-platform-results",
      "04-standalone-note-sharing",
      "04-project-html-sharing",
      "05-context-return",
      "05-ask-memova",
      "06-end",
    ];
    const renderedControlIds = Array.from(
      html.matchAll(/data-narration-control="([^"]+)"/g),
      match => match[1]
    );
    const pageNarrationAnchors = findDivsByClass(html, "page-narration-anchor");
    const pageNarrationIds = pageNarrationAnchors.map(anchor => {
      const openingTag = anchor.match(/^<div\b[^>]*>/)?.[0] ?? "";
      const pageNarrationId =
        openingTag.match(/\bdata-page-narration="([^"]+)"/)?.[1] ?? "";
      const nestedControlIds = Array.from(
        anchor.matchAll(/data-narration-control="([^"]+)"/g),
        match => match[1]
      );

      expect(anchor.match(/data-narration-ui="audio-guide"/g)).toHaveLength(1);
      expect(nestedControlIds).toEqual([pageNarrationId]);
      return pageNarrationId;
    });
    const controlButtons =
      html.match(/<button[^>]*class="inline-narration-control[^"]*"[^>]*>/g) ??
      [];
    const renderedGuideLabels =
      html.match(/class="inline-narration-control__eyebrow">Audio guide</g) ??
      [];
    const renderedActionLabels =
      html.match(/class="inline-narration-control__label">Listen</g) ?? [];
    const renderedTitles = Array.from(
      html.matchAll(
        /class="inline-narration-control__title">([^<]+)<\/[^>]+>/g
      ),
      match => match[1]
    );
    const audioMarkup = html.match(/<audio[^>]*>/)?.[0] ?? "";

    // Chapter 01 swaps one control across four scroll stages, so eleven
    // controls render at once while all fourteen source mappings ship.
    expect(renderedControlIds).toEqual(renderedNarrationIds);
    expect(pageNarrationAnchors).toHaveLength(11);
    expect(pageNarrationIds).toEqual(renderedNarrationIds);
    expect(new Set(renderedControlIds).size).toBe(renderedNarrationIds.length);
    expect(html.match(/data-narration-ui="audio-guide"/g)).toHaveLength(11);
    expect(controlButtons).toHaveLength(11);
    expect(renderedGuideLabels).toHaveLength(11);
    expect(renderedActionLabels).toHaveLength(11);
    expect(renderedTitles).toEqual([
      "Everyday Context",
      "Note Workflow",
      "The Complete Note",
      "Sources Into a Book",
      "Project Book Generation",
      "Platform Results",
      "Standalone Note Sharing",
      "Project HTML Sharing",
      "Context Return",
      "Ask Memova",
      "End",
    ]);
    controlButtons.forEach(button => {
      expect(button).toContain('type="button"');
      expect(button).toContain('data-state="idle"');
      expect(button).toContain('aria-label="Listen:');
      expect(button).toContain('aria-pressed="false"');
    });
    expect(
      html.match(
        /class="inline-narration-control__progress" aria-label="[^"]+ narration progress"/g
      )
    ).toHaveLength(11);
    expect(html.match(/<audio/g)).toHaveLength(1);
    expect(audioMarkup).toContain('preload="none"');
    expect(audioMarkup).not.toContain("autoplay");
    narrationSegments.forEach(({ id, title, file }) => {
      expect(fs.existsSync(path.join(narrationRoot, file))).toBe(true);
      expect(storySource).toContain(`id: "${id}"`);
      expect(storySource).toContain(`title: "${title}"`);
      expect(storySource).toContain(`/demo/audio/pages/${file}`);
    });
    expect(storySource).toContain("await settleNarrationPlayback");
    expect(storySource).toContain("await media.play()");
    expect(storySource).toContain("audio.pause()");
    expect(storySource).toContain("new IntersectionObserver");
    expect(storySource).toContain('"visibilitychange"');
    expect(storySource).toContain('"pagehide"');
    expect(storySource).toContain("narrationRequestEpochRef");
    expect(storySource).not.toContain("narrationTime / window.scrollY");
    expect(storySource.match(/<InlineNarrationControl\b/g)).toHaveLength(1);
    expect(html).not.toContain("recording-narration-anchor");
    expect(storySource).not.toContain("recording-narration-anchor");
    expect(continuousStyles).not.toContain("recording-narration-anchor");
    expect(html).not.toContain("chapter-narration-strip");
    expect(continuousStyles).toContain(".inline-narration-control");
    expect(continuousStyles).toContain(".page-narration-anchor");
    expect(continuousStyles).toContain(".inline-narration-control__progress");
    expect(continuousStyles).toMatch(
      /\.narration-slot\s*\{[^}]*pointer-events:\s*auto/
    );
    expect(continuousStyles).toContain(
      "@media (prefers-reduced-motion: reduce)"
    );
  });

  it("ignores a stale play promise during a rapid narration switch", async () => {
    let resolveFirst!: () => void;
    let resolveSecond!: () => void;
    let activeRequest = "first";
    const firstPlaying = vi.fn();
    const secondPlaying = vi.fn();
    const firstCancelled = vi.fn();
    const firstFailed = vi.fn();
    const secondFailed = vi.fn();

    const firstAttempt = settleNarrationPlayback({
      media: {
        play: () =>
          new Promise<void>(resolve => {
            resolveFirst = resolve;
          }),
      },
      isCurrent: () => activeRequest === "first",
      onPlaying: firstPlaying,
      onFailure: firstFailed,
      onCancelled: firstCancelled,
    });

    activeRequest = "second";
    const secondAttempt = settleNarrationPlayback({
      media: {
        play: () =>
          new Promise<void>(resolve => {
            resolveSecond = resolve;
          }),
      },
      isCurrent: () => activeRequest === "second",
      onPlaying: secondPlaying,
      onFailure: secondFailed,
    });

    resolveFirst();
    await firstAttempt;
    expect(firstPlaying).not.toHaveBeenCalled();
    expect(firstCancelled).toHaveBeenCalledOnce();
    expect(firstFailed).not.toHaveBeenCalled();

    resolveSecond();
    await secondAttempt;
    expect(secondPlaying).toHaveBeenCalledOnce();
    expect(secondFailed).not.toHaveBeenCalled();
  });

  it("uses the middle viewport band to pause narration after its page leaves", () => {
    expect(isNarrationBeatCurrent({ top: 799, bottom: 900 }, 1000)).toBe(true);
    expect(isNarrationBeatCurrent({ top: -100, bottom: 201 }, 1000)).toBe(true);
    expect(isNarrationBeatCurrent({ top: 800, bottom: 900 }, 1000)).toBe(false);
    expect(isNarrationBeatCurrent({ top: -200, bottom: 200 }, 1000)).toBe(
      false
    );
  });

  it("keeps every Chapter 04 social logo in continuous, reduced-motion-safe movement", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const baseStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/demo-base.css"
      ),
      "utf8"
    );

    expect(html.match(/data-social-logo=/g)).toHaveLength(14);
    expect(html.match(/data-platform-logo=/g)).toHaveLength(3);
    expect(baseStyles).toContain("@keyframes social-logo-orbit");
    expect(baseStyles).toContain("@keyframes social-logo-glyph");
    expect(baseStyles).toContain("@keyframes social-logo-halo");
    expect(baseStyles).toContain("@keyframes platform-logo-breathe");
    expect(baseStyles).not.toContain("@keyframes social-logo-drift");
    expect(baseStyles).toContain(".social-logo-field > span:nth-child(even)");
    expect(baseStyles).toContain(".social-logo-field > span::before");
    expect(baseStyles).toContain(".social-distribution-stage:hover");
    expect(baseStyles).toContain(".platform-brand-mark {");
    expect(baseStyles).toContain(".social-logo-field > span::before,");
    expect(baseStyles).toContain("will-change: auto;");
  });

  it("ships the complete product journey as a private static source", () => {
    const demoRoot = path.resolve(process.cwd(), "client/public/demo");
    const demoIndex = fs.readFileSync(
      path.join(demoRoot, "index.html"),
      "utf8"
    );

    expect(demoIndex).toContain(
      "<title>Memova · Context That Compounds</title>"
    );
    expect(demoIndex).toContain('name="robots" content="noindex, nofollow"');
    expect(demoIndex).toContain('children: "Memova"');
    expect(demoIndex).toContain('children: "Product Journey"');
    expect(demoIndex).not.toContain("YC Demo");
    expect(demoIndex).not.toContain("Investor Demo");
    expect(demoIndex).not.toContain("Demo Index");
    expect(demoIndex).toContain("window.self === window.top");
    expect(demoIndex).toContain(
      'analyticsScript.src = "/analytics/ga4-consent.js"'
    );
    expect(
      fs.existsSync(
        path.join(demoRoot, "recordings/chapter-02-note-workflow-final.mp4")
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(demoRoot, "recordings/chapter-03-project-book-final.mp4")
      )
    ).toBe(true);
  });

  it("keeps the destination waitlist consistent with the iOS acquisition promise", () => {
    const html = render(<CTASection />);

    expect(html).toContain("Start with Memova on iPhone");
    expect(html).toContain("Join iOS Early Access");
    expect(html).toContain('data-analytics-event="ios_early_access_click"');
    expect(html).toContain("You choose what to capture");
    expect(html).not.toContain("Build your workflow OS");
  });

  it("repositions every waitlist hash navigation on the email field after layout settles", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );

    expect(source).toContain('const WAITLIST_HASH = "#waitlist"');
    expect(source).toContain('document.getElementById("early-access-email")');
    expect(source).toContain(
      'window.addEventListener("hashchange", scheduleWaitlistScroll)'
    );
    expect(source).toContain(
      'window.addEventListener("load", scheduleWaitlistScroll)'
    );
    expect(source).toContain('block: "center"');
    expect(source).toContain("WAITLIST_SCROLL_DELAYS");
    expect(source).toContain("stopWaitlistSettlingForUserIntent");
    expect(source).toContain(
      'window.addEventListener("wheel", stopWaitlistSettlingForUserIntent'
    );
    expect(source).toContain(
      'window.addEventListener("touchstart", stopWaitlistSettlingForUserIntent'
    );
  });

  it("tracks waitlist success only after a successful API response", () => {
    const source = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/sections/CTASection.tsx"
      ),
      "utf8"
    );
    const responseGuard = source.indexOf("if (!response.ok");
    const successEvent = source.indexOf(
      'trackAnalyticsEvent("waitlist_submit_success"'
    );

    expect(responseGuard).toBeGreaterThan(-1);
    expect(source).toContain("result?.ok !== true");
    expect(successEvent).toBeGreaterThan(responseGuard);
  });

  it("routes waitlist submissions to the production Worker in local and self-hosted previews", () => {
    const viteConfig = fs.readFileSync(
      path.resolve(process.cwd(), "vite.config.ts"),
      "utf8"
    );
    const serverSource = fs.readFileSync(
      path.resolve(process.cwd(), "server/index.ts"),
      "utf8"
    );

    expect(viteConfig).toContain('"/api/waitlist": waitlistApiProxy');
    expect(viteConfig).toContain(
      'process.env.WAITLIST_API_ORIGIN || "https://memova.ai"'
    );
    expect(serverSource).toContain('app.post(\n    "/api/waitlist"');
    expect(serverSource).toContain("await fetch(waitlistApiUrl");
    expect(serverSource).toContain("AbortSignal.timeout(10_000)");
    expect(serverSource).toContain('error: "waitlist_unavailable"');
  });

  it("mounts SPA page tracking after route metadata", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/App.tsx"),
      "utf8"
    );

    expect(source).toContain("<AnalyticsTracker />");
    expect(source.indexOf("<SiteMetadata />")).toBeLessThan(
      source.indexOf("<AnalyticsTracker />")
    );
  });

  it("removes the legacy optional analytics loader to prevent duplicate measurement", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/main.tsx"),
      "utf8"
    );

    expect(source).not.toContain("VITE_ANALYTICS_ENDPOINT");
    expect(source).not.toContain("VITE_ANALYTICS_WEBSITE_ID");
  });

  it("discloses Google Analytics collection and withdrawal controls", () => {
    const policy = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/content/privacy-policy.md"),
      "utf8"
    );

    expect(policy).toContain("### Website Analytics and Cookies");
    expect(policy).toContain("Google Analytics 4");
    expect(policy).toContain("G\\-9YJQ994J98");
    expect(policy).toContain("Privacy choices");
    expect(policy).toContain("withdraw");
  });

  it.each([
    ["iOS", <IOS />, "Memova for iPhone"],
    ["agent memory", <AgentMemory />, "Agent memory"],
    ["how it works", <HowItWorks />, "From everyday context"],
  ])(
    "renders the %s page with a clear H1, user control, and iOS CTA",
    (_name, page, heading) => {
      const html = render(page);

      expect(html).toContain(`<h1`);
      expect(html).toContain(heading);
      expect(html).toContain("You choose what to capture");
      expect(html).toContain("Join iOS Early Access");
    }
  );

  it("defines three crawlable use-case stories with the complete transformation", () => {
    expect(useCaseDetails).toHaveLength(3);

    for (const detail of useCaseDetails) {
      const html = render(<UseCaseDetailPage slug={detail.slug} />);
      expect(html).toContain(detail.title);
      expect(html).toContain("Everyday context");
      expect(html).toContain("Agent memory");
      expect(html).toContain("Workflow outcome");
      expect(html).toContain("Review and approve");
      expect(html).toContain("Join iOS Early Access");
    }
  });
});
