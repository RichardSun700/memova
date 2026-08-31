import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateBlobSha256,
  completeCurrentUserAvatarUpload,
  deleteCurrentUserAvatar,
  reserveCurrentUserAvatarUpload,
  uploadCurrentUserAvatarBlob,
  type AvatarUploadReservation,
  type CurrentUserResponse,
} from "./api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("avatar upload API flow", () => {
  it("calculates a lowercase SHA-256 checksum from the exact Blob bytes", async () => {
    const blob = new Blob(["abc"], { type: "image/png" });

    await expect(calculateBlobSha256(blob)).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("reserves, uploads, and completes without sending the bearer token to Blob", async () => {
    const file = new Blob(["avatar-bytes"], { type: "image/png" });
    const checksum = await calculateBlobSha256(file);
    const reservation: AvatarUploadReservation = {
      avatar_upload: {
        id: "upload-1",
        status: "pending",
        content_type: file.type,
        byte_size: file.size,
        checksum_sha256: checksum,
        expires_at: "2099-01-01T00:00:00Z",
      },
      upload: {
        method: "PUT",
        url: "https://blob.example/avatar?sas=1",
        expires_at: "2099-01-01T00:00:00Z",
        headers: {
          "Content-Type": "image/png",
          "x-ms-blob-type": "BlockBlob",
        },
      },
    };
    const current = currentUserResponse("avatar-v1");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(reservation, 201))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse(current));
    globalThis.fetch = fetchMock;

    const created = await reserveCurrentUserAvatarUpload(
      "memova-token",
      file,
      checksum
    );
    await uploadCurrentUserAvatarBlob(created.upload, file);
    const completed = await completeCurrentUserAvatarUpload(
      "memova-token",
      created.avatar_upload.id,
      file,
      checksum
    );

    const reserveCall = fetchMock.mock.calls[0];
    expect(String(reserveCall[0])).toMatch(/\/v1\/auth\/me\/avatar-upload$/);
    const reserveHeaders = reserveCall[1]?.headers as Headers;
    expect(reserveHeaders.get("Authorization")).toBe("Bearer memova-token");
    expect(JSON.parse(String(reserveCall[1]?.body))).toEqual({
      content_type: "image/png",
      byte_size: file.size,
      checksum_sha256: checksum,
    });

    const blobCall = fetchMock.mock.calls[1];
    expect(blobCall[0]).toBe(reservation.upload.url);
    expect(blobCall[1]?.method).toBe("PUT");
    expect(blobCall[1]?.headers).toEqual(reservation.upload.headers);
    expect(blobCall[1]?.body).toBe(file);
    expect(
      new Headers(blobCall[1]?.headers).has("Authorization")
    ).toBe(false);

    const completeCall = fetchMock.mock.calls[2];
    expect(String(completeCall[0])).toMatch(
      /\/v1\/auth\/me\/avatar-upload\/upload-1\/complete$/
    );
    expect(JSON.parse(String(completeCall[1]?.body))).toEqual({
      byte_size: file.size,
      checksum_sha256: checksum,
    });
    expect(completed).toEqual(current);
  });

  it("deletes an uploaded avatar and returns the server-selected fallback", async () => {
    const current = currentUserResponse(null);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(current));
    globalThis.fetch = fetchMock;

    await expect(deleteCurrentUserAvatar("memova-token")).resolves.toEqual(
      current
    );
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/v1\/auth\/me\/avatar$/
    );
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

function currentUserResponse(
  avatarVersion: string | null
): CurrentUserResponse {
  return {
    user: {
      id: "user-1",
      email: "user@example.com",
      display_name: "Silva",
      avatar_url: avatarVersion
        ? `https://blob.example/avatar/${avatarVersion}?sas=1`
        : null,
      avatar_url_expires_at: avatarVersion
        ? "2099-01-01T00:00:00Z"
        : null,
      avatar_version: avatarVersion,
      auth_provider: "email",
    },
    default_workspace: {
      id: "workspace-1",
      name: "Silva's Workspace",
      slug: "silva",
      type: "personal",
    },
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
