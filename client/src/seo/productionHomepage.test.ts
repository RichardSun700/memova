import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const homepage = fs.readFileSync(
  path.resolve(process.cwd(), "client/homepage/index.html"),
  "utf8"
);

describe("production homepage", () => {
  it("submits early-access signups to the production waitlist API", () => {
    expect(homepage).toContain('fetch("/api/waitlist"');
    expect(homepage).toContain('source: "home-ios-early-access"');
    expect(homepage).toContain('trackEvent("waitlist_submit_success"');
    expect(homepage).toContain("Please enter a valid email.");
    expect(homepage).toContain("noValidate: true");
    expect(homepage).not.toContain("setSubmitted(true)");
  });
});
