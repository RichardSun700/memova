import SiteFooter from "@/components/SiteFooter";
import { ArrowLeft, ExternalLink, Mail, ShieldCheck, Wrench } from "lucide-react";
import { useEffect } from "react";

const SUPPORT_EMAIL = "hello@memova.ai";

const supportTopics = [
  {
    title: "Plugin and MCP help",
    description:
      "Tell us which client you use, what you expected, and the exact error message. Do not send passwords, API keys, access tokens, or private conversation content.",
    icon: Wrench,
  },
  {
    title: "Account and privacy requests",
    description:
      "Contact us from the email address associated with your Memova account for access, correction, export, or deletion requests.",
    icon: ShieldCheck,
  },
];

export default function Support() {
  useEffect(() => {
    document.title = "Support | Memova";
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-[#0F2B3C]">
      <header className="border-b border-[#E8F0F8]/70 bg-white/85 backdrop-blur-xl">
        <div className="container flex min-h-[64px] items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5">
            <img
              alt="MEMOVA"
              className="h-[1.8rem] w-[5.6rem] shrink-0 object-cover object-[50%_69%] mix-blend-multiply"
              src="/manus-storage/memova_logo_0eb30acc.png"
            />
            <span className="text-[13px] font-bold tracking-[0.18em] text-[#0F2B3C]">
              MEMOVA
            </span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#2E5B82]/65 transition-colors hover:text-[#0F2B3C]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
        </div>
      </header>

      <main className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#3366FF]">
              Memova Support
            </p>
            <h1 className="mt-3 font-serif text-[2.5rem] leading-tight text-[#0F2B3C] md:text-[3.4rem]">
              How can we help?
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#2E5B82]/75">
              For account, Memova Plugin, MCP, knowledge-base, privacy, or security questions,
              email our support team. The page is public and does not require a Memova login.
            </p>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Memova%20support%20request`}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#BFD7EE] bg-white px-5 py-5 shadow-xl shadow-[#2E5B82]/[0.04] transition-colors hover:bg-[#F7FBFF] sm:px-6"
          >
            <span className="flex items-center gap-4">
              <span className="rounded-full bg-[#EAF2FF] p-3 text-[#3366FF]">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/50">
                  Email support
                </span>
                <span className="mt-1 block text-[17px] font-bold text-[#0F2B3C]">
                  {SUPPORT_EMAIL}
                </span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-[#2E5B82]/45" />
          </a>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {supportTopics.map(({ title, description, icon: Icon }) => (
              <section
                key={title}
                className="rounded-xl border border-[#DCEBF6] bg-white p-6 shadow-lg shadow-[#2E5B82]/[0.03]"
              >
                <Icon className="h-5 w-5 text-[#3366FF]" />
                <h2 className="mt-4 text-[17px] font-bold text-[#0F2B3C]">{title}</h2>
                <p className="mt-3 text-[14px] leading-6 text-[#2E5B82]/75">{description}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-xl border border-[#DCEBF6] bg-[#F4F9FD] p-6">
            <h2 className="text-[17px] font-bold text-[#0F2B3C]">Self-service links</h2>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[14px] font-semibold text-[#2E5B82]">
              <a className="hover:text-[#0F2B3C]" href="/connected-clients">
                Connected clients
              </a>
              <a className="hover:text-[#0F2B3C]" href="/privacy">
                Privacy Policy
              </a>
              <a className="hover:text-[#0F2B3C]" href="/terms">
                Terms of Service
              </a>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
