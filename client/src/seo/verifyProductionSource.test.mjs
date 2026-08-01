import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  REQUIRED_TRACKED_PATHS,
  findProductionSourceViolations,
} from "../../../scripts/verify-production-source.mjs";

const allRequiredPaths = new Set([
  "client/public/demo/index.html",
  "client/public/avery-portfolio-book/index.html",
  "client/public/manifesto-the-future-of-being-remembered/index.html",
  "client/public/odmpartnership/index.html",
  "client/public/team/weilijiang/index.html",
  "client/public/thebookofmemova/index.html",
  "client/public/_headers",
  "client/public/_redirects",
]);

describe("findProductionSourceViolations", () => {
  it("requires the Book of Memova homepage in every production source", () => {
    expect(REQUIRED_TRACKED_PATHS).toContain(
      "client/public/thebookofmemova/index.html",
    );
  });

  it("requires every preserved direct-link experience", () => {
    expect(REQUIRED_TRACKED_PATHS).toEqual(
      expect.arrayContaining([
        "client/public/demo/index.html",
        "client/public/avery-portfolio-book/index.html",
        "client/public/manifesto-the-future-of-being-remembered/index.html",
      ]),
    );
  });

  it("accepts a clean source when every required page is tracked", () => {
    expect(findProductionSourceViolations("", allRequiredPaths)).toEqual([]);
  });

  it("rejects an untracked public page", () => {
    expect(
      findProductionSourceViolations(
        "?? client/public/odmpartnership/index.html\n",
        allRequiredPaths,
      ),
    ).toContain(
      "Dirty production input: ?? client/public/odmpartnership/index.html",
    );
  });

  it("rejects modified and renamed production inputs", () => {
    expect(
      findProductionSourceViolations(
        " M client/public/_headers\nR  client/public/old.html -> client/public/new.html\n",
        allRequiredPaths,
      ),
    ).toEqual(
      expect.arrayContaining([
        "Dirty production input:  M client/public/_headers",
        "Dirty production input: R  client/public/old.html -> client/public/new.html",
      ]),
    );
  });

  it("rejects missing required tracked paths", () => {
    const violations = findProductionSourceViolations("", new Set());

    for (const requiredPath of REQUIRED_TRACKED_PATHS) {
      expect(violations).toContain(
        `Required tracked path is missing: ${requiredPath}`,
      );
    }
  });
});

describe("production verification pipelines", () => {
  const expectedCommands = [
    "pnpm run check",
    "pnpm run build",
    "pnpm test",
    "pnpm run check:seo",
  ];

  function expectCommandsInOrder(source) {
    let previousIndex = -1;

    for (const command of expectedCommands) {
      const commandIndex = source.indexOf(command);
      expect(commandIndex, `${command} should be present`).toBeGreaterThan(-1);
      expect(commandIndex, `${command} should run after the previous check`).toBeGreaterThan(
        previousIndex,
      );
      previousIndex = commandIndex;
    }
  }

  it("builds before running tests in the production deploy script", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/deploy-production.sh"),
      "utf8",
    );

    expectCommandsInOrder(source);
    expect(source).toContain("pnpm install --frozen-lockfile");
    expect(source).toContain('git rev-parse origin/main');
    expect(source).toContain('wrangler_version="4.110.0"');
    expect(source).not.toContain("git push origin HEAD:main");
  });

  it("runs the same build-first checks for pull requests and main", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), ".github/workflows/ci.yml"),
      "utf8",
    );

    expect(source).toContain("pull_request:");
    expect(source).toContain("branches: [main]");
    expect(source).toContain("uses: pnpm/action-setup@v4");
    expect(source).not.toContain("version: 10.4.1");
    expectCommandsInOrder(source);
  });
});
