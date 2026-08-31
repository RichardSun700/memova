import { describe, expect, it } from "vitest";
import { isUsableAuthSession } from "./AuthContext";

const now = Date.parse("2026-08-31T10:00:00.000Z");

function session(overrides: Record<string, unknown> = {}) {
  return {
    access_token: "token",
    expires_at: "2026-09-01T10:00:00.000Z",
    user: {
      id: "user-1",
      email: "alex@example.com",
      display_name: "Alex",
    },
    default_workspace: {
      id: "workspace-1",
      type: "personal",
      name: "Alex's Workspace",
    },
    ...overrides,
  };
}

describe("isUsableAuthSession", () => {
  it("accepts a current session with a complete user identity", () => {
    expect(isUsableAuthSession(session(), now)).toBe(true);
  });

  it("rejects a legacy session that has a token but no user id", () => {
    expect(
      isUsableAuthSession(
        session({
          user: {
            email: "alex@example.com",
            display_name: "Alex",
          },
        }),
        now
      )
    ).toBe(false);
  });

  it("rejects expired and malformed sessions", () => {
    expect(
      isUsableAuthSession(
        session({ expires_at: "2026-08-30T10:00:00.000Z" }),
        now
      )
    ).toBe(false);
    expect(isUsableAuthSession({ access_token: "token" }, now)).toBe(false);
  });
});
