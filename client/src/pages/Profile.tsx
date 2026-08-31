import { useEffect, useState, type ChangeEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useLocation } from "wouter";
import AccountShell from "@/components/account/AccountShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  calculateBlobSha256,
  completeCurrentUserAvatarUpload,
  deleteCurrentUserAvatar,
  reserveCurrentUserAvatarUpload,
  updateCurrentUserProfile,
  uploadCurrentUserAvatarBlob,
} from "@/lib/api";

type AvatarUploadStage =
  | "idle"
  | "preparing"
  | "reserving"
  | "uploading"
  | "completing";

const SUPPORTED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function Profile() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(Boolean(auth.token));
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState(auth.user?.display_name || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarStage, setAvatarStage] = useState<AvatarUploadStage>("idle");
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setLocation(`/login?next=${encodeURIComponent("/profile")}`);
      return;
    }

    let cancelled = false;
    setLoading(true);
    auth
      .refreshUser()
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not refresh your profile."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, setLocation]);

  useEffect(() => {
    setNickname(auth.user?.display_name || "");
  }, [auth.user?.display_name]);

  const handleSaveNickname = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedNickname = nickname.trim();
    if (!auth.token || !normalizedNickname) return;

    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const current = await updateCurrentUserProfile(
        auth.token,
        normalizedNickname
      );
      auth.setSessionFromCurrentUserResponse(current);
      setNickname(current.user.display_name || normalizedNickname);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your nickname."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setAvatarMessage("");
    if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      input.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Choose an image smaller than 5 MB.");
      input.value = "";
      return;
    }
    if (!auth.token) return;

    try {
      setAvatarStage("preparing");
      const checksumSha256 = await calculateBlobSha256(file);

      setAvatarStage("reserving");
      const reservation = await reserveCurrentUserAvatarUpload(
        auth.token,
        file,
        checksumSha256
      );

      setAvatarStage("uploading");
      await uploadCurrentUserAvatarBlob(reservation.upload, file);

      setAvatarStage("completing");
      const current = await completeCurrentUserAvatarUpload(
        auth.token,
        reservation.avatar_upload.id,
        file,
        checksumSha256
      );
      auth.setSessionFromCurrentUserResponse(current);
      setAvatarMessage("Profile photo saved.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        auth.clearSession();
        setLocation(`/login?next=${encodeURIComponent("/profile")}`);
        return;
      }
      setError(avatarUploadErrorMessage(err));
    } finally {
      setAvatarStage("idle");
      input.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!auth.token || deletingAvatar || avatarStage !== "idle") return;
    setDeletingAvatar(true);
    setAvatarMessage("");
    setError("");
    try {
      const current = await deleteCurrentUserAvatar(auth.token);
      auth.setSessionFromCurrentUserResponse(current);
      setAvatarMessage("Uploaded photo removed.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        auth.clearSession();
        setLocation(`/login?next=${encodeURIComponent("/profile")}`);
        return;
      }
      setError(
        err instanceof ApiError && err.status === 404
          ? profilePhotoUnavailableMessage()
          : err instanceof Error
            ? err.message
            : "Could not remove your profile photo."
      );
    } finally {
      setDeletingAvatar(false);
    }
  };

  const avatarSource = auth.user?.avatar_url || "";
  const avatarInitial =
    auth.user?.display_name?.trim().charAt(0).toUpperCase() || "M";
  const avatarBusy = avatarStage !== "idle" || deletingAvatar;
  const avatarProgressLabel = avatarStageLabel(avatarStage, deletingAvatar);
  const workspaceDisplayName =
    auth.workspace?.type === "personal" && auth.user?.display_name?.trim()
      ? `${auth.user.display_name.trim()}'s Workspace`
      : auth.workspace?.name || "Personal workspace";

  if (!auth.isAuthenticated) return null;

  return (
    <AccountShell
      title="Profile"
      subtitle="Manage your Memova account and connected MCP clients."
    >
      {loading ? (
        <LoadingPanel label="Refreshing profile" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-xl border-[#DCEBF6] bg-white shadow-lg shadow-[#2E5B82]/[0.04]">
            <CardHeader>
              <div className="mb-1 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#DCEAF7] text-2xl font-bold text-[#2E5B82] shadow-[0_8px_24px_rgba(46,91,130,0.16)]">
                    {avatarSource ? (
                      <img
                        key={auth.user?.avatar_version || avatarSource}
                        src={avatarSource}
                        alt="Profile photo"
                        className="h-full w-full object-cover"
                        onError={() => {
                          void auth.refreshUser().catch(() => {
                            setError(
                              "Your profile photo expired. Refresh the page to try again."
                            );
                          });
                        }}
                      />
                    ) : (
                      <span aria-hidden="true">{avatarInitial}</span>
                    )}
                  </div>
                  <label
                    htmlFor="profile-avatar-upload"
                    title="Edit profile photo"
                    aria-disabled={avatarBusy}
                    className={`absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#0F2B3C] text-white shadow-md transition-transform focus-within:ring-2 focus-within:ring-[#6FA8D9] focus-within:ring-offset-2 ${avatarBusy ? "cursor-wait opacity-80" : "cursor-pointer hover:scale-105 hover:bg-[#1A3A5C]"}`}
                  >
                    {avatarBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only">Edit profile photo</span>
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={avatarBusy}
                      onChange={event => void handleAvatarUpload(event)}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#0F2B3C]">
                    Profile photo
                  </div>
                  <div className="mt-1 max-w-[18rem] text-[12px] leading-5 text-[#2E5B82]/55">
                    Optional. Use the pencil button to choose or replace your
                    photo.
                  </div>
                  {auth.user?.avatar_url && (
                    <button
                      type="button"
                      disabled={avatarBusy}
                      onClick={() => void handleDeleteAvatar()}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2E5B82]/65 transition-colors hover:text-[#B45353] disabled:cursor-wait disabled:opacity-50"
                    >
                      {deletingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
              <CardTitle className="text-xl text-[#0F2B3C]">Account</CardTitle>
              <CardDescription className="text-[#2E5B82]/55">
                Your nickname is shown across Memova. A profile photo is
                optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(avatarProgressLabel || avatarMessage) && (
                <p
                  role="status"
                  className="rounded-lg border border-[#D4E9F7] bg-[#F3F8FD] px-3 py-2 text-[12px] font-semibold leading-5 text-[#2E5B82]/70"
                >
                  {avatarProgressLabel || avatarMessage}
                </p>
              )}
              <form onSubmit={handleSaveNickname} className="space-y-3">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/45">
                    Nickname
                  </label>
                  <Input
                    required
                    autoComplete="nickname"
                    maxLength={255}
                    value={nickname}
                    onChange={event => {
                      setNickname(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="What should Memova call you?"
                    className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      !nickname.trim() ||
                      nickname.trim() === (auth.user?.display_name || "")
                    }
                    className="h-10 rounded-lg bg-[#0F2B3C] text-white hover:bg-[#1A3A5C]"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save nickname
                  </Button>
                  {saved && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#278565]">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                </div>
              </form>
              <ProfileField label="Email" value={auth.user?.email || "-"} />
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-xl border-[#DCEBF6] bg-white shadow-lg shadow-[#2E5B82]/[0.04]">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#2E5B82]">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-[#0F2B3C]">
                  Workspace
                </CardTitle>
                <CardDescription className="text-[#2E5B82]/55">
                  MCP clients connect to this Memova workspace after you approve
                  access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileField
                  label="Default workspace"
                  value={workspaceDisplayName}
                />
              </CardContent>
            </Card>

            <a
              href="/connected-clients"
              className="flex items-center justify-between rounded-xl border border-[#DCEBF6] bg-[#0F2B3C] px-5 py-4 text-white shadow-lg shadow-[#2E5B82]/[0.08] transition-colors hover:bg-[#1A3A5C]"
            >
              <span>
                <span className="block text-[13px] font-bold">
                  Connected clients
                </span>
                <span className="mt-1 block text-[12px] text-white/65">
                  View and revoke MCP agent access.
                </span>
              </span>
              <ShieldCheck className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-semibold text-[#B91C1C]">
          {error}
        </p>
      )}
    </AccountShell>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EDF3FA] bg-[#FAFCFF] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/45">
        {label}
      </div>
      <div className="mt-1 break-words text-[14px] font-semibold text-[#0F2B3C]">
        {value}
      </div>
    </div>
  );
}

function avatarStageLabel(
  stage: AvatarUploadStage,
  deleting: boolean
): string {
  if (deleting) return "Removing your uploaded photo…";
  if (stage === "preparing") return "Preparing your photo…";
  if (stage === "reserving") return "Creating a secure upload…";
  if (stage === "uploading") return "Uploading your photo…";
  if (stage === "completing") return "Finishing your profile photo…";
  return "";
}

function avatarUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 413) return "Choose an image smaller than 5 MB.";
    if (error.status === 422) {
      return "That image could not be used. Choose a valid JPEG, PNG, or WebP file.";
    }
    if (error.status === 404) return profilePhotoUnavailableMessage();
    if (error.status === 409) {
      return "That upload expired. Choose the photo again to retry.";
    }
  }
  if (error instanceof Error && error.name === "AvatarUploadExpiredError") {
    return "That upload link expired. Choose the photo again to retry.";
  }
  return error instanceof Error
    ? error.message
    : "Could not save your profile photo.";
}

function profilePhotoUnavailableMessage(): string {
  return "Profile photo editing is not available yet. Your nickname and account are still saved.";
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-[#DCEBF6] bg-white">
      <div className="flex items-center gap-3 text-[13px] font-semibold text-[#2E5B82]/65">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}
