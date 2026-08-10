import { describe, expect, it } from "vitest";

import { getActionCardScale } from "./ActionEcosystemBand";

describe("getActionCardScale", () => {
  it("keeps the centered connector full size", () => {
    expect(getActionCardScale(0)).toBeCloseTo(1, 5);
  });

  it("matches the smaller Granola-style edge scale", () => {
    expect(getActionCardScale(1)).toBeCloseTo(0.59, 5);
  });

  it("clamps distances outside the viewport range", () => {
    expect(getActionCardScale(-1)).toBeCloseTo(1, 5);
    expect(getActionCardScale(4)).toBeCloseTo(0.59, 5);
  });
});
