import {
  ChevronDown,
  LogIn,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import MemovaBrand from "@/components/MemovaBrand";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AccountShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
};

const navItems = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/connected-clients", label: "Connected clients", icon: ShieldCheck },
];

export default function AccountShell({
  title,
  subtitle,
  children,
  actions,
  compact = false,
}: AccountShellProps) {
  const [location] = useLocation();
  const auth = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountName = auth.user?.display_name?.trim() || "Memova account";
  const accountInitial = accountName.charAt(0).toUpperCase() || "M";

  const handleLogout = async () => {
    setAccountOpen(false);
    await auth.logout();
    window.location.assign("/");
  };

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  return (
    <div className="memova-account-shell flex min-h-screen flex-col bg-[#F7F4EE] text-[#111A30]">
      <header className="sticky top-0 z-40 border-b border-[rgba(36,54,93,0.14)] bg-[#F9F8F5]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1240px] flex-row items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8">
          <a
            href="/"
            aria-label="Memova home"
            className="group flex w-fit items-center gap-3"
          >
            <MemovaBrand />
            <span className="border-l border-[rgba(69,94,147,0.2)] pl-3 text-[11px] font-extrabold tracking-[0.18em] text-[#626A79]">
              ACCOUNT
            </span>
          </a>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "hidden h-10 items-center gap-2 rounded-[10px] border px-3.5 text-[12px] font-bold transition-all duration-200 sm:inline-flex",
                    active
                      ? "border-[#566CE5] bg-[#566CE5] text-white shadow-[0_8px_18px_rgba(86,108,229,0.2)]"
                      : "border-[rgba(69,94,147,0.2)] bg-[#FFFEFA]/85 text-[#455E93] hover:border-[#6B86E8] hover:bg-[#FFFEFA] hover:text-[#111A30]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
            {auth.isAuthenticated ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  aria-label={`Open ${accountName}'s account menu`}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen(open => !open)}
                  className="inline-flex h-10 min-w-0 items-center gap-2 rounded-[11px] border border-transparent bg-transparent py-1 pl-1 pr-2 text-[12px] font-bold text-[#111A30] transition hover:border-[rgba(69,94,147,0.16)] hover:bg-[#FFFEFA]/85 hover:shadow-[0_8px_22px_rgba(17,26,48,0.07)]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#455E93] to-[#566CE5] text-[10px] font-extrabold text-white">
                    {auth.user?.avatar_url ? (
                      <img
                        key={auth.user.avatar_version || auth.user.avatar_url}
                        src={auth.user.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() => void auth.refreshUser().catch(() => {})}
                      />
                    ) : (
                      accountInitial
                    )}
                  </span>
                  <span className="max-w-32 truncate">{accountName}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-[#6B86E8] transition-transform",
                      accountOpen && "rotate-180"
                    )}
                  />
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account"
                    className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-[190px] rounded-[13px] border border-[rgba(69,94,147,0.18)] bg-[#FFFEFA]/95 p-1.5 shadow-[0_22px_54px_rgba(17,26,48,0.14)] backdrop-blur-xl"
                  >
                    <a
                      href="/profile"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex min-h-10 items-center gap-2.5 rounded-[9px] px-2.5 text-[12px] font-bold text-[#455E93] hover:bg-[#EEF1FB] hover:text-[#111A30]"
                    >
                      <UserRound className="h-4 w-4 text-[#6B86E8]" />
                      Profile
                    </a>
                    <a
                      href="/connected-clients"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex min-h-10 items-center gap-2.5 rounded-[9px] px-2.5 text-[12px] font-bold text-[#455E93] hover:bg-[#EEF1FB] hover:text-[#111A30] sm:hidden"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#6B86E8]" />
                      Connected clients
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleLogout()}
                      className="flex min-h-10 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[12px] font-bold text-[#455E93] hover:bg-[#EEF1FB] hover:text-[#111A30]"
                    >
                      <LogOut className="h-4 w-4 text-[#6B86E8]" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-transparent px-3 text-[12px] font-bold text-[#455E93] hover:bg-[#EEF1FB] hover:text-[#111A30]"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </a>
            )}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-[1240px] flex-1 px-5 sm:px-6 lg:px-8",
          compact ? "py-6" : "py-10"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
            compact ? "mb-5" : "mb-8"
          )}
        >
          <div>
            <p
              className={cn(
                "text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#566CE5]",
                compact ? "mb-2" : "mb-3"
              )}
            >
              Memova MCP
            </p>
            <h1
              className={cn(
                "memova-account-heading leading-[1.02] tracking-[-0.025em] text-[#111A30]",
                compact
                  ? "text-[1.9rem] sm:text-[2.4rem]"
                  : "text-[2.1rem] sm:text-[3rem]"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "max-w-2xl text-[14px] leading-6 text-[#626A79]",
                  compact ? "mt-2" : "mt-3"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </div>

        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
