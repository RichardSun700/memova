import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = process.argv[2];
const outputPath = path.join(
  projectRoot,
  "client/public/personal-manual/neil-armstrong/index.html",
);
const approvedSourceHash =
  "d102f7dcb59ccc8a0168380ed0c9b294d32ea4be36902789bb35041f2b7da149";

if (!sourcePath) {
  throw new Error("Pass the extracted App Embed V7 index.html path.");
}

const source = await fs.readFile(path.resolve(sourcePath), "utf8");
const sourceHash = crypto.createHash("sha256").update(source).digest("hex");
if (sourceHash !== approvedSourceHash) {
  throw new Error(
    `Unexpected App Embed V7 source hash: ${sourceHash}. Expected ${approvedSourceHash}.`,
  );
}
if (!source.includes('content="neil-armstrong-v7-modified"')) {
  throw new Error("The approved V7 version marker is missing.");
}

const legacyStart = `  <style>
    /* The card cover is the phone-specific v5 homepage; desktop retains the original editorial hero. */`;
const retainedMobileStart = `  <style>
    /* Mobile corrections: the card supplies its own masthead and the tendency cards must grow with their real copy. */`;
const legacyStartIndex = source.indexOf(legacyStart);
const retainedMobileIndex = source.indexOf(retainedMobileStart, legacyStartIndex);
if (legacyStartIndex < 0 || retainedMobileIndex < 0) {
  throw new Error("Could not isolate the legacy V5 mobile-card iframe block.");
}

let html = source.slice(0, legacyStartIndex) + source.slice(retainedMobileIndex);
html = html.replace(
  '  <meta name="robots" content="noindex,nofollow" />\n',
  "",
);
html = html.replace(
  '<style id="memova-app-embed-overrides">',
  `<style id="memova-app-embed-overrides">
    /* Never expose partially patched legacy markup while V7 initializes. */
    html:not([data-memova-app-ready="true"]) body[data-memova-embed="app"] {
      visibility: hidden;
    }`,
);
html = html.replace(
  '  <meta name="memova-embed-contract" content="1" />',
  `  <meta name="memova-embed-contract" content="1" />
  <meta name="memova-website-embed" content="flat-1" />`,
);
if (!html.includes("/analytics/ga4-consent.js")) {
  html = html.replace(
    "</head>",
    '  <script type="module" src="/analytics/ga4-consent.js?v=classic-compatible-1"></script>\n</head>',
  );
}

const forbiddenMarkers = [
  "<iframe",
  "mobile-card-cover",
  "phone-specific v5 homepage",
  "mobileCardSource",
  "Personal User Manual mobile card cover",
];
for (const marker of forbiddenMarkers) {
  if (html.includes(marker)) {
    throw new Error(`Flattened V7 still contains forbidden marker: ${marker}`);
  }
}

await fs.writeFile(outputPath, html);
const outputHash = crypto.createHash("sha256").update(html).digest("hex");
console.log(`Installed flattened Neil V7: ${outputPath}`);
console.log(`Approved source SHA-256: ${sourceHash}`);
console.log(`Flattened output SHA-256: ${outputHash}`);
