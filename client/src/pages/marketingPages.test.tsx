import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AgentMemory from "./AgentMemory";
import HowItWorks from "./HowItWorks";
import IOS from "./IOS";
import Home from "./Home";
import Mcp from "./Mcp";
import { UseCaseDetailPage, useCaseDetails } from "./UseCaseDetail";
import HeroSection from "@/components/sections/HeroSection";
import CTASection from "@/components/sections/CTASection";
import { AuthProvider } from "@/contexts/AuthContext";
import { privacyPolicyPaths } from "@/App";
import {
  FOUNDER_GUIDE_CHAPTERS,
  findFounderGuideChapterAtAnchor,
  scrollToStoryChapter,
  settleFounderGuidePlayback,
} from "@/components/demo-story/ContinuousDemoStory";

function render(component: React.ReactElement) {
  return renderToStaticMarkup(component);
}

describe("US iOS acquisition pages", () => {
  it("presents MCP as a human-readable connection guide without linking people into the transport endpoint", () => {
    const html = render(
      <AuthProvider>
        <Mcp />
      </AuthProvider>
    );

    expect(html).toContain("Connect Memova to Codex and MCP clients.");
    expect(html).toContain("Connection model");
    expect(html).toContain("Machine endpoint · Streamable HTTP");
    expect(html).toContain("not a browser page");
    expect(html).toContain("Plain transport text at this URL is expected");
    expect(html).toContain("https://api.memova.ai/mcp");
    expect(html).not.toContain('href="https://api.memova.ai/mcp"');
  });

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
    expect(html).toContain("Scattered in. Shareable out.");
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

  it("adds the App Store-inspired architecture bridges without changing the six chapters", () => {
    const html = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const bridgeStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/demo-story/story-architecture-bridges.css"
      ),
      "utf8"
    );

    expect(html.match(/data-architecture-step=/g)).toHaveLength(3);
    expect(html).toContain('data-architecture-step="Sources"');
    expect(html).toContain('data-architecture-step="Book"');
    expect(html).toContain('data-architecture-step="Pages"');

    expect(html).toContain('data-story-narrative="markdown-to-html"');
    expect(html).toContain("private, editable source stays in Markdown");
    expect(html).toContain("source-linked HTML Page");
    expect(html).toContain("Your work, already a webpage.");
    expect(html).toContain(
      "The format changes. The source connection does not."
    );

    expect(html).toContain('data-story-narrative="controlled-sharing"');
    expect(html.match(/data-share-safety-step=/g)).toHaveLength(4);
    ["Private", "Auto-remove", "Review", "Publish"].forEach(step => {
      expect(html).toContain(`data-share-safety-step="${step}"`);
    });
    expect(html).toContain("Auto-remove sensitive details");
    expect(html).toContain("One Book. Three polished pages.");
    expect(html).toContain("One Page. Three native voices.");

    expect(html.match(/data-story-chapter=/g)).toHaveLength(6);
    expect(bridgeStyles).not.toContain("position: sticky");
    expect(bridgeStyles).not.toContain("100svh");
    expect(bridgeStyles).toContain("prefers-reduced-motion: reduce");
  });

  it("restores the Product Journey book spine on desktop without changing the mobile story", () => {
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
    const sidebar =
      html.match(
        /<aside\b[^>]*data-product-journey="sidebar"[^>]*>[\s\S]*?<\/aside>/
      )?.[0] ?? "";
    const expectedChapters = [
      ["knowledge-base", "01", "Knowledge Base"],
      ["note", "02", "Note"],
      ["book", "03", "Book"],
      ["output-share", "04", "Output &amp; Share"],
      ["alignment", "05", "Context Return"],
      ["end", "06", "End"],
    ] as const;

    expect(sidebar).not.toBe("");
    expect(sidebar).toContain('aria-label="Book chapter index"');
    expect(sidebar).toContain("Product Journey");
    expect(sidebar.match(/data-product-journey-chapter=/g)).toHaveLength(6);
    expect(sidebar.match(/aria-current="step"/g)).toHaveLength(1);

    expectedChapters.forEach(([id, number, title]) => {
      expect(sidebar).toContain(`data-product-journey-chapter="${id}"`);
      expect(sidebar).toContain(`aria-controls="story-chapter-${id}"`);
      expect(sidebar).toContain(`>${number}</span>`);
      expect(sidebar).toContain(`>${title}</strong>`);
      expect(html).toContain(`id="story-chapter-${id}"`);
    });

    expect(continuousStyles).toContain(
      ".framework-shell--continuous .page-spine,"
    );
    expect(continuousStyles).toContain("display: none !important;");
    expect(continuousStyles).toContain("@media (min-width: 1180px)");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.page-spine--continuous\s*\{[\s\S]*?display: flex !important;/
    );

    const spineStart = storySource.indexOf("function DesktopBookSpine");
    const spineEnd = storySource.indexOf("function FounderGuideRail", spineStart);
    const spineSource = storySource.slice(spineStart, spineEnd);
    expect(spineStart).toBeGreaterThan(-1);
    expect(spineSource.indexOf("if (!desktop) return undefined")).toBeLessThan(
      spineSource.indexOf('window.addEventListener("scroll"')
    );
    expect(spineSource).toContain(
      'window.addEventListener("scroll", scheduleUpdate, { passive: true })'
    );
    expect(spineSource).not.toContain('addEventListener("touchmove"');
    expect(spineSource).not.toContain('addEventListener("wheel"');
    expect(spineSource).not.toContain("window.scrollTo");
  });

  it("scrolls a Product Journey spine selection to its matching chapter", () => {
    const scrollIntoView = vi.fn();
    const querySelector = vi.fn(() => ({ scrollIntoView }));
    vi.stubGlobal("document", { querySelector });

    try {
      scrollToStoryChapter("book");
      expect(querySelector).toHaveBeenCalledWith('[data-story-chapter="book"]');
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "instant",
        block: "start",
      });
    } finally {
      vi.unstubAllGlobals();
    }
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
    expect(storySource).toContain("const SCROLL_PROGRESS_DEADBAND_PX = 3");
    expect(storySource).toContain("readDocumentScrollTop");
    expect(storySource).toContain(
      "Height-only changes are browser chrome, not story input."
    );
    expect(storySource).toContain(
      'window.visualViewport?.addEventListener("resize", handleResize)'
    );
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
    expect(continuousStyles).toContain("contain: layout paint");
    expect(continuousStyles).toContain(
      ".framework-shell--continuous .kb-lunar-backdrop"
    );
    expect(continuousStyles).toContain("position: relative");
    expect(baseStyles).toContain("touch-action: pan-y pinch-zoom");
    expect(baseStyles).toContain("pointer-events: none");
  });

  it("keeps the single Chapter 01 story continuous and stable on phones", () => {
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
    const chapterStart = storySource.indexOf("function KnowledgeBaseChapter");
    const chapterEnd = storySource.indexOf(
      "function NoteChapter",
      chapterStart
    );
    const chapterSource = storySource.slice(chapterStart, chapterEnd);

    expect(chapterSource).toContain(
      "const progress = useProjectIngestProgress(sectionRef, reducedMotion, true)"
    );
    expect(chapterSource).toContain(
      "const mobileMotionLayout = useMediaQuery(MOBILE_STORY_QUERY)"
    );
    expect(chapterSource).toContain("const useTransformOnlyOrbit =");
    expect(chapterSource).toContain('CSS.supports("width", "1cqw")');
    expect(chapterSource).toContain('CSS.supports("height", "1cqh")');
    expect(chapterSource).toContain(
      "translate3d(calc(${x}cqw - 50%), calc(${y}cqh - 50%), 0)"
    );
    expect(chapterSource).toContain("left: `${x}%`");
    expect(chapterSource).toContain("top: `${y}%`");
    expect(chapterSource).toContain(
      'className="kb-story-scroll scroll-driven-story scroll-driven-story--four"'
    );
    expect(chapterSource).toContain('data-testid="chapter-01-scroll-story"');
    expect(storySource).not.toContain("function MobileKnowledgeBaseChapter");
    expect(storySource).not.toContain("KNOWLEDGE_BASE_MOBILE_STEPS");
    expect(storySource).not.toContain(
      'data-testid="chapter-01-mobile-scroll-story"'
    );
    expect(storySource).not.toContain("useMobileDiscreteProgress");
    expect(storySource).not.toContain("useMobileStoryMagnet");
    expect(storySource).not.toContain("MOBILE_KNOWLEDGE_MAGNET_STOPS");
    expect(storySource).not.toContain("MOBILE_KNOWLEDGE_FORWARD_THRESHOLDS");
    expect(storySource).not.toContain("MOBILE_KNOWLEDGE_BACK_THRESHOLDS");
    expect(storySource).not.toContain("scrollend");
    expect(storySource).not.toContain("window.scrollTo");
    expect(storySource).not.toContain("data-mobile-discrete");
    expect(storySource).not.toContain('addEventListener("touchmove"');
    expect(storySource).not.toContain('addEventListener("wheel"');
    expect(continuousStyles).not.toContain("data-mobile-discrete");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.kb-story-scroll > \.kb-story-beat\s*\{[^}]*transform: translate3d\(0, 0, 0\);[^}]*will-change: transform;/
    );
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous\s+\.kb-story-scroll\s+:is\([^}]*\)\s*\{[^}]*transition: none;/
    );
    expect(continuousStyles).toContain("contain: layout paint");
    expect(continuousStyles).toContain("container-type: size");
    expect(continuousStyles).toContain("touch-action: pan-y pinch-zoom");
    expect(storySource).toContain("stabilizeTouchGeometry");
    expect(storySource).toContain(
      "window.matchMedia(TOUCH_INPUT_QUERY).matches"
    );
    expect(storySource).not.toContain(
      "Element.prototype.getBoundingClientRect"
    );
    expect(storySource).not.toContain("data-kb-transform-motion");
    expect(continuousStyles).not.toContain("touch-action: none");
  });

  it("keeps Chapter 03 project ingest continuous and stable on phones", () => {
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
    const projectStart = storySource.indexOf("function ProjectIngestBeat");
    const projectEnd = storySource.indexOf(
      "function KnowledgeFolderIcon",
      projectStart
    );
    const projectSource = storySource.slice(projectStart, projectEnd);

    expect(projectSource).toContain(
      "const progress = useProjectIngestProgress(sectionRef, reducedMotion)"
    );
    expect(projectSource).toContain(
      "const compact = narrowLayout || phoneLayout"
    );
    expect(projectSource).not.toContain('data-mobile-discrete="true"');
    expect(storySource).not.toContain("useMobileDiscreteProgress");
    expect(storySource).not.toContain("useMobileStoryMagnet");
    expect(storySource).not.toContain("MOBILE_PROJECT_INGEST_MAGNET_STOPS");
    expect(storySource).not.toContain(
      "MOBILE_PROJECT_INGEST_FORWARD_THRESHOLDS"
    );
    expect(storySource).not.toContain("MOBILE_PROJECT_INGEST_BACK_THRESHOLDS");
    expect(storySource).not.toContain("scrollend");
    expect(storySource).not.toContain("window.scrollTo");
    expect(storySource).not.toContain("data-mobile-discrete");
    expect(projectSource).not.toContain('addEventListener("touchmove"');
    expect(projectSource).not.toContain('addEventListener("wheel"');
    expect(continuousStyles).not.toContain("data-mobile-discrete");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.project-ingest-sticky\s*\{[^}]*transform: translate3d\(0, 0, 0\);[^}]*will-change: transform;/
    );
    expect(continuousStyles).toContain("contain: layout paint");
    expect(continuousStyles).toContain("will-change: auto");
    expect(continuousStyles).toContain("width: min(92%, 430px)");
    expect(continuousStyles).toContain("bottom: 76px");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous\s+\.project-ingest-beat\s+:is\([^}]*\)\s*\{[^}]*transition: none;/
    );
  });

  it("maps one six-chapter Founder Guide rail to the six product-story chapters", () => {
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
    const guideRoot = path.resolve(process.cwd(), "client/public");
    const expectedChapters = [
      {
        id: "knowledge-base",
        number: "01",
        title: "Collect & Understand",
        src: "/demo/founder-guide/chapter-01.mp4",
      },
      {
        id: "note",
        number: "02",
        title: "Act",
        src: "/demo/founder-guide/chapter-02.mp4",
      },
      {
        id: "book",
        number: "03",
        title: "Connect",
        src: "/demo/founder-guide/chapter-03.mp4",
      },
      {
        id: "output-share",
        number: "04",
        title: "Express",
        src: "/demo/founder-guide/chapter-04.mp4",
      },
      {
        id: "alignment",
        number: "05",
        title: "Context Return",
        src: "/demo/founder-guide/chapter-05.mp4",
      },
      {
        id: "end",
        number: "06",
        title: "Compound",
        src: "/demo/founder-guide/chapter-06.mp4",
      },
    ];
    const renderedChapterIds = Array.from(
      html.matchAll(/data-story-chapter="([^"]+)"/g),
      match => match[1]
    );

    expect(FOUNDER_GUIDE_CHAPTERS).toHaveLength(6);
    expect(
      FOUNDER_GUIDE_CHAPTERS.map(({ id, number, title, src }) => ({
        id,
        number,
        title,
        src,
      }))
    ).toEqual(expectedChapters);
    expect(renderedChapterIds).toEqual(expectedChapters.map(({ id }) => id));
    expect(new Set(renderedChapterIds).size).toBe(expectedChapters.length);

    FOUNDER_GUIDE_CHAPTERS.forEach(chapter => {
      const mediaPath = path.resolve(guideRoot, chapter.src.replace(/^\//, ""));
      expect(fs.existsSync(mediaPath)).toBe(true);
      expect(fs.statSync(mediaPath).size).toBeGreaterThan(0);
      expect(chapter.duration).toBeGreaterThan(0);
    });

    const railMarkup =
      html.match(
        /<aside\b[^>]*data-founder-guide="rail"[^>]*>[\s\S]*?<\/aside>/
      )?.[0] ?? "";
    const videoMarkup = railMarkup.match(/<video\b[^>]*>/)?.[0] ?? "";

    expect(html.match(/data-founder-guide="rail"/g)).toHaveLength(1);
    expect(railMarkup).not.toBe("");
    expect(railMarkup.match(/<video\b/g)).toHaveLength(1);
    expect(videoMarkup).toContain("muted");
    expect(videoMarkup.toLowerCase()).toContain("playsinline");
    expect(videoMarkup).toContain('preload="metadata"');
    expect(railMarkup).toContain("Founder guide");
    expect(railMarkup).toContain("Muted · Tap to hear");

    const guideStart = storySource.indexOf("function FounderGuideRail");
    const guideEnd = storySource.indexOf(
      "function RecordingPlayer",
      guideStart
    );
    const guideSource = storySource.slice(guideStart, guideEnd);

    expect(storySource).toContain("await settleFounderGuidePlayback");
    expect(storySource).toContain("await media.play()");
    expect(guideSource).toContain("new IntersectionObserver");
    expect(guideSource).toContain(
      'window.addEventListener("scroll", scheduleUpdate, { passive: true })'
    );
    expect(guideSource).toContain('"visibilitychange"');
    expect(guideSource).toContain('"pagehide"');
    expect(guideSource).not.toContain('addEventListener("wheel"');
    expect(guideSource).not.toContain('addEventListener("touchmove"');
    expect(guideSource).not.toContain("preventDefault");
    expect(guideSource).not.toContain("key={activeChapter");
    expect(guideSource).toContain("video.src = activeChapter.src");
    expect(guideSource).toContain('video.removeAttribute("src")');
    expect(guideSource).toContain("event.currentTarget !== videoRef.current");
    expect(guideSource).toContain("const suspendGuide");
    expect(guideSource).toContain(
      'video && video.currentTime > 0 ? "paused" : "ready"'
    );
    expect(guideSource.indexOf("if (muted)")).toBeLessThan(
      guideSource.indexOf('playbackState === "playing"')
    );
    expect(guideSource).toContain("audible: true");
    expect(guideSource).toContain("restart: true");
  });

  it("ignores a stale play promise during a rapid Founder Guide switch", async () => {
    let resolveFirst!: () => void;
    let resolveSecond!: () => void;
    let activeRequest = "first";
    const firstPlaying = vi.fn();
    const secondPlaying = vi.fn();
    const firstFailed = vi.fn();
    const secondFailed = vi.fn();

    const firstAttempt = settleFounderGuidePlayback({
      media: {
        play: () =>
          new Promise<void>(resolve => {
            resolveFirst = resolve;
          }),
      },
      isCurrent: () => activeRequest === "first",
      onPlaying: firstPlaying,
      onFailure: firstFailed,
    });

    activeRequest = "second";
    const secondAttempt = settleFounderGuidePlayback({
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
    expect(firstFailed).not.toHaveBeenCalled();

    resolveSecond();
    await secondAttempt;
    expect(secondPlaying).toHaveBeenCalledOnce();
    expect(secondFailed).not.toHaveBeenCalled();
  });

  it("selects the Founder Guide chapter crossing the responsive viewport anchor", () => {
    const chapters = [
      { id: "01", top: -200, bottom: 95 },
      { id: "02", top: 95, bottom: 500 },
      { id: "03", top: 500, bottom: 900 },
    ];

    expect(findFounderGuideChapterAtAnchor(chapters, 400)).toBe("02");
    expect(findFounderGuideChapterAtAnchor(chapters, 1000)).toBe("02");
    expect(
      findFounderGuideChapterAtAnchor(
        [
          { id: "01", top: -500, bottom: 160 },
          { id: "02", top: 160, bottom: 700 },
        ],
        1000
      )
    ).toBe("02");
    expect(
      findFounderGuideChapterAtAnchor(
        [{ id: "01", top: 200, bottom: 600 }],
        1000
      )
    ).toBeUndefined();
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
