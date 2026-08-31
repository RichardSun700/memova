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
  const next = useMemo(
    () =>
      normalizeNext(new URLSearchParams(window.location.search).get("next")),
    []
  );

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<LoginMode>("email-code");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewPassword, setReviewPassword] = useState("");
  const [challenge, setChallenge] = useState<EmailLoginStartResponse | null>(
    null
  );
  const [pendingSession, setPendingSession] =
    useState<AuthTokenResponse | null>(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex min-h-screen flex-col bg-[#F7FAFD] text-[#0F2B3C]">
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <a
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[#2E5B82]/65 hover:text-[#0F2B3C]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MEMOVA
          </a>

          <Card className="rounded-xl border-[#DCEBF6] bg-white shadow-xl shadow-[#2E5B82]/[0.05]">
            <CardHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#2E5B82]">
                {pendingSession ? (
                  <UserRound className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </div>
              <CardTitle className="font-serif text-[2rem] font-normal text-[#0F2B3C]">
                {pendingSession
                  ? "What should Memova call you?"
                  : "Sign in to Memova"}
              </CardTitle>
              <CardDescription className="text-[#2E5B82]/55">
                {pendingSession
                  ? "Pick any name you like. We’ll use it to personalize your Memova experience and your Personal Manual."
                  : "Use your email to access profile settings and MCP client authorization."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {pendingSession ? (
                <form onSubmit={handleNickname} className="space-y-4">
                  <Alert className="border-[#D4E9F7] bg-[#F8FBFE]">
                    <CheckCircle2 className="h-4 w-4 text-[#2E5B82]" />
                    <AlertTitle>You’re signed in</AlertTitle>
                    <AlertDescription>
                      Email verified for {pendingSession.user.email}.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/55">
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
                      className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF]"
                    />
                    <p className="mt-2 text-[12px] leading-5 text-[#2E5B82]/55">
                      You can change this anytime and add a profile photo later.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !nickname.trim()}
                    className="h-11 w-full rounded-lg bg-[#0F2B3C] text-white hover:bg-[#1A3A5C]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue to Memova
                  </Button>
                </form>
              ) : mode === "review" ? (
                <form onSubmit={handleReviewLogin} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/55">
                      Review email
                    </label>
                    <Input
                      type="email"
                      required
                      autoComplete="username"
                      value={reviewEmail}
                      onChange={event => setReviewEmail(event.target.value)}
                      placeholder="reviewer@example.com"
                      className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/55">
                      Review password
                    </label>
                    <Input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={reviewPassword}
                      onChange={event => setReviewPassword(event.target.value)}
                      placeholder="Password"
                      className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-[#0F2B3C] text-white hover:bg-[#1A3A5C]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={switchToEmailCode}
                      className="text-[12px] font-semibold text-[#2E5B82]/55 transition-colors hover:text-[#0F2B3C]"
                    >
                      Use email code instead
                    </button>
                  </div>
                </form>
              ) : !challenge ? (
                <form onSubmit={handleStart} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/55">
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-[#0F2B3C] text-white hover:bg-[#1A3A5C]"
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
                      className="text-[12px] font-semibold text-[#2E5B82]/45 transition-colors hover:text-[#0F2B3C]"
                    >
                      Use review credentials
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <Alert className="border-[#D4E9F7] bg-[#F8FBFE]">
                    <CheckCircle2 className="h-4 w-4 text-[#2E5B82]" />
                    <AlertTitle>Code sent</AlertTitle>
                    <AlertDescription>
                      Check {email.trim().toLowerCase()} for your Memova sign-in
                      code.
                    </AlertDescription>
                  </Alert>

                  {challenge.dev_code && (
                    <p className="rounded-lg border border-[#FDE68A] bg-[#FEF3C7]/60 px-3 py-2 text-[12px] font-semibold text-[#B45309]">
                      Dev code: {challenge.dev_code}
                    </p>
                  )}

                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/55">
                      Sign-in code
                    </label>
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={event => setCode(event.target.value)}
                      placeholder="123456"
                      className="h-11 rounded-lg border-[#D4E9F7] bg-[#FAFCFF] tracking-[0.18em]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 flex-1 rounded-lg bg-[#0F2B3C] text-white hover:bg-[#1A3A5C]"
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
                      className="h-11 rounded-lg border-[#D4E9F7] text-[#2E5B82]"
                    >
                      Use another email
                    </Button>
                  </div>
                </form>
              )}

              {error && (
                <p className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-semibold text-[#B91C1C]">
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
