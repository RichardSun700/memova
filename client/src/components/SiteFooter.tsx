import MemovaBrand from "@/components/MemovaBrand";

export default function SiteFooter() {
  return (
    <footer className="memova-site-footer border-t border-[rgba(36,54,93,0.14)] bg-[#FFFEFA]/75 py-7 backdrop-blur-xl">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <a href="/" aria-label="Memova home" className="flex items-center">
            <MemovaBrand compact />
          </a>
          <div className="flex items-center gap-6">
            <a
              href="/support"
              className="text-[11px] font-semibold text-[#626A79] transition-colors hover:text-[#566CE5]"
            >
              Support
            </a>
            <a
              href="mailto:hello@memova.ai"
              className="text-[11px] font-semibold text-[#626A79] transition-colors hover:text-[#566CE5]"
            >
              hello@memova.ai
            </a>
            <a
              href="/privacy"
              className="text-[11px] font-semibold text-[#626A79] transition-colors hover:text-[#566CE5]"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-[11px] font-semibold text-[#626A79] transition-colors hover:text-[#566CE5]"
            >
              Terms
            </a>
          </div>
          <p className="text-[10px] font-semibold text-[#6B86E8]">
            © 2026 Memova
          </p>
        </div>
      </div>
    </footer>
  );
}
