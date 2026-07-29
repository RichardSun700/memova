import { describe, expect, it } from "vitest";

import { findDeployHeadViolation } from "../../../scripts/verify-deploy-head.mjs";

describe("findDeployHeadViolation", () => {
  it("accepts an exact production commit", () => {
    expect(findDeployHeadViolation("abc123", "abc123")).toBeNull();
  });

  it("rejects a stale, divergent, or unmerged commit", () => {
    expect(findDeployHeadViolation("abc123", "def456")).toContain(
      "does not exactly match origin/main",
    );
  });
});
