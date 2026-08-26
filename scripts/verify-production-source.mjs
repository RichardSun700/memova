import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const REQUIRED_TRACKED_PATHS = [
  "client/homepage/index.html",
  "client/public/product-demo/index.html",
  "client/public/personal-manual/neil-armstrong/index.html",
  "client/public/personal-manual/generated-conductor/index.html",
  "client/public/sources/index.html",
  "client/public/demo/index.html",
  "client/public/demo/year_about_people/index.html",
  "client/public/demo/Avery_Manual/index.html",
  "client/public/demo/battle_for_attention/index.html",
  "client/public/demo/Manifesto_Book/index.html",
  "client/public/demo/The_Architecture_of_Sleep/index.html",
  "client/public/avery-portfolio-book/index.html",
  "client/public/manifesto-the-future-of-being-remembered/index.html",
  "client/public/odmpartnership/index.html",
  "client/public/team/weilijiang/index.html",
  "client/public/thebookofmemova/index.html",
  "client/public/_headers",
  "client/public/_redirects",
];

const PRODUCTION_SOURCE_SCOPES = [
  "client/homepage",
  "client/public",
  "client/src/seo",
  "scripts",
  "package.json",
];

export function findProductionSourceViolations(statusOutput, trackedPaths) {
  const violations = statusOutput
    .split("\n")
    .filter(Boolean)
    .map((line) => `Dirty production input: ${line.trimEnd()}`);

  for (const requiredPath of REQUIRED_TRACKED_PATHS) {
    if (!trackedPaths.has(requiredPath)) {
      violations.push(`Required tracked path is missing: ${requiredPath}`);
    }
  }

  return violations;
}

export function verifyProductionSource(repoRoot) {
  const statusOutput = execFileSync(
    "git",
    [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--",
      ...PRODUCTION_SOURCE_SCOPES,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  const trackedOutput = execFileSync(
    "git",
    ["ls-files", "--", ...REQUIRED_TRACKED_PATHS],
    { cwd: repoRoot, encoding: "utf8" },
  );
  const trackedPaths = new Set(trackedOutput.split("\n").filter(Boolean));

  return findProductionSourceViolations(statusOutput, trackedPaths);
}

function runCli() {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const violations = verifyProductionSource(repoRoot);

  if (violations.length > 0) {
    console.error("Production source verification failed:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Production source verified: tracked and clean.");
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCli();
}
