import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shouldSkipInitialMarketingMotion } from "@/seo/seoHandoff";

const DISCORD_COMMUNITY_URL = "https://discord.gg/ZTS2XAEax";

const navLinks: Array<{ label: string; href: string; section?: string }> = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Agent Memory", href: "/agent-memory" },
  { label: "Use Cases", href: "/user-cases" },
  { label: "Plugins & MCP", href: "/mcp" },
];

export default function Navbar() {
  const auth = useAuth();
  const skipInitialMotion = shouldSkipInitialMarketingMotion();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <button
              type="button"
              onClick={() => void auth.logout()}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)] md:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
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
          <motion.a
            href={DISCORD_COMMUNITY_URL}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`memova-secondary-action hidden px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-300 lg:inline-flex ${
              scrolled
                ? "bg-[var(--memova-navy)] text-white shadow-md shadow-[var(--memova-navy)]/10"
                : "bg-[var(--memova-navy)]/90 text-white"
            }`}
          >
            Join Community
          </motion.a>

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
            <a
              href={DISCORD_COMMUNITY_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium text-[#637083] transition-all hover:bg-[#F6F9FF] hover:text-[var(--memova-navy)]"
            >
              Join Community
            </a>
            {auth.isAuthenticated ? (
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
    </motion.nav>
  );
}
