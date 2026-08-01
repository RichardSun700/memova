import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectSeoBuildErrors } from "../../../scripts/verify-seo-build.mjs";
import { sitePages } from "./sitePages";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("SEO build verification", () => {
  it("rejects an incomplete static output", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-empty-")
    );
    temporaryDirectories.push(directory);

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors.length).toBeGreaterThan(5);
    expect(errors.some(error => error.includes("robots.txt"))).toBe(true);
    expect(errors.some(error => error.includes("sitemap.xml"))).toBe(true);
  });

  it("accepts the generated production SEO output", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const homepage = fs.readFileSync(path.join(output, "index.html"), "utf8");

    expect(collectSeoBuildErrors(output, sitePages)).toEqual([]);
    expect(homepage).toContain('id="memova-seo-shell-styles"');
    expect(homepage).toContain('data-seo-shell-version="2"');
    expect(homepage).not.toContain('id="manus-runtime"');
    expect(homepage).not.toContain("__MANUS_HOST_DEV__");
  });

  it("rejects a production artifact containing the Manus development runtime", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-manus-runtime-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    fs.appendFileSync(
      path.join(directory, "index.html"),
      '<script id="manus-runtime">window.__MANUS_HOST_DEV__ = true;</script>'
    );

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors.some(error => error.includes("Manus preview runtime"))).toBe(
      true
    );
    expect(
      errors.some(error => error.includes("Manus host development runtime"))
    ).toBe(true);
  });

  it("rejects a stale or unstyled SEO shell", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-stale-shell-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    const homepagePath = path.join(directory, "index.html");
    const homepage = fs
      .readFileSync(homepagePath, "utf8")
      .replace('id="memova-seo-shell-styles"', 'id="removed-shell-styles"')
      .replace('data-seo-shell-version="2"', 'data-seo-shell-version="1"');
    fs.writeFileSync(homepagePath, homepage);

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors).toContain("/ has no critical SEO shell styles");
    expect(errors).toContain("/ has no current SEO shell version");
  });

  it("requires a top-level noindex 404 document for Cloudflare Pages", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-no-404-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    fs.rmSync(path.join(directory, "404.html"), { force: true });

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors.some(error => error.includes("404.html"))).toBe(true);
  });

  it("rejects explicit HTML rewrites that create Cloudflare 308 loops", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-looping-redirect-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    fs.appendFileSync(
      path.join(directory, "_redirects"),
      "\n/login /login.html 200\n"
    );

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(
      errors.some(error => error.includes("loops under Cloudflare clean URLs"))
    ).toBe(true);
  });

  it("requires direct static shells for both legal routes", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-no-legal-shells-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    fs.rmSync(path.join(directory, "privacy-policy.html"), { force: true });
    fs.rmSync(path.join(directory, "privacy.html"), { force: true });

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors).toContain(
      "Missing static legal route shell: /privacy-policy"
    );
    expect(errors).toContain("Missing static legal route shell: /privacy");
  });

  it("requires a neutral shell for every private SPA route", () => {
    const output = path.resolve(process.cwd(), "dist/public");
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "memova-seo-no-private-shell-")
    );
    temporaryDirectories.push(directory);
    fs.cpSync(output, directory, { recursive: true });
    fs.rmSync(path.join(directory, "login.html"), { force: true });

    const errors = collectSeoBuildErrors(directory, sitePages);

    expect(errors).toContain("Missing private SPA route shell: /login");
  });
});
