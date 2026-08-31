import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  logoutSession,
  type AuthTokenResponse,
  type AuthUser,
  type AuthWorkspace,
  type CurrentUserResponse,
} from "@/lib/api";

const STORAGE_KEY = "memova.auth.v1";

export type AuthSession = {
  access_token: string;
  expires_at: string;
  user: AuthUser;
  default_workspace: AuthWorkspace;
};

type AuthContextValue = {
  session: AuthSession | null;
  token: string | null;
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  isAuthenticated: boolean;
  setSessionFromTokenResponse: (response: AuthTokenResponse) => void;
  setSessionFromCurrentUserResponse: (response: CurrentUserResponse) => void;
  refreshUser: () => Promise<void>;
  clearSession: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() =>
    readStoredSession()
  );
  const hydratedTokenRef = useRef<string | null>(null);

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    setSessionState(nextSession);
    if (nextSession) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessionWithoutTemporaryAvatarUrl(nextSession))
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setSessionFromTokenResponse = useCallback(
    (response: AuthTokenResponse) => {
      persistSession({
        access_token: response.access_token,
        expires_at: response.expires_at,
        user: response.user,
        default_workspace: response.default_workspace,
      });
    },
    [persistSession]
  );

  const clearSession = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const setSessionFromCurrentUserResponse = useCallback(
    (response: CurrentUserResponse) => {
      if (!session) return;
      persistSession({
        ...session,
        user: response.user,
        default_workspace: response.default_workspace,
      });
    },
    [persistSession, session]
  );

  const refreshUser = useCallback(async () => {
    if (!session?.access_token) return;
    const current = await getCurrentUser(session.access_token);
    persistSession({
      ...session,
      user: current.user,
      default_workspace: current.default_workspace,
    });
  }, [persistSession, session]);

  useEffect(() => {
    const token = session?.access_token;
    if (!token || hydratedTokenRef.current === token) return;
    hydratedTokenRef.current = token;
    void refreshUser().catch(() => {
      // Keep the stored session usable when profile hydration is unavailable.
    });
  }, [refreshUser, session?.access_token]);

  useEffect(() => {
    const expiresMs = Date.parse(session?.user.avatar_url_expires_at || "");
    if (!Number.isFinite(expiresMs)) return;
    const refreshDelay = Math.max(
      60_000,
      expiresMs - Date.now() - 60_000
    );
    const timer = window.setTimeout(() => {
      void refreshUser().catch(() => {
        // Image error handling can retry if the scheduled refresh fails.
      });
    }, refreshDelay);
    return () => window.clearTimeout(timer);
  }, [refreshUser, session?.user.avatar_url_expires_at]);

  const logout = useCallback(async () => {
    const token = session?.access_token;
    clearSession();
    if (token) {
      try {
        await logoutSession(token);
      } catch {
        // Local logout should still complete even if the network request fails.
      }
    }
  }, [clearSession, session?.access_token]);

  const isAuthenticated = isUsableAuthSession(session);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      token: isAuthenticated ? session?.access_token || null : null,
      user: isAuthenticated ? session?.user || null : null,
      workspace: isAuthenticated ? session?.default_workspace || null : null,
      isAuthenticated,
      setSessionFromTokenResponse,
      setSessionFromCurrentUserResponse,
      refreshUser,
      clearSession,
      logout,
    }),
    [
      clearSession,
      isAuthenticated,
      logout,
      refreshUser,
      session,
      setSessionFromCurrentUserResponse,
      setSessionFromTokenResponse,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

function sessionWithoutTemporaryAvatarUrl(session: AuthSession): AuthSession {
  return {
    ...session,
    user: {
      ...session.user,
      avatar_url: null,
      avatar_url_expires_at: null,
    },
  };
}

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isUsableAuthSession(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function isUsableAuthSession(
  value: unknown,
  now = Date.now()
): value is AuthSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<AuthSession>;
  const expiresMs = Date.parse(session.expires_at || "");
  return Boolean(
    session.access_token?.trim() &&
      session.user?.id?.trim() &&
      Number.isFinite(expiresMs) &&
      expiresMs > now
  );
}
