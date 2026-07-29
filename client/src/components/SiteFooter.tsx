export default function SiteFooter() {
  return (
    <footer className="memova-site-footer border-t border-[#DDE6FF] bg-[#F6F9FF]/90 py-8 backdrop-blur-xl">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <img
              alt="MEMOVA"
              className="h-9 w-auto max-w-[112px] shrink-0 object-contain opacity-80"
              src="/memova-logo-transparent.png"
            />
            <span className="text-[12px] font-bold tracking-[0.15em] text-[var(--memova-navy)]/60">
              MEMOVA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:hello@memova.ai"
              className="text-[11px] font-medium text-[var(--memova-muted)] transition-colors hover:text-[var(--memova-electric)]"
            >
              hello@memova.ai
            </a>
            <a
              href="/privacy"
              className="text-[11px] font-medium text-[var(--memova-muted)] transition-colors hover:text-[var(--memova-electric)]"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[11px] font-medium text-[var(--memova-muted)] transition-colors hover:text-[var(--memova-electric)]"
            >
              Terms
            </a>
          </div>
          <p className="text-[10px] font-medium text-[var(--memova-blue)]">
            © 2026 Memova
          </p>
        </div>
      </div>
    </footer>
  );
}
