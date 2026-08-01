import { describe, expect, it } from "vitest";
import { isSpaPath } from "./SpaNavigation";

describe("SPA navigation route selection", () => {
  it("keeps React routes inside the client application", () => {
    for (const path of [
      "/",
      "/agent-memory",
      "/mcp",
      "/privacy-policy",
      "/login",
      "/mcp/oauth/consent",
      "/use-cases/meeting-to-follow-up",
    ]) {
      expect(isSpaPath(path), path).toBe(true);
    }
  });

  it("leaves standalone documents and demo pages to the browser", () => {
    for (const path of [
      "/research-lab/nvidia-2026-gtc/",
      "/user-cases/demos/amazon_german_car_gift.html",
      "/thebookofmemova/",
      "/assets/index.js",
    ]) {
      expect(isSpaPath(path), path).toBe(false);
    }
  });
});
