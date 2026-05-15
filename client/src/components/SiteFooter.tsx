export default function SiteFooter() {
  return (
    <footer className="border-t border-[#E8F0F8]/60 bg-white/70 py-8 backdrop-blur-xl">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <img
              alt="MEMOVA"
              className="h-[1.6rem] w-[4.8rem] shrink-0 object-cover object-[50%_69%] opacity-80 mix-blend-multiply"
              src="/manus-storage/memova_logo_0eb30acc.png"
            />
            <span className="text-[12px] font-bold tracking-[0.15em] text-[#2E5B82]/50">
              MEMOVA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:hello@memova.ai"
              className="text-[11px] font-medium text-[#2E5B82]/40 transition-colors hover:text-[#2E5B82]"
            >
              hello@memova.ai
            </a>
            <a
              href="#"
              className="text-[11px] font-medium text-[#2E5B82]/40 transition-colors hover:text-[#2E5B82]"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[11px] font-medium text-[#2E5B82]/40 transition-colors hover:text-[#2E5B82]"
            >
              Terms
            </a>
          </div>
          <p className="text-[10px] font-medium text-[#2E5B82]/30">
            © 2026 Memova
          </p>
        </div>
      </div>
    </footer>
  );
}
