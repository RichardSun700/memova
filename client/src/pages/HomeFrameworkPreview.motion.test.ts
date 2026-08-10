import { describe, expect, it } from "vitest";
import {
  createHeroPathSampler,
  desktopHeroPath,
  getHeroSourceBaseOpacity,
  mobileHeroPath,
  retargetHeroPath,
  type HeroPathPoint,
  type HeroPathSegment,
} from "./HomeFrameworkPreview";

type ViewportCase = {
  width: number;
  height: number;
  path: HeroPathSegment[];
  endpoint: HeroPathPoint;
};

const viewportCases: ViewportCase[] = [
  {
    width: 740,
    height: 360,
    path: desktopHeroPath,
    endpoint: { x: 0.47, y: 0.85 },
  },
  {
    width: 390,
    height: 844,
    path: mobileHeroPath,
    endpoint: { x: 0.5, y: 0.85 },
  },
  {
    width: 320,
    height: 700,
    path: mobileHeroPath,
    endpoint: { x: 0.5, y: 0.85 },
  },
];

describe("Home framework hero motion path", () => {
  it("keeps mobile source cards legible as the S-shaped intake begins", () => {
    expect(getHeroSourceBaseOpacity(0, true)).toBeCloseTo(0.22, 5);
    expect(getHeroSourceBaseOpacity(0.13, true)).toBeCloseTo(0.31, 5);
    expect(getHeroSourceBaseOpacity(0.26, true)).toBeCloseTo(0.4, 5);
    expect(getHeroSourceBaseOpacity(1, true)).toBeCloseTo(0.4, 5);
    expect(getHeroSourceBaseOpacity(0, false)).toBeCloseTo(0.92, 5);
  });

  it.each(viewportCases)(
    "lands exactly on the live Book intake at $width×$height",
    ({ width, height, path, endpoint }) => {
      const sample = createHeroPathSampler(
        retargetHeroPath(path, endpoint),
        width,
        height
      );
      const end = sample(1);

      expect(end.x).toBeCloseTo(endpoint.x * width, 5);
      expect(end.y).toBeCloseTo(endpoint.y * height, 5);
    }
  );

  it.each(viewportCases)(
    "keeps successive arc-length samples visually even at $width×$height",
    ({ width, height, path, endpoint }) => {
      const sample = createHeroPathSampler(
        retargetHeroPath(path, endpoint),
        width,
        height
      );
      const points = Array.from({ length: 41 }, (_, index) =>
        sample(index / 40)
      );
      const distances = points
        .slice(1)
        .map((point, index) =>
          Math.hypot(point.x - points[index].x, point.y - points[index].y)
        );
      const average =
        distances.reduce((total, value) => total + value, 0) / distances.length;

      distances.forEach(distance => {
        expect(Math.abs(distance - average) / average).toBeLessThan(0.36);
      });
    }
  );
});
