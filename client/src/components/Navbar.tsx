import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, LogOut, UserRound, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shouldSkipInitialMarketingMotion } from "@/seo/seoHandoff";

const DISCORD_COMMUNITY_URL = "https://discord.gg/wAeCmpy86";
const DISCORD_COMMUNITY_QR = "/community/discord-community-qr.png";

const navLinks: Array<{ label: string; href: string; section?: string }> = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Agent Memory", href: "/agent-memory" },
  { label: "Use Cases", href: "/user-cases" },
  { label: "Plugins & MCP", href: "/mcp" },
];

export default function Navbar() {
  const auth = useAuth();
  const accountName = auth.user?.display_name?.trim() || "Memova account";
  const accountInitial = accountName.charAt(0).toUpperCase() || "M";
  const skipInitialMotion = shouldSkipInitialMarketingMotion();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navLinks.map(l => l.section).filter(Boolean) as string[];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!communityOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCommunityOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [communityOpen]);

  return (
    <motion.nav
      initial={skipInitialMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      data-scrolled={scrolled}
      className={`memova-site-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(142,156,199,0.1)] border-b border-[var(--memova-blue)]/8"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/memova-logo-transparent.png"
            alt="Memova Logo"
            className="h-14 sm:h-16 md:h-[72px] w-auto object-contain transition-all duration-200 group-hover:scale-[1.02] group-hover:opacity-90 drop-shadow-sm"
          />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-all duration-250 ${
                link.section && activeSection === link.section
                  ? "text-[var(--memova-navy)] bg-[var(--memova-blue)]/10"
                  : "text-[#637083] hover:text-[var(--memova-navy)] hover:bg-[#F6F9FF]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: CTA + mobile menu */}
        <div className="flex items-center gap-3">
          {auth.isAuthenticated ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <a
                href="/profile"
                aria-label={`Open ${accountName}'s Memova profile`}
                className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#DCE6F4] bg-white/75 py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-[var(--memova-navy)] shadow-sm transition-all hover:bg-white"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--memova-navy)] text-[10px] font-bold text-white">
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
                <span className="max-w-28 truncate">{accountName}</span>
              </a>
              <button
                type="button"
                onClick={() => void auth.logout()}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)] md:inline-flex"
            >
              <UserRound className="h-3.5 w-3.5" />
              Sign in
            </a>
          )}
          <motion.a
            href="/#waitlist"
            data-analytics-event="ios_early_access_click"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`memova-primary-action hidden px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-300 sm:inline-flex ${
              scrolled
                ? "bg-[var(--memova-navy)] text-white shadow-md shadow-[var(--memova-navy)]/10"
                : "bg-[var(--memova-navy)]/90 text-white"
            }`}
          >
            Join iOS Early Access
          </motion.a>
          <motion.button
            type="button"
            onClick={() => setCommunityOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`memova-secondary-action hidden px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-300 lg:inline-flex ${
              scrolled
                ? "bg-[var(--memova-navy)] text-white shadow-md shadow-[var(--memova-navy)]/10"
                : "bg-[var(--memova-navy)]/90 text-white"
            }`}
          >
            Join Community
          </motion.button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <span
              className={`block w-5 h-0.5 bg-[var(--memova-navy)] transition-transform duration-200 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[var(--memova-navy)] transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[var(--memova-navy)] transition-transform duration-200 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          id="mobile-navigation"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="memova-mobile-menu md:hidden bg-white/95 backdrop-blur-xl border-b border-[var(--memova-blue)]/10 px-6 py-4"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-[14px] font-medium rounded-lg transition-all ${
                  link.section && activeSection === link.section
                    ? "text-[var(--memova-navy)] bg-[var(--memova-blue)]/10"
                    : "text-[#637083] hover:text-[var(--memova-navy)] hover:bg-[#F6F9FF]"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#waitlist"
              data-analytics-event="ios_early_access_click"
              onClick={() => setMobileOpen(false)}
              className="memova-primary-action flex min-h-11 items-center justify-center rounded-full bg-[var(--memova-navy)] px-4 text-[14px] font-semibold text-white shadow-sm"
            >
              Join iOS Early Access
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setCommunityOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)]"
            >
              Join Community
            </button>
            {auth.isAuthenticated ? (
              <div className="mt-1 grid gap-1 border-t border-[#E8EEF7] pt-3">
                <a
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-[var(--memova-navy)] transition-all hover:bg-[#F6F9FF]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--memova-navy)] text-[11px] font-bold text-white">
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
                  <span className="truncate">{accountName}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void auth.logout();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] font-medium text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)]"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)]"
              >
                <UserRound className="h-4 w-4" />
                Sign in
              </a>
            )}
          </div>
        </motion.div>
      )}

      {communityOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E2344]/45 px-5 backdrop-blur-md"
          onClick={() => setCommunityOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/70 bg-[#F8FAFF] p-6 text-center shadow-[0_28px_90px_rgba(14,35,68,0.28)] sm:p-8"
            onClick={event => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#6B86E8]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#D6E0F0]/75 blur-3xl" />
            <button
              type="button"
              aria-label="Close community QR code"
              onClick={() => setCommunityOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#455E93] shadow-sm transition hover:bg-white hover:text-[#24365D]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B86E8]">
                Memova Community
              </p>
              <h2
                id="community-dialog-title"
                className="mt-3 font-display text-[28px] font-bold tracking-[-0.025em] text-[#24365D]"
              >
                Join the conversation.
              </h2>
              <p className="mx-auto mt-2 max-w-[280px] text-[13px] font-medium leading-5 text-[#455E93]/75">
                Scan the code or open Discord to meet other early Memova users.
              </p>

              <a
                href={DISCORD_COMMUNITY_URL}
                target="_blank"
                rel="noreferrer"
                className="mx-auto mt-6 block w-fit rounded-[22px] bg-white p-3 shadow-[0_16px_45px_rgba(69,94,147,0.16)] transition hover:-translate-y-0.5"
              >
                <img
                  src={DISCORD_COMMUNITY_QR}
                  alt="QR code for the Memova Discord community"
                  width={240}
                  height={240}
                  className="h-[210px] w-[210px] sm:h-[230px] sm:w-[230px]"
                />
              </a>

              <a
                href={DISCORD_COMMUNITY_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#24365D] px-6 text-[13px] font-bold text-white shadow-lg shadow-[#24365D]/15 transition hover:-translate-y-0.5 hover:bg-[#455E93]"
              >
                Open Discord
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.nav>
  );
}
