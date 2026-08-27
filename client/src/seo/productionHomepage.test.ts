import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const homepage = fs.readFileSync(
  path.resolve(process.cwd(), "client/homepage/index.html"),
  "utf8"
);
const publicDir = path.resolve(process.cwd(), "client/public");

function readPngSize(fileName: string) {
  const png = fs.readFileSync(path.join(publicDir, fileName));
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("production homepage", () => {
  it("uses the current Liquid Blue Mist icon as the stable search favicon", () => {
    expect(homepage).toContain(
      '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">'
    );
    expect(homepage).toContain(
      '<link rel="icon" type="image/svg+xml" href="/brand/memova-app-icon-liquid-blue.svg">'
    );
    expect(homepage).toContain('<link rel="manifest" href="/site.webmanifest">');
    expect(homepage).toContain('"logo":{"@type":"ImageObject","url":"https://memova.ai/favicon.png"');
    expect(homepage).not.toContain("favicon.ico?v=");

    expect(readPngSize("favicon-96x96.png")).toEqual({ width: 96, height: 96 });
    expect(readPngSize("favicon-192x192.png")).toEqual({ width: 192, height: 192 });
    expect(readPngSize("favicon.png")).toEqual({ width: 512, height: 512 });
    expect(readPngSize("apple-touch-icon.png")).toEqual({ width: 180, height: 180 });

    const ico = fs.readFileSync(path.join(publicDir, "favicon.ico"));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBeGreaterThanOrEqual(6);

    const manifest = JSON.parse(
      fs.readFileSync(path.join(publicDir, "site.webmanifest"), "utf8")
    );
    expect(manifest.name).toBe("Memova");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/favicon-192x192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/favicon.png", sizes: "512x512" }),
      ])
    );
  });

  it("submits early-access signups to the production waitlist API", () => {
    expect(homepage).toContain('fetch("/api/waitlist"');
    expect(homepage).toContain('source: "home-ios-early-access"');
    expect(homepage).toContain('trackEvent("waitlist_submit_success"');
    expect(homepage).toContain("Please enter a valid email.");
    expect(homepage).toContain("noValidate: true");
    expect(homepage).not.toContain("setSubmitted(true)");
  });
});
