import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const worker = fs.readFileSync(
  path.join(root, "functions/api/personal-manual/[[path]].js"),
  "utf8"
);
const migration = fs.readFileSync(
  path.join(root, "migrations/0001_anonymous_personal_manual.sql"),
  "utf8"
);
const wranglerConfig = fs.readFileSync(
  path.join(root, "wrangler.toml"),
  "utf8"
);
const captureIntegration = fs.readFileSync(
  path.join(root, "client/public/capture-personal-manual-integration.js"),
  "utf8"
);
describe("Personal Manual authenticated polling with rollback compatibility", () => {
  it("keeps the visible prompts unchanged and polls the signed-in account", () => {
    expect(captureIntegration).toContain(
      'stepOnePrompt: "Please install or update Memova from gxyfred/memova-codex-plugin to the latest version and complete sign-in. When finished, remind me to restart Codex."'
    );
    expect(captureIntegration).toContain('stepTwoPrompt: "@memova Personal Manual"');
    expect(captureIntegration).toContain(
      'stepOnePrompt: "Please connect to the Memova MCP: https://api.memova.ai/mcp and complete sign-in. If the client needs to be reloaded, remind me."'
    );
    expect(captureIntegration).toContain(
      'stepTwoPrompt: "Use Memova to generate my Personal Manual."'
    );
    expect(captureIntegration).toContain('const AUTH_STORAGE_KEY = "memova.auth.v1"');
    expect(captureIntegration).toContain('state: "audience", flow, session');
    expect(captureIntegration).toContain("NO SIGN-IN YET");
    expect(captureIntegration).toContain("Run Prompt 01 first");
    expect(captureIntegration).not.toContain("Sign in before you create.");
    expect(captureIntegration).toContain("/v1/personal-manual/current");
    expect(captureIntegration).toContain("/overview/preview");
    expect(captureIntegration).toContain("isNewResult(manualFlow.baseline, current)");
    expect(captureIntegration).not.toContain("return the stable public URL to this one-time website handoff");
    expect(captureIntegration).not.toContain("personal_manual_handoff_result_v1");
    expect(captureIntegration).not.toContain("job.submitUrl");
    expect(captureIntegration).not.toContain('/api/personal-manual/jobs');
    expect(captureIntegration).toContain(
      "Continue with the selection fallback when clipboard permissions are unavailable."
    );
    expect(captureIntegration).not.toContain("complete self-contained HTML file");
    expect(captureIntegration).not.toContain("Content-Type: text/html");
  });

  it("creates isolated jobs and keeps read and submit capabilities separate", () => {
    expect(worker).toContain('segments.join("/") === "api/personal-manual/jobs"');
    expect(worker).toContain('segments.slice(0, 3).join("/") === "api/personal-manual/results"');
    expect(worker).toContain('const readToken = randomToken("read")');
    expect(worker).toContain('const submitToken = randomToken("submit", 32)');
    expect(worker).toContain("await sha256(readToken)");
    expect(worker).toContain("await sha256(submitToken)");
    expect(worker).toContain("bearerToken(request)");
    expect(worker).not.toContain("read_token TEXT");
    expect(worker).not.toContain("submit_token TEXT");
  });

  it("keeps the rollback worker bounded and prevents result overwrite", () => {
    expect(worker).toContain("const MAX_HTML_BYTES = 1_500_000");
    expect(worker).toContain("invalid_html_document");
    expect(worker).toContain("html_too_large");
    expect(worker).toContain("job.status === \"complete\"");
    expect(worker).toContain("WHERE job_id = ? AND status = 'waiting'");
    expect(worker).toContain("job_expired");
  });

  it("persists only token hashes and expires rollback jobs", () => {
    expect(migration).toContain("read_token_hash TEXT NOT NULL");
    expect(migration).toContain("submit_token_hash TEXT NOT NULL UNIQUE");
    expect(migration).toContain("expires_at TEXT NOT NULL");
    expect(migration).toContain("result_html TEXT");
    expect(migration).not.toMatch(/\bread_token\s+TEXT/);
    expect(migration).not.toMatch(/\bsubmit_token\s+TEXT/);
    expect(wranglerConfig).toContain('binding = "PM_DB"');
    expect(wranglerConfig).toContain("[[env.production.d1_databases]]");
  });
});
