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

  it("marks account, consent, settings, hidden demo, and raw demos as noindex", () => {
    const privatePaths = [
      "/login",
      "/profile",
      "/connected-clients",
      "/settings/connected-clients",
      "/mcp/oauth/consent",
      "/bay-area-agent-demo-2",
      "/user-cases/demos/example.html",
    ];

    for (const path of privatePaths) {
      expect(getSitePage(path).index, path).toBe(false);
    }
  });

  it("maps the privacy-policy alias to the canonical privacy metadata", () => {
    const canonical = getSitePage("/privacy");
    const alias = getSitePage("/privacy-policy");

    expect(alias).toEqual(canonical);
    expect(alias.path).toBe("/privacy");
    expect(alias.index).toBe(true);
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
