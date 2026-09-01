import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AgentMemory from "./AgentMemory";
import HowItWorks from "./HowItWorks";
import IOS from "./IOS";
import Home from "./Home";
import HomeFrameworkPreview from "./HomeFrameworkPreview";
import Mcp from "./Mcp";
import ProductJournal from "./ProductJournal";
import { getPublishFanScrollProgress } from "@/components/home/PublishPhoneFan";
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

  it("keeps the homepage concise and opens the complete journey in a dedicated Product Journal", () => {
    const homeHtml = render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    const journalHtml = render(<ProductJournal />);

    expect(homeHtml).toContain("Your everyday context");
    expect(homeHtml).toContain("Open Product Journal");
    expect(homeHtml).toContain('href="/product-journal"');
    expect(homeHtml).toContain("Real use cases");
    expect(homeHtml).toContain("Private. Local.");
    expect(homeHtml).toContain("Start with Memova on iPhone");
    expect(homeHtml).not.toContain("Scattered in. Shareable out.");
    expect(homeHtml).not.toContain("data-story-chapter=");
    expect(homeHtml).not.toContain('data-founder-guide="rail"');

    expect(journalHtml).toContain('data-product-journal="page"');
    expect(journalHtml).toContain("Memova Product Journal");
    expect(journalHtml).toContain(
      'aria-label="Close Product Journal and return to the Memova homepage"'
    );
    expect(journalHtml).not.toContain('href="/"');
    expect(journalHtml).toContain("Scattered in. Shareable out.");
    expect(journalHtml).not.toContain("<iframe");
    expect(journalHtml).not.toContain("/demo/index.html?embed=1");
    const storyChapters = [
      "knowledge-base",
      "note",
      "book",
      "output-share",
      "alignment",
      "end",
    ];
    storyChapters.forEach(chapter => {
      expect(journalHtml).toContain(`data-story-chapter="${chapter}"`);
    });
    const chapterPositions = storyChapters.map(chapter =>
      journalHtml.indexOf(`data-story-chapter="${chapter}"`)
    );
    expect(chapterPositions).toEqual(
      [...chapterPositions].sort((a, b) => a - b)
    );
    expect(journalHtml).not.toContain("Previous chapter");
    expect(journalHtml).not.toContain("Next chapter");
    expect(journalHtml).toContain("Page enters Book");
    expect(journalHtml).toContain("Pages form a Book");
    expect(journalHtml).toContain("Reveal provenance");
    expect(journalHtml).toContain("Ask Memova");
  });

  it("keeps the homepage framework universal while proving the workflow with Apollo", () => {
    const html = render(
      <AuthProvider>
        <HomeFrameworkPreview />
      </AuthProvider>
    );

    expect(html).toContain('data-scroll-hero="true"');
    expect(html).toContain("YOUR CONTEXT,");
    expect(html).toContain("FINALLY UNDERSTOOD.");
    expect(html).toContain("Turn your thoughts and experiences");
    expect(html).toContain("A Living Book keeps the sources");
    expect(html).toContain("every new Page can build on the context");
    expect(html).toContain("Personal superalignment starts with Memova.");
    expect(html).toContain("Download the app");
    expect(html).toContain('data-app-download-placeholder="true"');
    expect(html).not.toContain("Scroll to see your Book take shape");
    expect(html).toContain("Customer interview");
    expect(html).toContain("Founder voice note");
    expect(html).toContain("Launch plan.pdf");
    expect(html).toContain("Building in Public:");
    expect(html).toContain("AI Product Launch");
    expect(html).toContain("Building in Public");
    expect(html).toContain("Illustrative case");
    expect(html).toContain("Suggested actions");
    expect(html).toContain("Clarify the product story");
    expect(html).toContain("Clarify one core outcome.");
    expect(html).toContain("Move customer insights");
    expect(html).toContain("Move insights into the story.");
    expect(html).toContain("Share the beta journey");
    expect(html).toContain("Signals reviewed");
    expect(html).toContain("12</strong><span");
    expect(html).toContain("Customer interviews");
    expect(html).toContain("Product discussions");
    expect(html).toContain("Prototype reviews");
    expect(html).toContain("Founder notes");
    expect(html).toContain("31 sources connected");
    expect(html).toContain("Capture");
    expect(html).toContain("Synthesize");
    expect(html).toContain("Share");
    expect(html).toContain("Audience");
    expect(html).toContain("Early adopters");
    expect(html).toContain("AI builders");
    expect(html).toContain("Design partners");
    expect(html).toContain("Output");
    expect(html).toContain("Social drafts");
    expect(html).toContain("Status");
    expect(html).toContain("Ready for founder review");
    expect(html).toContain("For review");
    expect(html).toContain("Private until shared");
    expect(html).toContain(
      'src="/demo/media/ai-product-launch-workspace-v1-480.webp"'
    );
    expect(html).toContain("ai-product-launch-workspace-v1-960.webp 960w");
    expect(html).toContain('src="/demo/media/hero-open-book-complete-v4.webp"');
    expect(html).toContain(
      'src="/demo/media/hero-book-final-reference-v5-960.webp"'
    );
    expect(html).toContain("hero-book-final-reference-v5-1857.webp 1857w");
    expect(html).toContain("How Memova works · Open a real story");
    expect(html).toContain("One story. The full Memova loop.");
    expect(html).toContain("Apollo 11: After the Giant Leap");
    expect(html).not.toContain("The Architecture of Sleep");
    expect(html).toContain("Open a Memova case page");
    expect(html).toContain("LAUNCH");
    expect(html).toContain("Press LAUNCH to open the full story.");
    expect(html).toContain('data-case-story-image="apollo"');
    expect(html).toContain('src="/demo/media/apollo11-earth-horizon.jpg"');
    expect(html).toContain(
      'src="/demo/media/apollo-case-launch/rocket-idle-v1.png"'
    );
    expect(html).toContain(
      'src="/demo/media/apollo-case-launch/rocket-v1.png"'
    );
    expect(html).toContain('src="/memova-logo-transparent.png"');
    expect(html).not.toContain(
      'src="/demo/media/memova-closed-book-shell-v1.webp"'
    );
    expect(html).not.toContain('src="/demo/media/earthrise-book-cover.jpg"');
    expect(html).not.toContain('src="/demo/media/dream-atlas-cover-v1.webp"');
    expect(html).toContain('href="/product-journal"');
    expect(html.match(/data-case-book-trigger=/g)).toHaveLength(1);
    expect(html).not.toContain('id="home-v2-case-book-reader"');
    expect(html).toContain("Review required");
    expect(html).toContain("Your context should grow—not start over.");
    expect(html).toContain("data-living-book-archive");
    expect(html).toContain("Customer interview #12");
    expect(html).toContain("What this changes");
    expect(html).toContain("Simplify onboarding.");
    expect(html).toContain("Building in Public: AI Product Launch");
    expect(html.match(/data-living-book-art=/g)).toHaveLength(4);
    expect(html.match(/data-living-book-visual-panel=/g)).toHaveLength(4);
    expect(html).toContain("living-book-source-editorial-v1-480.webp");
    expect(html).toContain("living-book-thinking-editorial-v1-480.webp");
    expect(html).toContain("living-book-decision-editorial-v1-480.webp");
    expect(html).toContain("living-book-output-editorial-v1-480.webp");
    expect(html).toContain("living-book-output-editorial-v1-960.webp 960w");
    expect(html).toContain(
      "The new Page still knows why each decision was made."
    );
    expect(html).toContain("31 sources connected");
    expect(html).toContain("Two directions");
    expect(html).toContain(
      "For what you&#x27;re building—and who you&#x27;re becoming."
    );
    expect(html).toContain("Build with context");
    expect(html).toContain("Keep the why behind the work.");
    expect(html).toContain("Understand yourself over time");
    expect(html).toContain("See the patterns across your life.");
    expect(html).toContain(
      "/demo/media/context-directions/project-flow-v1.webp"
    );
    expect(html).toContain(
      "/demo/media/context-directions/living-book-growth-v1.webp"
    );
    expect(html.match(/home-v2-context-direction-illustration/g)).toHaveLength(
      2
    );
    expect(html).toContain("Project Book");
    expect(html).toContain("Personal Manual");
    expect(html).toContain("Selected Pages");
    expect(html.match(/data-context-direction=/g)).toHaveLength(2);
    expect(html).toContain('id="personal-manual"');
    expect(html).toContain("A living manual for being you.");
    expect(html).toContain("Living context, not a personality test.");
    expect(html).toContain("Illustrative Personal Manual");
    expect(html).toContain("Marilyn Monroe · public archive");
    expect(html).toContain("illustrative fictional Personal Manual poster");
    expect(html).toContain("not verified biographical information");
    expect(html).toContain("not a real Memova account");
    expect(html).toContain("inferred profile of Marilyn Monroe");
    expect(html).toContain("not a personality");
    expect(html).toContain(
      'src="/demo/media/personal-manual-marilyn-poster-v1-640.webp"'
    );
    expect(html).toContain(
      "/demo/media/personal-manual-marilyn-poster-v1-1200.webp 1199w"
    );
    expect(html).toContain("Open full-size");
    expect(html).toContain("Open the image at full size to read every detail.");
    expect(html).not.toContain(
      'href="/demo/media/personal-manual-marilyn-poster-v1-1200.webp"'
    );
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("home-v2-manual-visual-poster");
    expect(html).toContain(
      "Public archive moments become visual chapters before they are"
    );
    expect(html).toContain(
      'aria-label="Open the illustrative Personal Manual poster in a full-screen viewer"'
    );
    expect(html.match(/data-wheel-card=/g)).toHaveLength(8);
    expect(html).not.toContain("Personal Manual · Living Page");
    expect(html).not.toContain("home-v2-manual-visual-structured");
    expect(html).not.toContain("personal-manual-infinity-v1.webp");
    expect(html).not.toContain("How I think and decide");
    expect(html).not.toContain("How to work and communicate with me");
    expect(html).not.toContain("What is changing in my current chapter");
    expect(html).toContain('id="publish-anywhere"');
    expect(html).toContain("One Page. Every place you show up.");
    expect(html).toContain(
      "Turn one reviewed Memova Page into channel-ready versions"
    );
    expect(html).toContain(
      "Publish in one click where direct integrations are available"
    );
    expect(html).toContain("learn from real feedback");
    expect(html).toContain("keep building in public");
    expect(html).toContain(
      "Especially useful for founders, creators, and anyone"
    );
    expect(html).toContain('data-publish-scroll-scene="true"');
    expect(html).not.toContain("Choose a Page");
    expect(html).not.toContain("Review each version");
    expect(html).not.toContain("Share when ready");
    expect(html).not.toContain(
      "Nothing is published without your confirmation."
    );
    expect(html).not.toContain("Approved Memova Page");
    expect(html).not.toContain("5 versions ready to review");
    expect(html).toContain(
      'src="/demo/media/publish-phone-fan/x-phone-v2.webp"'
    );
    expect(html).toContain(
      'src="/demo/media/publish-phone-fan/linkedin-phone-v2.webp"'
    );
    expect(html).toContain(
      'src="/demo/media/publish-phone-fan/snapchat-phone-v2.webp"'
    );
    expect(html).toContain(
      'src="/demo/media/publish-phone-fan/tiktok-phone-loop-v2.mp4"'
    );
    expect(html).toContain(
      'poster="/demo/media/publish-phone-fan/tiktok-phone-poster-v2.webp"'
    );
    expect(html).toContain(
      'src="/demo/media/publish-phone-fan/youtube-phone-loop-v1.mp4"'
    );
    expect(html.match(/data-publish-phone=/g)).toHaveLength(5);
    expect(html.match(/data-publish-video="true"/g)).toHaveLength(2);
    expect(html.match(/home-v2-publish-phone-label/g)).toHaveLength(5);
    expect(html).toContain("home-v2-publish-mobile-labels");
    expect(html).toContain(
      "Five social output previews expand into view as you scroll."
    );
    expect(html).toContain("Landing-site flyover · NASA / GSFC");
    expect(html).not.toContain("Click or drag to reveal every format");
    expect(html).not.toContain("Fan out previews");
    expect(html).not.toContain("Gather previews");
    expect(html).not.toContain('id="home-v2-publish-preview"');
    expect(html).not.toContain('id="home-v2-publish-tab-');
    expect(html).toContain('id="connected-actions"');
    expect(html).toContain("One connection. Many ways to move.");
    expect(html).toContain("turn context you have already reviewed");
    expect(html).toContain("into an email draft");
    expect(html).toContain("a calendar event");
    expect(html).toContain("X- and LinkedIn-ready post");
    expect(html).toContain("you approve the final send");
    expect(html).toContain("planned destinations");
    expect(html).toContain("availability varying by service and permission");
    expect(html.match(/data-action-connector-primary=/g)).toHaveLength(12);
    expect(html.match(/data-action-card-shell="true"/g)).toHaveLength(60);
    expect(html).toContain('data-action-connector-primary="gmail"');
    expect(html).toContain('data-action-connector-primary="outlook"');
    expect(html).toContain('data-action-connector-primary="google-calendar"');
    expect(html).toContain('data-action-connector-primary="x"');
    expect(html).toContain('data-action-connector-primary="linkedin"');
    expect(html).toContain('data-action-connector-primary="codex"');
    expect(html).toContain("Your work stays yours.");
    expect(html).toContain("Your approval");
    expect(html).toContain("Choose what to show");
    expect(html).toContain("Building Memova in Public");
    expect(html).toContain("Week 12");
    expect(html).toContain("Why we changed our onboarding story.");
    expect(html).toContain(
      "The same Memova loop can help you build something—or understand who"
    );
    expect(html).toContain("Start your first living Book.");
    expect(html).toContain('href="/journal"');
    expect(html).not.toContain(
      'href="/journal/why-we-changed-our-onboarding-story"'
    );
    expect(html).toContain("Open the Memova Journal:");
    expect(html).not.toContain('id="journal"');

    const sectionOrder = [
      'id="book"',
      'id="personal-manual"',
      'id="publish-anywhere"',
      'id="connected-actions"',
      'id="use-cases"',
      'id="trust"',
      'id="waitlist"',
    ].map(section => html.indexOf(section));
    expect(sectionOrder.every(position => position >= 0)).toBe(true);
    expect(sectionOrder).toEqual(
      [...sectionOrder].sort((left, right) => left - right)
    );

    const heroSource = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/pages/HomeFrameworkPreview.tsx"),
      "utf8"
    );
    const heroStyles = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/styles/home-framework-preview.css"
      ),
      "utf8"
    );
    expect(heroStyles).toContain("privacy-control-backdrop-v1.webp");
    const publishSource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/home/PublishPhoneFan.tsx"
      ),
      "utf8"
    );
    const actionEcosystemSource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/src/components/home/ActionEcosystemBand.tsx"
      ),
      "utf8"
    );
    const heroMotionSource = heroSource.slice(
      heroSource.indexOf("function HeroSection"),
      heroSource.indexOf("function CaseStoryImage")
    );

    expect(heroSource).toContain("Apollo 11: After the Giant Leap");
    expect(heroSource).not.toContain("The Architecture of Sleep");
    expect(heroSource).not.toContain("276 anonymized dream entries");
    expect(heroSource).not.toContain("DREAM_ATLAS_PATH");
    expect(heroSource).not.toContain("dream-atlas-cover-v1.webp");
    expect(publishSource).toContain("x-phone-v2.webp");
    expect(publishSource).toContain("linkedin-phone-v2.webp");
    expect(publishSource).toContain("snapchat-phone-v2.webp");
    expect(publishSource).toContain("tiktok-phone-loop-v2.mp4");
    expect(publishSource).toContain("tiktok-phone-poster-v2.webp");
    expect(publishSource).toContain("youtube-phone-loop-v1.mp4");
    expect(actionEcosystemSource).toContain(
      "const ACTION_CONNECTOR_COPIES = 5"
    );
    expect(actionEcosystemSource).toContain(
      "const ACTION_CONNECTOR_SPEED = 30"
    );
    expect(actionEcosystemSource).toContain(
      "Math.cos((distance * Math.PI) / 2)"
    );
    expect(actionEcosystemSource).toContain("IntersectionObserver");
    expect(actionEcosystemSource).toContain("ResizeObserver");
    expect(actionEcosystemSource).toContain(
      'viewport.addEventListener("pointerdown", handlePointerDown'
    );
    expect(actionEcosystemSource).toContain(
      '"(prefers-reduced-motion: reduce)"'
    );
    expect(publishSource).toContain("IntersectionObserver");
    expect(publishSource).toContain("prefers-reduced-motion: reduce");
    expect(publishSource).toContain(
      'window.addEventListener("scroll", queueScrollUpdate, { passive: true })'
    );
    expect(publishSource).toContain("getPublishFanScrollProgress");
    expect(publishSource).toContain(
      'closest<HTMLElement>("[data-publish-scroll-scene]")'
    );
    expect(heroStyles).toContain(".home-v2-publish-scroll-sticky");
    expect(heroStyles).toContain("position: sticky");
    expect(heroStyles).toContain("min-height: 168svh");
    expect(heroStyles).toContain(".home-v2-publish-copy");
    expect(heroStyles).toContain(
      "height: min(clamp(380px, 34vw, 470px), calc(100% - 58px))"
    );
    expect(heroStyles).toContain(".home-v2-publish-phone-label");
    expect(publishSource).toContain("maximumHorizontalRange");
    expect(publishSource).toContain("horizontalSafeArea");
    expect(publishSource).not.toContain("-height * 0.045");
    expect(publishSource).not.toContain("ReactPointerEvent");
    expect(publishSource).not.toContain("onPointerDown");
    expect(publishSource).not.toContain("handleStageClick");
    expect(publishSource).not.toContain("onWheel");
    expect(publishSource).not.toContain("touchmove");
    expect(publishSource).not.toContain("preventDefault");
    expect(heroSource).not.toContain("dream-atlas-spread-v1.webp");
    expect(heroSource).not.toContain("dream-atlas-patterns-v1.webp");
    expect(heroSource).toContain("home-v2-case-book-shelf");
    expect(heroSource).toContain("apolloLogoLaunchPath");
    expect(heroSource).toContain("APOLLO_LAUNCH_DURATION_MS");
    expect(heroSource).toContain("home-v2-case-story-track");
    expect(heroSource).toContain("home-v2-case-story-rocket");
    expect(heroSource).toContain("home-v2-case-story-fire");
    expect(heroSource).not.toContain("function CaseBookTransition");
    expect(heroSource).toContain("navigate(story.href");
    expect(heroSource).toContain("productJournalEntryState");
    expect(heroSource).toContain("getWorkflowStoryHref(story)");
    expect(heroSource).toContain("prefersReducedMotion");
    expect(heroSource).toContain("fallbackTimer");
    expect(heroSource).toContain(
      'window.addEventListener("pageshow", resetStoryTransition)'
    );
    expect(heroSource).toContain(
      'window.removeEventListener("pageshow", resetStoryTransition)'
    );
    expect(heroSource).toContain("transitionLockRef.current = null");
    expect(heroSource).toContain("setTransitionStoryId(null)");
    expect(heroSource).not.toContain("function WorkflowStoryPanel");
    expect(heroSource).not.toContain("CaseBookMotion");
    expect(heroSource).not.toContain("finishBookMotion");
    expect(heroSource).toContain("Bring the mission record together.");
    expect(heroSource).toContain("Explore the 6-chapter story");
    expect(heroSource).toContain('href: "/product-journal"');
    expect(heroSource).toContain("/demo/media/kb-apollo-case-entry-ui.png");
    expect(heroMotionSource).toContain(
      'window.addEventListener("scroll", scheduleRender, { passive: true })'
    );
    expect(heroMotionSource).not.toContain('addEventListener("wheel"');
    expect(heroMotionSource).not.toContain('addEventListener("touchmove"');
    expect(heroMotionSource).not.toContain("preventDefault()");
    expect(heroMotionSource).not.toContain("window.scrollTo");
    expect(heroMotionSource).toContain(
      "const pageProgress = smoothHeroProgress((progress - 0.48) / 0.1)"
    );
    expect(heroMotionSource).toContain("pageRevealNodes.forEach");
    expect(heroMotionSource).toContain("node.dataset.revealStart");
    expect(heroSource).toContain("createHeroPathSampler");
    expect(heroSource).toContain("desktopHeroPath");
    expect(heroSource).toContain("mobileHeroPath");
    expect(heroMotionSource).toContain("const chainOffset =");
    expect(heroMotionSource).toContain("progress * 1.12 + chainOffset");
    expect(heroStyles).toContain(".home-v3-hero-sticky");
    expect(heroStyles).toContain(".home-v3-source-meeting,");
    expect(heroStyles).toContain(".home-v3-source-customer");
    expect(heroStyles).toContain("--source-tint: #eafaff");
    expect(heroStyles).toContain("--source-tint: #f5f0ff");
    expect(heroStyles).toContain("--source-tint: #fff1ed");
    expect(heroStyles).toContain("--source-tint: #edf9f2");
    expect(heroStyles).toContain("--source-tint: #fff8e7");
    expect(heroStyles).toContain("--source-tint: #edf9f7");
    expect(heroStyles).toContain("inset 0 2px 0 var(--source-accent)");
    expect(heroStyles).toContain(".home-v3-book-left-page");
    expect(heroStyles).toContain(".home-v3-book-right-webpage");
    expect(heroStyles).toContain(".home-v2-case-book-shelf");
    expect(heroStyles).toContain(".home-v2-case-book-visual");
    expect(heroStyles).toContain(".home-v2-case-book-transition");
    expect(heroStyles).toContain("home-v2-case-route-open");
    expect(heroStyles).toContain("home-v2-case-route-cover");
    expect(heroStyles).toContain("460ms");
    expect(heroStyles).toContain("prefers-reduced-motion: reduce");
    expect(heroSource).toContain("home-v3-book-left-inner");
    expect(heroSource).toContain("home-v3-book-right-inner");
    expect(heroStyles).toContain("--book-page-top: 13.4%");
    expect(heroStyles).toContain("--book-left-page-start: 18.3%");
    expect(heroStyles).toContain("--book-right-page-size: 38.5%");
    expect(heroStyles).not.toContain("--book-right-page-size: 46%");
    expect(heroStyles).toContain("clip-path: polygon(20.5% 0");
    expect(heroStyles).toContain("clip-path: polygon(22% 0");
    expect(heroStyles).toContain("rotateY(2.2deg)");
    expect(heroStyles).toContain("rotateZ(1.3deg)");
    expect(heroStyles).toContain("rotateZ(-0.55deg)");
    expect(heroStyles).toContain("transform-origin: 100% 54%");
    expect(heroStyles).toContain(".home-v3-page-reveal");
    expect(
      heroStyles.match(/\.home-v3-webpage-footer \.home-v3-copy-mobile/g)
    ).toHaveLength(2);
    expect(heroStyles).toContain(
      ".home-v3-webpage-footer .home-v3-copy-desktop"
    );
    expect(heroStyles).toContain("position: sticky;");
    expect(heroStyles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(heroStyles).toContain(".home-v2-manual-poster-frame");
    expect(heroStyles).toContain(".home-v2-manual-poster-link");
    expect(heroStyles).toContain(".home-v2-manual-visual-poster");
    expect(heroStyles).toContain(".home-v2-manual-poster-lightbox");
    expect(heroStyles).toContain(".home-v2-manual-poster-lightbox-close");
    expect(heroSource).toContain('event.key !== "Escape"');
    expect(heroSource).toContain("data-manual-poster-lightbox");
    expect(html.match(/data-hero-source="true"/g)).toHaveLength(10);
    expect(html.match(/data-page-reveal="true"/g)).toHaveLength(12);
    expect(html).not.toContain("everything you do.");

    const loopStages = [
      "SOURCE · AUG 04",
      "THINKING · AUG 05",
      "DECISION · AUG 06",
      "MEMOVA PAGE · AUG 10",
    ];
    loopStages.forEach(stage => expect(html).toContain(stage));
    const loopPositions = loopStages.map(stage => html.indexOf(stage));
    expect(loopPositions).toEqual([...loopPositions].sort((a, b) => a - b));

    expect(html).not.toContain("Your ideas, auto-published");
    expect(html).not.toContain("For founders building in public");
    expect(html).not.toContain("¥30");
  });

  it("maps the publish preview fan directly to page scroll progress", () => {
    expect(getPublishFanScrollProgress(240, 1360, 800)).toBe(0);
    expect(getPublishFanScrollProgress(0, 1360, 800)).toBe(0);
    expect(getPublishFanScrollProgress(-280, 1360, 800)).toBeCloseTo(0.5);
    expect(getPublishFanScrollProgress(-560, 1360, 800)).toBe(1);
    expect(getPublishFanScrollProgress(-900, 1360, 800)).toBe(1);
  });

  it("lets the standalone Dream Atlas return safely to its Memova entry page", () => {
    const dreamAtlasHtml = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "client/public/demo/The_Architecture_of_Sleep/index.html"
      ),
      "utf8"
    );

    expect(dreamAtlasHtml).toContain('class="atlas-close" href="/"');
    expect(dreamAtlasHtml).toContain('data-action="close-atlas"');
    expect(dreamAtlasHtml).toContain(
      'aria-label="Close The Architecture of Sleep and return to the Memova homepage"'
    );
    expect(dreamAtlasHtml).toContain("min-height: 44px");
    expect(dreamAtlasHtml).toContain("function getSafeReturnTarget()");
    expect(dreamAtlasHtml).toContain(
      "if (target.origin !== window.location.origin) return null"
    );
    expect(dreamAtlasHtml).toContain("window.history.back()");
    expect(dreamAtlasHtml).toContain("window.location.replace(");
    expect(dreamAtlasHtml).toContain(
      'else if (state.view === "reader") navigate("index")'
    );
  });

  it("adds the App Store-inspired architecture bridges without changing the six chapters", () => {
    const html = render(<ProductJournal />);
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
    const html = render(<ProductJournal />);
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
    const spineEnd = storySource.indexOf(
      "function FounderGuideRail",
      spineStart
    );
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
    const html = render(<HeroSection />);

    expect(html).toContain("Your everyday context");
    expect(html).toContain("ready for agents");
    expect(html).toContain("Join iOS Early Access");
    expect(html).toContain('data-analytics-event="ios_early_access_click"');
    expect(html).toContain("Open Product Journal");
    expect(html).toContain('href="/product-journal"');
    expect(html).not.toContain("See the workflow");
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

  it("keeps Product Journal recordings readable, clickable, and compatible with natural page scroll", () => {
    const html = render(<ProductJournal />);
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
    expect(storySource).toContain("const storyIsPinned =");
    expect(storySource).toContain("if (storyIsPinned) return");
    expect(storySource).toContain("refreshGeometryForLateAsset");
    expect(storySource).toContain('"loadedmetadata"');
    expect(storySource).toContain(
      'window.addEventListener("touchstart", refreshGeometryForInput'
    );
    expect(chapterSource).toContain(
      "data-scroll-progress={progress.toFixed(4)}"
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
      "const progress = useProjectIngestProgress(sectionRef, reducedMotion, true)"
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
    expect(projectSource).toContain(
      "data-scroll-progress={progress.toFixed(4)}"
    );
    expect(storySource).toContain("width={1435}");
    expect(storySource).toContain("height={1096}");
    expect(continuousStyles).not.toContain("data-mobile-discrete");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.project-ingest-sticky\s*\{[^}]*transform: translate3d\(0, 0, 0\);[^}]*will-change: transform;/
    );
    expect(continuousStyles).toContain("contain: layout paint");
    expect(continuousStyles).toContain("will-change: auto");
    expect(continuousStyles).toContain("width: min(92%, 430px)");
    expect(continuousStyles).toContain("bottom: 76px");
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.project-ingest-stage\s*\{[^}]*touch-action: pan-y pinch-zoom;/
    );
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous \.project-ingest-material video\s*\{[^}]*pointer-events: none;/
    );
    expect(continuousStyles).toMatch(
      /\.framework-shell--continuous\s+\.project-ingest-beat\s+:is\([^}]*\)\s*\{[^}]*transition: none;/
    );
  });

  it("maps one six-chapter Founder Guide rail to the six product-story chapters", () => {
    const html = render(<ProductJournal />);
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
    const html = render(<ProductJournal />);
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

  it("defines detailed use-case stories with the complete transformation", () => {
    expect(useCaseDetails).toHaveLength(4);

    for (const detail of useCaseDetails) {
      const html = render(<UseCaseDetailPage slug={detail.slug} />);
      expect(html).toContain(detail.title);
      expect(html).toContain("Everyday context");
      expect(html).toContain("Agent memory");
      expect(html).toContain("Workflow outcome");
      expect(html).toContain("Review and approve");
      expect(html).toContain("Join iOS Early Access");
    }

    const dreamHtml = render(<UseCaseDetailPage slug="dream-journal" />);
    expect(dreamHtml).toContain("Illustrative personal story");
    expect(dreamHtml).toContain("dream-journal-story-card-v1.webp");
  });
});
