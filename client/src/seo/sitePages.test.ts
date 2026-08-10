import { describe, expect, it } from "vitest";
import { SITE_URL, getSitePage, sitePages } from "./sitePages";

describe("sitePages", () => {
  it("gives every indexable page unique search metadata and a static summary", () => {
    const indexable = sitePages.filter(page => page.index);

    expect(new Set(indexable.map(page => page.title)).size).toBe(
      indexable.length
    );
    expect(new Set(indexable.map(page => page.description)).size).toBe(
      indexable.length
    );
    expect(indexable.every(page => page.summary.trim().length >= 80)).toBe(
      true
    );
  });

  it("uses clean canonical paths on the primary host", () => {
    expect(SITE_URL).toBe("https://memova.ai");

    for (const page of sitePages.filter(candidate => candidate.index)) {
      const canonical = new URL(page.path, SITE_URL);
      expect(canonical.origin).toBe(SITE_URL);
      expect(canonical.search).toBe("");
      expect(canonical.hash).toBe("");
    }
  });

  it("marks account, consent, settings, the preview alias, and raw demos as noindex", () => {
    const privatePaths = [
      "/login",
      "/profile",
      "/connected-clients",
      "/settings/connected-clients",
      "/mcp/oauth/consent",
      "/framework-preview",
      "/user-cases/demos/example.html",
    ];

    for (const path of privatePaths) {
      expect(getSitePage(path).index, path).toBe(false);
    }

    expect(getSitePage("/framework-preview").title).toBe(
      "Memova Homepage Framework Preview"
    );
  });

  it("removes retired marketing pages from public metadata", () => {
    const retiredPaths = [
      "/ios",
      "/agent-memory",
      "/how-it-works",
      "/user-cases",
      "/use-cases/meeting-to-follow-up",
      "/use-cases/idea-to-product-brief",
      "/use-cases/conversation-to-action-plan",
      "/use-cases/dream-journal",
      "/bay-area-agent-demo-2",
      "/motion-lab",
    ];

    for (const path of retiredPaths) {
      const page = getSitePage(path);
      expect(page.index, path).toBe(false);
      expect(page.title, path).toContain("Not Found");
      expect(
        sitePages.some(candidate => candidate.path === path),
        path
      ).toBe(false);
    }
  });

  it("maps the privacy-policy alias to the canonical privacy metadata", () => {
    const canonical = getSitePage("/privacy");
    const alias = getSitePage("/privacy-policy");

    expect(alias).toEqual(canonical);
    expect(alias.path).toBe("/privacy");
    expect(alias.index).toBe(true);
  });

  it("publishes the Product Journal as a crawlable standalone experience", () => {
    expect(getSitePage("/product-journal")).toMatchObject({
      path: "/product-journal",
      index: true,
      schemaType: "WebPage",
    });
  });

  it("publishes the team journal separately from the Apollo product demo", () => {
    expect(getSitePage("/journal")).toMatchObject({
      path: "/journal",
      index: true,
      schemaType: "WebPage",
      hero: {
        title: "Building Memova in Public",
      },
    });
    expect(getSitePage("/product-journal").title).not.toBe(
      getSitePage("/journal").title
    );
    expect(
      getSitePage("/journal/why-we-changed-our-onboarding-story")
    ).toMatchObject({
      path: "/journal/why-we-changed-our-onboarding-story",
      index: true,
      schemaType: "Article",
      hero: {
        title: "Why we changed our onboarding story.",
      },
    });
  });

  it("provides route-matched hero copy for public marketing pages", () => {
    for (const page of sitePages.filter(
      candidate => candidate.path !== "/privacy" && candidate.path !== "/terms"
    )) {
      expect(page.hero?.eyebrow.trim().length, page.path).toBeGreaterThan(0);
      expect(page.hero?.title.trim().length, page.path).toBeGreaterThan(0);
      expect(page.hero?.intro.trim().length, page.path).toBeGreaterThan(0);
    }
  });

  it("falls back to a noindex not-found metadata record", () => {
    const page = getSitePage("/not-a-real-page");

    expect(page.index).toBe(false);
    expect(page.title).toContain("Not Found");
  });
});
