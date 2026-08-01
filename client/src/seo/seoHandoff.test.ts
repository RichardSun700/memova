import { afterEach, describe, expect, it } from "vitest";
import {
  initializeSeoHandoff,
  shouldSkipInitialMarketingMotion,
} from "./seoHandoff";

afterEach(() => {
  initializeSeoHandoff(null);
});

describe("SEO shell handoff", () => {
  it("skips initial marketing motion when the server rendered shell is present", () => {
    const root = {
      querySelector: (selector: string) =>
        selector === '[data-seo-snapshot="true"]' ? {} : null,
    } as unknown as ParentNode;

    expect(initializeSeoHandoff(root)).toBe(true);
    expect(shouldSkipInitialMarketingMotion()).toBe(true);
  });

  it("keeps entrance motion when mounting without a server rendered shell", () => {
    const root = { querySelector: () => null } as unknown as ParentNode;

    expect(initializeSeoHandoff(root)).toBe(false);
    expect(shouldSkipInitialMarketingMotion()).toBe(false);
  });
});
