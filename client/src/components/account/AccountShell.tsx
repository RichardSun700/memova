import { LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
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
  const [location, setLocation] = useLocation();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7FAFD] text-[#0F2B3C]">
      <header className="border-b border-[#DCEBF6] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <img
              alt="MEMOVA"
              className="h-[1.7rem] w-[5.2rem] shrink-0 object-cover object-[50%_69%] mix-blend-multiply"
              src="/manus-storage/memova_logo_0eb30acc.png"
            />
            <span className="text-[12px] font-bold tracking-[0.16em] text-[#2E5B82]/70">
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
                    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-semibold transition-colors",
                    active
                      ? "border-[#0F2B3C] bg-[#0F2B3C] text-white"
                      : "border-[#D4E9F7] bg-white text-[#2E5B82] hover:bg-[#EDF5FC]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
            {auth.isAuthenticated ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 text-[13px] font-semibold text-[#2E5B82]/70 hover:bg-[#EDF5FC]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            ) : (
              <a
                href="/login"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 text-[13px] font-semibold text-[#2E5B82]/70 hover:bg-[#EDF5FC]"
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
          "mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8",
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
                "text-[11px] font-bold uppercase tracking-[0.22em] text-[#6FA8D9]",
                compact ? "mb-2" : "mb-3"
              )}
            >
              Memova MCP
            </p>
            <h1
              className={cn(
                "font-serif leading-[1.05] tracking-[-0.01em] text-[#0F2B3C]",
                compact ? "text-[1.9rem] sm:text-[2.4rem]" : "text-[2.1rem] sm:text-[3rem]"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "max-w-2xl text-[14px] leading-6 text-[#2E5B82]/60",
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
