import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Database,
  ExternalLink,
  FolderCheck,
  KeyRound,
  LockKeyhole,
  PlugZap,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  Workflow,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const MCP_ENDPOINT = "https://api.memova.ai/mcp";
const MCP_SCOPES =
  "notes.read,actions.read,actions.write,automation.read,automation.write";
const CODEX_MARKETPLACE = "gxyfred/memova-codex-plugin";

const capabilityCards = [
  {
    icon: Database,
    eyebrow: "Retrieve",
    title: "Bring the right context into the conversation.",
    text: "Search meeting notes, transcripts, Pages, and user-owned knowledge without flattening everything into one prompt.",
    points: ["Source-linked results", "Private knowledge stays editable"],
    tone: "from-blue-500/12 to-cyan-400/5",
  },
  {
    icon: Workflow,
    eyebrow: "Act",
    title: "Turn context into useful, reviewable work.",
    text: "Run final-note workflows, prepare follow-ups, and read or update actions through one permissioned connection.",
    points: ["Reusable workflows", "Agent-side confirmation"],
    tone: "from-indigo-500/12 to-violet-400/5",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Control",
    title: "Keep the boundary visible.",
    text: "OAuth scopes, connected clients, and external actions stay explicit so access can be reviewed or revoked.",
    points: ["OAuth—not copied tokens", "Revoke access anytime"],
    tone: "from-emerald-400/12 to-blue-400/5",
  },
];

const setupSteps = [
  {
    icon: Smartphone,
    title: "Start in Memova",
    text: "Create a new Vault or connect the knowledge base you already own.",
  },
  {
    icon: PlugZap,
    title: "Install the plugin",
    text: "Add the Memova marketplace and install the plugin from Codex.",
  },
  {
    icon: Code2,
    title: "Run @memova setup",
    text: "Complete OAuth in the browser and let Codex prepare the connection.",
  },
  {
    icon: FolderCheck,
    title: "Bind the same Vault",
    text: "Memova verifies the iCloud folder used for future meeting packets.",
  },
];

const permissionGroups = [
  "Read notes",
  "Read and write actions",
  "Read and write automations",
];

