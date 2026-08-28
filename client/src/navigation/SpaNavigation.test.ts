import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSpaPath } from "./SpaNavigation";

describe("SPA navigation route selection", () => {
  it("keeps React routes inside the client application", () => {
    for (const path of [
      "/framework-preview",
      "/agent-memory",
      "/journal",
      "/journal/why-we-changed-our-onboarding-story",
      "/product-journal",
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
      "/",
      "/research-lab/nvidia-2026-gtc/",
      "/motion-lab",
      "/motion-lab/",
      "/user-cases/demos/amazon_german_car_gift.html",
      "/thebookofmemova/",
      "/assets/index.js",
    ]) {
      expect(isSpaPath(path), path).toBe(false);
    }
  });

  it("makes the current homepage canonical and redirects retired marketing routes", () => {
    const appSource = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/App.tsx"),
      "utf8"
    );

    expect(appSource).toContain(
      'path={"/"} component={ProductionHomepageRoute}'
    );
    expect(appSource).toContain('path={"/framework-preview"}');
    expect(appSource).toContain('path={"/journal"}');
    expect(appSource).toContain('path={"/journal/:slug"}');
    expect(appSource).toContain('<Redirect to="/#act" replace />');
    expect(appSource).toContain('<Redirect to="/#capture" replace />');
    expect(appSource).not.toContain('<Redirect to="/#product" replace />');
    expect(appSource).not.toContain('<Redirect to="/#use-cases" replace />');
    expect(appSource).toContain('path={"/mcp"} component={Mcp}');
    expect(appSource).not.toContain('import Home from "./pages/Home"');
    expect(appSource).not.toContain("component={AgentMemory}");
    expect(appSource).not.toContain("component={HowItWorks}");
    expect(appSource).not.toContain('path={"/motion-lab"}');
    expect(appSource).not.toContain("MotionLab");
  });
});
