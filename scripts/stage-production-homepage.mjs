import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourcePath = path.join(projectRoot, "client", "homepage", "index.html");
const outputPath = path.join(projectRoot, "dist", "public", "index.html");
const cloudflareFileLimit = 25 * 1024 * 1024;

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Production homepage source is missing: ${sourcePath}`);
}

const source = fs.readFileSync(sourcePath, "utf8");
for (const requiredMarker of [
  'data-production-homepage="apollo-living-book-v1"',
  'rel="canonical" href="https://memova.ai/"',
  'sizes="96x96" href="/favicon-96x96.png"',
  'rel="manifest" href="/site.webmanifest"',
  'type="application/ld+json"',
  '/analytics/ga4-consent.js',
]) {
  if (!source.includes(requiredMarker)) {
    throw new Error(`Production homepage is missing ${requiredMarker}`);
  }
}

const sourceSize = fs.statSync(sourcePath).size;
if (sourceSize >= cloudflareFileLimit) {
  throw new Error(
    `Production homepage is ${sourceSize} bytes; Cloudflare Pages files must remain below 25 MiB`,
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.copyFileSync(sourcePath, outputPath);
console.log(
  `Staged production homepage: ${path.relative(projectRoot, outputPath)} (${(
    sourceSize /
    1024 /
    1024
  ).toFixed(1)} MiB)`,
);
