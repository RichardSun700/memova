import { describe, expect, it } from "vitest";

import {
  getLivingBookScrollProgress,
  livingBookLayouts,
} from "./LivingBookContextStory";

describe("getLivingBookScrollProgress", () => {
  it("starts at zero when the scroll scene reaches the viewport", () => {
    expect(getLivingBookScrollProgress(0, 1800, 900)).toBe(0);
  });

  it("maps the middle of the sticky track to one half", () => {
    expect(getLivingBookScrollProgress(-450, 1800, 900)).toBe(0.5);
  });

  it("clamps before and after the scene", () => {
    expect(getLivingBookScrollProgress(300, 1800, 900)).toBe(0);
    expect(getLivingBookScrollProgress(-1200, 1800, 900)).toBe(1);
  });

  it("remains safe when the scene is shorter than the viewport", () => {
    expect(getLivingBookScrollProgress(-1, 600, 900)).toBe(1);
  });

  it("keeps every fully revealed Page inside the compact canvas", () => {
    const compact = livingBookLayouts.compact;

    expect(compact.thinkingVisible + compact.pageWidth).toBeLessThanOrEqual(1);
    expect(compact.decisionVisible + compact.pageWidth).toBeLessThanOrEqual(1);
    expect(compact.final.output + compact.pageWidth).toBeLessThanOrEqual(1);
  });
});
