import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";
import { useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import MemovaBrand from "@/components/MemovaBrand";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ApiError,
  loginWithReviewCredentials,
  startEmailLogin,
  updateCurrentUserProfile,
  verifyEmailLogin,
  type AuthTokenResponse,
  type EmailLoginStartResponse,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type LoginMode = "email-code" | "review";

export default function Login() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const previewState = useMemo(
    () =>
      import.meta.env.DEV
        ? new URLSearchParams(window.location.search).get("preview_state") || ""
        : "",
    []
  );
  const next = useMemo(
    () =>
      normalizeNext(new URLSearchParams(window.location.search).get("next")),
    []
  );

  const [email, setEmail] = useState(
    previewState === "code" ? "alex@example.com" : ""
  );
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<LoginMode>(
    previewState === "review" ? "review" : "email-code"
  );
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewPassword, setReviewPassword] = useState("");
  const [challenge, setChallenge] = useState<EmailLoginStartResponse | null>(
    previewState === "code"
      ? {
          challenge_id: "design-preview",
          expires_at: "2099-01-01T00:00:00.000Z",
          delivery_channel: "email",
          dev_code: null,
        }
      : null
  );
  const [pendingSession, setPendingSession] =
    useState<AuthTokenResponse | null>(
      previewState === "nickname"
        ? {
            access_token: "design-preview",
            token_type: "bearer",
            expires_at: "2099-01-01T00:00:00.000Z",
            user: {
              id: "design-preview",
              email: "alex@example.com",
              display_name: null,
              auth_provider: "email",
            },
            default_workspace: {
              id: "design-preview",
              name: "Personal workspace",
              slug: "design-preview",
              type: "personal",
            },
          }
        : null
    );
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    previewState === "error"
      ? "That code has expired. Request a new one and try again."
      : ""
  );

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.session) return;

    if (!auth.user?.display_name?.trim()) {
      setPendingSession({
        ...auth.session,
        token_type: "bearer",
      });
      return;
    }

    setLocation(next);
  }, [
    auth.isAuthenticated,
    auth.session,
    auth.user?.display_name,
    next,
    setLocation,
  ]);

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await startEmailLogin(email);
      setChallenge(response);
      setCode(response.dev_code || "");
    } catch (err) {
      setError(errorMessage(err, "Could not send a sign-in code."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challenge) return;
    setError("");
    setLoading(true);
    try {
      const response = await verifyEmailLogin(
        challenge.challenge_id,
        code.trim()
      );
      continueAfterVerification(response);
    } catch (err) {
      setError(errorMessage(err, "That code did not work."));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginWithReviewCredentials(
        reviewEmail.trim(),
        reviewPassword
      );
      continueAfterVerification(response);
    } catch (err) {
      setError(reviewLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const continueAfterVerification = (response: AuthTokenResponse) => {
    if (!response.user.display_name?.trim()) {
      setPendingSession(response);
      setNickname("");
      return;
    }
    auth.setSessionFromTokenResponse(response);
    setLocation(next);
  };

  const handleNickname = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingSession) return;
    const normalizedNickname = nickname.trim();
    if (!normalizedNickname) {
      setError("Add the name you'd like Memova to use.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const current = await updateCurrentUserProfile(
        pendingSession.access_token,
        normalizedNickname
      );
      auth.setSessionFromTokenResponse({
        ...pendingSession,
        user: current.user,
        default_workspace: current.default_workspace,
      });
      setPendingSession(null);
      setLocation(next);
    } catch (err) {
      setError(
        errorMessage(
          err,
          "We couldn't save your nickname just yet. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToEmailCode = () => {
    setMode("email-code");
    setError("");
    setReviewPassword("");
  };

  const switchToReview = () => {
    setMode("review");
    setError("");
    setChallenge(null);
    setCode("");
  };

  return (
    <div className="memova-account-shell flex min-h-screen flex-col bg-[#F7F4EE] text-[#111A30]">
      <main className="mx-auto flex w-full max-w-[1240px] flex-1 items-center justify-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-5 flex items-center justify-between gap-4">
            <a href="/" aria-label="Memova home" className="group inline-flex">
              <MemovaBrand />
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#626A79] transition-colors hover:text-[#566CE5]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Memova
            </a>
          </div>

          <Card className="gap-0 overflow-hidden rounded-[18px] border-[rgba(36,54,93,0.14)] bg-[#FFFEFA] py-0 shadow-[0_24px_70px_rgba(17,26,48,0.09)]">
            <div
              className="h-1 bg-[var(--memova-brand-gradient)]"
              aria-hidden="true"
            />
            <CardHeader className="px-6 pt-6 sm:px-7 sm:pt-7">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-[11px] bg-[#EEF1FB] text-[#566CE5] ring-1 ring-[rgba(69,94,147,0.16)]">
                {pendingSession ? (
                  <UserRound className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </div>
              <CardTitle className="memova-account-heading text-[2rem] font-normal leading-[1.08] tracking-[-0.025em] text-[#111A30]">
                {pendingSession
                  ? "What should Memova call you?"
                  : "Sign in to Memova"}
              </CardTitle>
              <CardDescription className="text-[13px] leading-5 text-[#626A79]">
                {pendingSession
                  ? "Pick any name you like. We’ll use it to personalize your Memova experience and your Personal Manual."
                  : "Use your email to access profile settings and MCP client authorization."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-7 sm:px-7">
              {pendingSession ? (
                <form onSubmit={handleNickname} className="space-y-4">
                  <Alert className="border-[#D6E8DE] bg-[#F2F8F5] text-[#397D5C]">
                    <CheckCircle2 className="h-4 w-4 text-[#397D5C]" />
                    <AlertTitle>You’re signed in</AlertTitle>
                    <AlertDescription>
                      Email verified for {pendingSession.user.email}.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B86E8]">
                      Nickname
                    </label>
                    <Input
                      required
                      autoFocus
                      autoComplete="nickname"
                      maxLength={255}
                      value={nickname}
                      onChange={event => setNickname(event.target.value)}
                      placeholder="Your nickname"
                      className="h-11 rounded-[10px] border-[#C5CEE1] bg-[#FAF8F3] text-[#111A30] focus-visible:border-[#566CE5] focus-visible:ring-[#566CE5]/15"
                    />
                    <p className="mt-2 text-[12px] leading-5 text-[#626A79]">
                      You can change this anytime and add a profile photo later.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !nickname.trim()}
                    className="h-11 w-full rounded-[10px] bg-[#566CE5] text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(86,108,229,0.22)] hover:bg-[#455E93]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue to Memova
                  </Button>
                </form>
              ) : mode === "review" ? (
                <form onSubmit={handleReviewLogin} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B86E8]">
                      Review email
                    </label>
                    <Input
                      type="email"
                      required
                      autoComplete="username"
                      value={reviewEmail}
                      onChange={event => setReviewEmail(event.target.value)}
                      placeholder="reviewer@example.com"
                      className="h-11 rounded-[10px] border-[#C5CEE1] bg-[#FAF8F3] text-[#111A30] focus-visible:border-[#566CE5] focus-visible:ring-[#566CE5]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B86E8]">
                      Review password
                    </label>
                    <Input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={reviewPassword}
                      onChange={event => setReviewPassword(event.target.value)}
                      placeholder="Password"
                      className="h-11 rounded-[10px] border-[#C5CEE1] bg-[#FAF8F3] text-[#111A30] focus-visible:border-[#566CE5] focus-visible:ring-[#566CE5]/15"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-[10px] bg-[#566CE5] text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(86,108,229,0.22)] hover:bg-[#455E93]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={switchToEmailCode}
                      className="text-[12px] font-bold text-[#6B86E8] transition-colors hover:text-[#566CE5]"
                    >
                      Use email code instead
                    </button>
                  </div>
                </form>
              ) : !challenge ? (
                <form onSubmit={handleStart} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B86E8]">
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-11 rounded-[10px] border-[#C5CEE1] bg-[#FAF8F3] text-[#111A30] focus-visible:border-[#566CE5] focus-visible:ring-[#566CE5]/15"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-[10px] bg-[#566CE5] text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(86,108,229,0.22)] hover:bg-[#455E93]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Send code
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={switchToReview}
                      className="text-[12px] font-bold text-[#6B86E8] transition-colors hover:text-[#566CE5]"
                    >
                      Use review credentials
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <Alert className="border-[#D6E8DE] bg-[#F2F8F5] text-[#397D5C]">
                    <CheckCircle2 className="h-4 w-4 text-[#397D5C]" />
                    <AlertTitle>Code sent</AlertTitle>
                    <AlertDescription>
                      Check {email.trim().toLowerCase()} for your Memova sign-in
                      code.
                    </AlertDescription>
                  </Alert>

                  {challenge.dev_code && (
                    <p className="rounded-[10px] border border-[#E9D8B5] bg-[#FFF9EC] px-3 py-2 text-[12px] font-bold text-[#7A5622]">
                      Dev code: {challenge.dev_code}
                    </p>
                  )}

                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B86E8]">
                      Sign-in code
                    </label>
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={event => setCode(event.target.value)}
                      placeholder="123456"
                      className="h-11 rounded-[10px] border-[#C5CEE1] bg-[#FAF8F3] tracking-[0.18em] text-[#111A30] focus-visible:border-[#566CE5] focus-visible:ring-[#566CE5]/15"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 flex-1 rounded-[10px] bg-[#566CE5] text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(86,108,229,0.22)] hover:bg-[#455E93]"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        setChallenge(null);
                        setCode("");
                        setError("");
                      }}
                      className="h-11 rounded-[10px] border-[#C5CEE1] text-[#455E93] hover:bg-[#EEF1FB] hover:text-[#111A30]"
                    >
                      Use another email
                    </Button>
                  </div>
                </form>
              )}

              {error && (
                <p className="mt-4 rounded-[10px] border border-[#F1C9C9] bg-[#FFF5F5] px-3 py-2 text-[12px] font-bold text-[#A63B3B]">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function normalizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//"))
    return "/profile";
  return next;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function reviewLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 && error.code === "auth.invalid_credentials") {
      return "These review credentials didn't work.";
    }
    if (error.status === 404 && error.code === "resource.not_found") {
      return "Review login isn't available right now.";
    }
  }
  return errorMessage(error, "Could not sign in with review credentials.");
}
