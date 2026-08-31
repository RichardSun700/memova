import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (fileName: string) =>
  fs.readFileSync(path.resolve(process.cwd(), "client/src", fileName), "utf8");

describe("account profile completion", () => {
  it("requires a nickname after verification when the account has none", () => {
    const login = source("pages/Login.tsx");

    expect(login).toContain("!response.user.display_name?.trim()");
    expect(login.match(/continueAfterVerification\(response\)/g)).toHaveLength(2);
    expect(login).toContain("What should Memova call you?");
    expect(login).toContain("Continue to Memova");
    expect(login).toContain("disabled={loading || !nickname.trim()}");
    expect(login).toContain("personalize your Memova experience and your Personal Manual");
    expect(login).toContain('placeholder="Your nickname"');
    expect(login).toContain(
      "You can change this anytime and add a profile photo later."
    );
  });

  it("persists the nickname and lets the user edit it later", () => {
    const api = source("lib/api.ts");
    const profile = source("pages/Profile.tsx");

    expect(api).toContain('method: "PATCH"');
    expect(api).toContain("body: { display_name: displayName }");
    expect(profile).toContain("Save nickname");
    expect(profile).toContain("updateCurrentUserProfile(");
    expect(profile).toContain("auth.token,");
    expect(profile).toContain("auth.setSessionFromCurrentUserResponse(current)");
  });

  it("uploads and completes an optional avatar using the backend handoff contract", () => {
    const api = source("lib/api.ts");
    const profile = source("pages/Profile.tsx");
    const authContext = source("contexts/AuthContext.tsx");

    expect(api).toContain("avatar_url?: string | null");
    expect(api).toContain("avatar_url_expires_at?: string | null");
    expect(api).toContain("avatar_version?: string | null");
    expect(api).toContain('"/v1/auth/me/avatar-upload"');
    expect(api).toContain("checksum_sha256: checksumSha256");
    expect(api).toContain("headers: upload.headers");
    expect(api).toContain("/complete`");
    expect(api).toContain('"/v1/auth/me/avatar"');
    const blobUpload = api.slice(
      api.indexOf("export async function uploadCurrentUserAvatarBlob"),
      api.indexOf("export async function completeCurrentUserAvatarUpload")
    );
    expect(blobUpload).not.toContain("Authorization");

    expect(profile).toContain('title="Edit profile photo"');
    expect(profile).toContain('id="profile-avatar-upload"');
    expect(profile).toContain('accept="image/png,image/jpeg,image/webp"');
    expect(profile).not.toContain("image/gif");
    expect(profile).toContain("completeCurrentUserAvatarUpload");
    expect(profile).toContain("deleteCurrentUserAvatar");
    expect(profile).toContain("Profile photo saved.");
    expect(profile).toContain("Profile photo editing is not available yet.");
    expect(profile).toContain("auth.workspace?.type === \"personal\"");
    expect(profile).toContain("`${auth.user.display_name.trim()}'s Workspace`");
    expect(authContext).toContain("sessionWithoutTemporaryAvatarUrl");
    expect(authContext).toContain("avatar_url: null");
  });

  it("shows nickname identity and log out in authenticated navigation without email", () => {
    const navbar = source("components/Navbar.tsx");
    const accountShell = source("components/account/AccountShell.tsx");

    for (const navigation of [navbar, accountShell]) {
      expect(navigation).toContain(
        'auth.user?.display_name?.trim() || "Memova account"'
      );
      expect(navigation).toContain("auth.user?.avatar_url");
      expect(navigation).toContain("Log out");
      expect(navigation).not.toContain("auth.user?.email");
    }
  });

  it("returns account pages to the clean homepage URL after log out", () => {
    const accountShell = source("components/account/AccountShell.tsx");

    expect(accountShell).toContain('window.location.assign("/")');
    expect(accountShell).not.toContain('setLocation("/")');
  });
});