const compatibilityRows = [
  {
    name: "Codex",
    status: "Available now",
    detail: "Plugin, guided setup, OAuth MCP, and workflow prompts.",
  },
  {
    name: "Compatible MCP clients",
    status: "Direct connection",
    detail: "Use the Streamable HTTP endpoint with Memova OAuth.",
  },
  {
    name: "More agent surfaces",
    status: "Designed to expand",
    detail: "The same permissioned memory layer can support future plugins.",
  },
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
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFF] text-[var(--memova-navy)]">
      <Navbar />

      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-[#DDE6FF]/80 bg-white py-16 md:py-24 lg:py-28">
          <div className="pointer-events-none absolute -left-32 top-8 h-[32rem] w-[32rem] rounded-full bg-blue-100/45 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 bottom-[-12rem] h-[36rem] w-[36rem] rounded-full bg-violet-100/35 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#EAF0FB_1px,transparent_1px),linear-gradient(to_bottom,#EAF0FB_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-35 [mask-image:radial-gradient(ellipse_75%_75%_at_72%_44%,#000_30%,transparent_78%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                <PlugZap className="h-3.5 w-3.5" />
                Plugins & MCP
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-[2.7rem] font-bold leading-[1.02] tracking-[-0.035em] text-[var(--memova-navy)] sm:text-[3.6rem] lg:text-[4.25rem]">
                Connect Memova to Codex and MCP clients.
              </h1>
              <p className="mt-6 max-w-2xl text-[16px] font-medium leading-7 text-[#637083] md:text-[17px]">
                Give compatible agents permissioned access to the context you
                choose—while your knowledge stays user-owned, editable, and
                reviewable.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#setup"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--memova-navy)] px-6 text-[14px] font-bold text-white shadow-lg shadow-[var(--memova-navy)]/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  View Codex setup
                  <ChevronRight className="h-4 w-4" />
                </a>
                <a
                  href="#direct-mcp"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#DDE6FF] bg-white px-6 text-[14px] font-bold text-[var(--memova-navy)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600"
                >
                  Connect another MCP client
                </a>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E5EBF5] bg-white/75 px-4 py-3.5 text-[13px] font-medium leading-5 text-[#637083] backdrop-blur-sm">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p>
                  Looking for the raw endpoint? It is a machine connection
                  address, not a browser page. A plain{" "}
                  <span className="font-mono text-[12px] font-bold text-[var(--memova-navy)]">
                    memova-mcp ready
                  </span>{" "}
                  response means it is online.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.12,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <ConnectionVisual
                copied={copied}
                onCopy={() => void copyEndpoint()}
              />
            </motion.div>
          </div>
        </section>

        <section className="relative py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                One connection, useful boundaries
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.025em] text-[var(--memova-navy)] md:text-5xl">
                Context becomes an agent workspace.
              </h2>
              <p className="mt-4 text-[15px] font-medium leading-7 text-[#637083]">
                Memova connects what an agent can understand, prepare, and act
                on without hiding where the information came from.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {capabilityCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-[26px] border border-[#DDE6FF] bg-white p-6 shadow-xl shadow-[var(--memova-navy)]/[0.035]"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.tone} opacity-75`}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white text-blue-600 shadow-sm">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-2 text-[21px] font-bold leading-[1.25] tracking-[-0.015em] text-[var(--memova-navy)]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-[14px] font-medium leading-6 text-[#637083]">
                      {card.text}
                    </p>
                    <div className="mt-6 grid gap-2 border-t border-[#E8EEF7] pt-5">
                      {card.points.map(point => (
                        <div
                          key={point}
                          className="flex items-center gap-2 text-[13px] font-semibold text-[#475569]"
                        >
                          <Check className="h-4 w-4 text-blue-500" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="setup"
          className="scroll-mt-24 border-y border-[#DDE6FF]/80 bg-white py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
              <div className="rounded-[30px] border border-[#DDE6FF] bg-[#F8FAFF] p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      Recommended
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.025em] text-[var(--memova-navy)] md:text-4xl">
                      Start with the Codex plugin.
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DDE6FF] bg-white text-blue-600 shadow-sm">
                    <PlugZap className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-[14px] font-medium leading-6 text-[#637083]">
                  The plugin adds guided setup, Memova workflow prompts, and
                  connection diagnostics on top of the same OAuth MCP layer.
                </p>

                <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#102A43] shadow-xl shadow-[#102A43]/10">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                      <Terminal className="h-4 w-4" />
                      Codex
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                      Available now
                    </span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[13px] leading-7 text-[#DCEBFA]">
                    {`codex plugin marketplace add ${CODEX_MARKETPLACE}

# Open /plugins, install Memova,
# start a new thread, then run:
@memova Setup my Memova knowledge base.`}
                  </pre>
                </div>
              </div>

              <div
                id="direct-mcp"
                className="scroll-mt-24 rounded-[30px] border border-[#DDE6FF] bg-white p-6 shadow-xl shadow-[var(--memova-navy)]/[0.04] md:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                      Advanced setup
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-[var(--memova-navy)] md:text-4xl">
                      Direct MCP.
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Server className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-[14px] font-medium leading-6 text-[#637083]">
                  For clients that already support remote Streamable HTTP MCP.
                  The address below is meant to be pasted into a client—not
                  opened as a website.
                </p>

                <EndpointCopyRow
                  copied={copied}
                  onCopy={() => void copyEndpoint()}
                />

                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[#F4F7FC] p-4 font-mono text-[12px] leading-6 text-[#334155]">
                  {`codex mcp add memova --url ${MCP_ENDPOINT}
codex mcp login memova --scopes ${MCP_SCOPES}`}
                </pre>
                <p className="mt-4 flex items-start gap-2 text-[12px] font-medium leading-5 text-[#64748B]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Plain text at the endpoint is expected. It confirms the MCP
                  transport is responding.
                </p>
              </div>
            </div>

            <div className="relative mt-12">
              <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-[#BFD1EA] to-transparent lg:block" />
              <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {setupSteps.map((step, index) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.5, delay: index * 0.07 }}
                    className="rounded-2xl border border-[#E3EAF5] bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DDE6FF] bg-[#F8FAFF] text-blue-600 shadow-sm">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold tracking-[0.15em] text-[#A9B9D8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[16px] font-bold text-[var(--memova-navy)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[13px] font-medium leading-5 text-[#637083]">
                      {step.text}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="pointer-events-none absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-[32px] border border-[#DDE6FF] bg-[#102A43] text-white shadow-2xl shadow-[#102A43]/10">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-white/10 p-7 md:p-10 lg:border-b-0 lg:border-r">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
                    Permissioned by design
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] md:text-5xl">
                    You stay in control.
                  </h2>
                  <p className="mt-4 max-w-xl text-[14px] font-medium leading-6 text-white/65">
                    MCP access is separate from your website session. Every
                    client is visible, every scope is reviewable, and access can
                    be revoked.
                  </p>
                  <a
                    href="/connected-clients"
                    className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-blue-200 transition-colors hover:text-white"
                  >
                    Manage connected clients
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="grid gap-3 p-7 md:grid-cols-2 md:p-10">
                  {[
                    {
                      icon: KeyRound,
                      title: "OAuth login",
                      text: "No manual token copying.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Reviewable access",
                      text: "Scopes remain visible before consent.",
                    },
                    {
                      icon: CheckCircle2,
                      title: "Approval boundary",
                      text: "External actions still require confirmation.",
                    },
                    {
                      icon: LockKeyhole,
                      title: "Reversible",
                      text: "Disconnect a client whenever you choose.",
                    },
                  ].map(item => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.055] p-5"
                    >
                      <item.icon className="h-5 w-5 text-blue-200" />
                      <h3 className="mt-4 text-[15px] font-bold">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] font-medium leading-5 text-white/55">
                        {item.text}
                      </p>
                    </div>
                  ))}
                  <details className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 md:col-span-2">
                    <summary className="cursor-pointer text-[13px] font-bold text-blue-200">
                      Advanced scopes
                    </summary>
                    <p className="mt-3 break-words font-mono text-[12px] leading-5 text-white/55">
                      {permissionGroups.join(" · ")}
                      <br />
                      {MCP_SCOPES.replaceAll(",", " · ")}
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#DDE6FF]/80 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Compatibility
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-[var(--memova-navy)] md:text-5xl">
                  Codex first. MCP wherever it fits.
                </h2>
              </div>
              <p className="max-w-lg text-[14px] font-medium leading-6 text-[#637083]">
                A stable data and permission layer lets Memova add more
                agent-specific workflows without moving your knowledge into a
                new system.
              </p>
            </div>

            <div className="mt-10 grid overflow-hidden rounded-[26px] border border-[#DDE6FF] bg-[#F8FAFF] lg:grid-cols-3">
              {compatibilityRows.map((row, index) => (
                <article
                  key={row.name}
                  className={`p-6 ${
                    index > 0
                      ? "border-t border-[#DDE6FF] lg:border-l lg:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                      {row.status}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[17px] font-bold text-[var(--memova-navy)]">
                    {row.name}
                  </h3>
                  <p className="mt-2 text-[13px] font-medium leading-5 text-[#637083]">
                    {row.detail}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-[26px] bg-gradient-to-r from-blue-50 via-indigo-50/70 to-violet-50 px-6 py-8 text-center sm:flex-row sm:text-left md:px-9">
              <div>
                <h3 className="text-[20px] font-bold text-[var(--memova-navy)]">
                  Start with the setup path that fits your client.
                </h3>
                <p className="mt-2 text-[13px] font-medium text-[#637083]">
                  Use the guided Codex plugin or copy the same MCP endpoint into
                  another compatible client.
                </p>
              </div>
              <a
                href="#setup"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--memova-navy)] px-6 text-[14px] font-bold text-white shadow-lg shadow-[var(--memova-navy)]/10 transition-all hover:-translate-y-0.5"
              >
                Open setup guide
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function ConnectionVisual({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  const nodes = [
    {
      icon: Bot,
      label: "Your agent",
      detail: "Codex or MCP client",
      tone: "bg-violet-50 text-violet-600",
    },
    {
      icon: KeyRound,
      label: "OAuth consent",
      detail: "Review scopes",
      tone: "bg-blue-50 text-blue-600",
    },
    {
      icon: Database,
      label: "Memova Vault",
      detail: "User-owned context",
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#DDE6FF] bg-white/90 p-5 shadow-2xl shadow-[var(--memova-navy)]/[0.07] backdrop-blur-xl md:p-7">
      <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4 border-b border-[#E8EEF7] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
            Connection model
          </p>
          <h2 className="mt-1 text-[16px] font-bold text-[var(--memova-navy)]">
            Context flows through a visible permission gate.
          </h2>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Online
        </div>
      </div>

      <div className="relative mt-7">
        <div className="pointer-events-none absolute left-[15%] right-[15%] top-12 hidden h-px bg-gradient-to-r from-violet-200 via-blue-300 to-emerald-200 sm:block">
          <motion.span
            animate={{ left: ["0%", "94%", "0%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.65)]"
          />
        </div>
        <div className="relative grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start">
          {nodes.map((node, index) => (
            <div key={node.label} className="contents">
              <div className="rounded-2xl border border-[#E3EAF5] bg-white p-4 text-center shadow-sm">
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${node.tone}`}
                >
                  <node.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-[13px] font-bold text-[var(--memova-navy)]">
                  {node.label}
                </div>
                <div className="mt-1 text-[11px] font-medium text-[#7A8798]">
                  {node.detail}
                </div>
              </div>
              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center self-center py-1 text-[#A9B9D8] sm:pt-8">
                  <ChevronRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#DDE6FF] bg-[#F8FAFF] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Machine endpoint · Streamable HTTP
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">
            Transport ready
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-white px-3 py-2.5 text-[12px] font-bold text-[var(--memova-navy)]">
            {MCP_ENDPOINT}
          </code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--memova-navy)] px-4 text-[12px] font-bold text-white transition-all hover:bg-blue-700"
          >
            <Clipboard className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy endpoint"}
          </button>
        </div>
        <p className="mt-3 text-[11px] font-medium leading-5 text-[#64748B]">
          For MCP clients—not a browser page. Plain transport text at this URL
          is expected.
        </p>
      </div>
    </div>
  );
}

function EndpointCopyRow({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[#DDE6FF] bg-[#F8FAFF] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-white px-3 py-2.5 text-[12px] font-bold text-[var(--memova-navy)]">
          {MCP_ENDPOINT}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DDE6FF] bg-white px-4 text-[12px] font-bold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <Clipboard className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy endpoint"}
        </button>
      </div>
    </div>
  );
}
