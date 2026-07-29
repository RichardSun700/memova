import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function findDeployHeadViolation(headSha, originMainSha) {
  if (headSha === originMainSha) {
    return null;
  }

  return `HEAD ${headSha} does not exactly match origin/main ${originMainSha}`;
}

function resolveRevision(revision, repoRoot) {
  return execFileSync("git", ["rev-parse", revision], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}

function runCli() {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const headRevision = process.argv[2] ?? "HEAD";
  const productionRevision = process.argv[3] ?? "origin/main";
  const headSha = resolveRevision(headRevision, repoRoot);
  const productionSha = resolveRevision(productionRevision, repoRoot);
  const violation = findDeployHeadViolation(headSha, productionSha);

  if (violation) {
    console.error(`Production deployment stopped: ${violation}`);
    process.exitCode = 1;
    return;
  }

  console.log("Production commit verified: HEAD exactly matches origin/main.");
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCli();
}
