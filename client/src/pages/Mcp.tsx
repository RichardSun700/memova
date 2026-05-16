import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  LockKeyhole,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

const MCP_ENDPOINT = "https://api.memova.ai/mcp";
const MCP_SCOPES =
  "notes.read,actions.read,actions.write,automation.read,automation.write";

const capabilities = [
  "Search meeting notes and transcripts",
  "List recent meetings and note summaries",
  "Read action items from your workspace",
  "Work with pending automation tasks",
  "Write task progress back to Memova",
];

const permissionGroups = [
  "Read notes",
  "Read and write actions",
  "Read and write automations",
];

const setupRows = [
  { label: "Name", value: "memova" },
  { label: "Transport", value: "Streamable HTTP / HTTP MCP" },
  { label: "URL", value: MCP_ENDPOINT },
  { label: "Auth", value: "OAuth" },
];

export default function Mcp() {
  const [copied, setCopied] = useState(false);

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(MCP_ENDPOINT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

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

      <main>
        <section className="border-b border-[#E8F0F8]/70 bg-gradient-to-b from-[#EDF5FC]/70 to-[#FAFCFF] py-16 md:py-24">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#6FA8D9]">
                  Remote MCP beta
                </p>
                <h1 className="max-w-3xl font-serif text-[2.4rem] leading-[1.05] tracking-[-0.01em] text-[#0F2B3C] sm:text-[3.4rem]">
                  Connect Memova to your AI agent.
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#2E5B82]/60 md:text-[16px]">
                  Use Codex, Claude, Cursor, or any compatible MCP client to
                  read your Memova notes, find action items, and update task
                  progress with your approval.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#setup"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#0F2B3C] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#1A3A5C]"
                  >
                    View setup
                  </a>
                  <a
                    href="/connected-clients"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#D4E9F7] bg-white px-6 text-[13px] font-semibold text-[#2E5B82] transition-colors hover:bg-[#EDF5FC]"
                  >
                    Manage clients
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-[#DCEBF6] bg-white p-5 shadow-xl shadow-[#2E5B82]/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#2E5B82]">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2E5B82]/45">
                      MCP endpoint
                    </div>
                    <div className="text-[15px] font-bold text-[#0F2B3C]">
                      {MCP_ENDPOINT}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void copyEndpoint()}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#D4E9F7] bg-[#F8FBFE] text-[13px] font-semibold text-[#2E5B82] transition-colors hover:bg-[#EDF5FC]"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy endpoint"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6FA8D9]">
                  What it can do
                </p>
                <h2 className="font-serif text-[2rem] leading-[1.1] text-[#0F2B3C] md:text-[2.8rem]">
                  Your meeting memory, available inside your agent.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-[#EDF3FA] bg-white px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E5B82]" />
                    <span className="text-[13px] font-semibold leading-5 text-[#0F2B3C]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="setup" className="border-y border-[#E8F0F8]/70 bg-white py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6FA8D9]">
                  Setup
                </p>
                <h2 className="font-serif text-[2rem] leading-[1.1] text-[#0F2B3C] md:text-[2.8rem]">
                  Add Memova once, then sign in with OAuth.
                </h2>
                <p className="mt-4 text-[14px] leading-6 text-[#2E5B82]/60">
                  The same remote MCP endpoint works across compatible clients.
                  Memova opens a browser consent flow, so you do not need to
                  copy or paste tokens.
                </p>
                <div className="mt-6 grid gap-2">
                  {setupRows.map(row => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[120px_1fr] gap-3 rounded-lg border border-[#EDF3FA] bg-[#FAFCFF] px-4 py-3 text-[13px]"
                    >
                      <span className="font-bold uppercase tracking-[0.12em] text-[#2E5B82]/45">
                        {row.label}
                      </span>
                      <span className="break-words font-semibold text-[#0F2B3C]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#DCEBF6] bg-[#0F2B3C] p-5 text-white shadow-xl shadow-[#2E5B82]/[0.08]">
                <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-white/55">
                  <Terminal className="h-4 w-4" />
                  Codex
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/25 p-4 text-[12px] leading-6 text-[#DCEBF6]">
{`codex mcp add memova --url ${MCP_ENDPOINT}
codex mcp login memova --scopes ${MCP_SCOPES}`}
                </pre>
                <p className="mt-4 text-[12px] leading-5 text-white/55">
                  In other clients, choose Streamable HTTP or HTTP MCP, use the
                  same URL, and select OAuth when prompted.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-xl border border-[#DCEBF6] bg-white p-6 shadow-lg shadow-[#2E5B82]/[0.04]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#2E5B82]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-[1.8rem] leading-[1.1] text-[#0F2B3C]">
                  Permissions are grouped for review.
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {permissionGroups.map(permission => (
                    <span
                      key={permission}
                      className="inline-flex items-center gap-2 rounded-full border border-[#D4E9F7] bg-[#F8FBFE] px-3 py-2 text-[13px] font-semibold text-[#0F2B3C]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2E5B82]" />
                      {permission}
                    </span>
                  ))}
                </div>
                <details className="mt-5 rounded-lg border border-[#EDF3FA] bg-[#FAFCFF] px-4 py-3">
                  <summary className="cursor-pointer text-[13px] font-semibold text-[#2E5B82]">
                    Advanced scopes
                  </summary>
                  <p className="mt-3 break-words text-[12px] leading-5 text-[#2E5B82]/60">
                    notes.read actions.read actions.write automation.read
                    automation.write
                  </p>
                </details>
              </div>

              <div className="rounded-xl border border-[#DCEBF6] bg-white p-6 shadow-lg shadow-[#2E5B82]/[0.04]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#2E5B82]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-[1.8rem] leading-[1.1] text-[#0F2B3C]">
                  You stay in control.
                </h2>
                <div className="mt-5 grid gap-3 text-[13px] font-semibold leading-5 text-[#0F2B3C]">
                  {[
                    "OAuth login, no manual token copying",
                    "MCP tokens are separate from website login",
                    "Revoke clients anytime from Connected Clients",
                    "External actions still require your agent-side confirmation",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E5B82]" />
                      {item}
                    </div>
                  ))}
                </div>
                <a
                  href="/connected-clients"
                  className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-[#2E5B82] transition-colors hover:text-[#0F2B3C]"
                >
                  Manage connected clients
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
