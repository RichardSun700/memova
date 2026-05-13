import { useEffect, useRef, useState } from "react";
import {
  PenLine,
  Sparkles,
  CircleCheck,
  Send,
  ArrowRight,
  Mic,
  FileText,
  Mail,
  Calendar,
  ListChecks,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Intersection Observer hook for scroll animations
   ───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────────────────────
   Section Label component
   ───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.25em] text-[#6FA8D9] uppercase mb-5">
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────
   MEMOVA Badge (center divider between columns)
   ───────────────────────────────────────────── */
function MemovaBadge() {
  return (
    <div className="flex flex-col items-center justify-center py-4 lg:py-0 lg:px-2">
      <div className="relative">
        <div className="absolute inset-0 bg-[#6FA8D9]/20 rounded-full blur-xl scale-150" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#2E5B82] to-[#6FA8D9] flex items-center justify-center shadow-lg shadow-[#2E5B82]/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-2 text-[10px] font-bold tracking-[0.15em] text-[#6FA8D9]/60 uppercase">
        MEMOVA
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Workflow Preview Section (the target section to modify)
   ───────────────────────────────────────────── */
function WorkflowPreviewSection() {
  const { ref, inView } = useInView(0.1);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Stagger animation steps
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 8; i++) {
      timers.push(setTimeout(() => setAnimStep(i), i * 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section ref={ref} className="py-28 md:py-40 bg-white overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <SectionLabel>Workflow Preview</SectionLabel>
          <h2
            className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(24px)",
              transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            Your messy notes.
            <br />
            Confirmed actions in seconds.
          </h2>
          <p
            className="text-[15px] text-[#2E5B82]/45 font-light mt-4 max-w-lg mx-auto"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(24px)",
              transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.1s",
            }}
          >
            MEMOVA reads your shorthand and meeting transcript — then turns them
            into calendar events, email drafts, and a focused daily plan.
          </p>
        </div>

        {/* Two-column before / after */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-start max-w-5xl mx-auto">
          {/* ─── LEFT: Messy Notes ─── */}
          <div>
            <div className="text-center mb-4">
              <span className="text-[12px] font-medium text-[#2E5B82]/50 tracking-wide">
                Your notes + transcript
              </span>
            </div>
            <div
              className="relative rounded-2xl bg-white border border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.04] overflow-hidden"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "scale(0.95)",
                transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s",
              }}
            >
              {/* Window chrome */}
              <div className="px-4 py-3 border-b border-[#F0F4F8] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>

              <div className="p-6 font-mono text-[13px] leading-relaxed">
                <h4 className="text-[17px] font-bold text-[#0F2B3C] mb-4 font-sans">
                  Q4 Planning Sync
                </h4>

                {/* Messy shorthand notes */}
                <div className="space-y-1 text-[#2E5B82]/70">
                  <p>budget??</p>
                  <p>Fred approval</p>
                  <p>Nov 15?</p>
                  <p>PR deck</p>
                  <p>GitHub upload</p>
                  <p>manager feedback</p>
                  <p>next steps</p>
                </div>

                {/* Transcript snippets */}
                <div className="mt-5 pt-4 border-t border-[#E8F0F8]">
                  <p className="text-[11px] font-semibold text-[#2E5B82]/40 uppercase tracking-wide mb-2 font-sans">
                    Transcript snippets
                  </p>
                  <div className="space-y-2 text-[12px] text-[#2E5B82]/55 italic">
                    <p>"Fred said budget approval is needed before Friday."</p>
                    <p>"Let's do the launch sync on Nov 15."</p>
                    <p>
                      "PR deck should be uploaded to GitHub after final edits."
                    </p>
                    <p>"Ask the manager for feedback before sending."</p>
                  </div>
                </div>

                {/* Attached files */}
                <div className="mt-5 pt-4 border-t border-[#E8F0F8]">
                  <p className="text-[11px] font-semibold text-[#2E5B82]/40 uppercase tracking-wide mb-2 font-sans">
                    Attached files
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[12px] text-[#2E5B82]/60">
                      <div className="w-6 h-6 rounded bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center text-[8px] font-bold">
                        PDF
                      </div>
                      <span>PR_deck_v2.pdf</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#2E5B82]/60">
                      <div className="w-6 h-6 rounded bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[8px] font-bold">
                        MD
                      </div>
                      <span>Q4_roadmap.md</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#2E5B82]/60">
                      <div className="w-6 h-6 rounded bg-[#FEF3C7] text-[#B45309] flex items-center justify-center text-[8px] font-bold">
                        PNG
                      </div>
                      <span>Budget_notes.png</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── CENTER: Arrow / Badge ─── */}
          <div className="flex flex-col items-center justify-center py-6 lg:py-0 lg:px-6 self-center">
            <div
              className="relative"
              style={{
                opacity: inView ? 1 : 0.3,
                transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.4s",
              }}
            >
              <div
                className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${inView ? "bg-[#6FA8D9]/30 scale-150" : "bg-transparent"}`}
              />
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${inView ? "bg-gradient-to-br from-[#2E5B82] to-[#6FA8D9] animate-pulse-glow" : "bg-[#E8F0F8] shadow-none"}`}
              >
                <Sparkles
                  className={`w-5 h-5 transition-colors duration-500 ${inView ? "text-white" : "text-[#6FA8D9]"}`}
                />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6FA8D9]/40 mt-2 rotate-90 lg:rotate-0" />
          </div>

          {/* ─── RIGHT: MEMOVA Enhanced ─── */}
          <div>
            <div className="text-center mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2E5B82]" />
              <span className="text-[12px] font-semibold text-[#2E5B82] tracking-wide">
                MEMOVA enhanced
              </span>
            </div>
            <div
              className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-xl shadow-[#2E5B82]/[0.06] overflow-hidden"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "scale(0.95)",
                transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.3s",
              }}
            >
              {/* Window chrome */}
              <div className="px-4 py-3 border-b border-[#F0F4F8] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>

              <div className="p-6">
                <h4 className="text-[17px] font-bold text-[#0F2B3C] mb-5 font-sans">
                  Q4 Planning Sync
                </h4>

                {/* Detected Context */}
                <div
                  className="mb-4"
                  style={{
                    opacity: animStep >= 1 ? 1 : 0,
                    transform:
                      animStep >= 1 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <p className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide mb-1.5">
                    Detected Context
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Fred", "Friday", "Nov 15", "GitHub", "Budget missing"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#EDF5FC] text-[#2E5B82] border border-[#D4E9F7]/60"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Key Decision */}
                <div
                  className="flex gap-2.5 items-start mb-3"
                  style={{
                    opacity: animStep >= 2 ? 1 : 0,
                    transform:
                      animStep >= 2 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-[#4ECDC4]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide">
                      Key Decision
                    </span>
                    <p className="text-[12px] text-[#0F2B3C] font-medium mt-0.5">
                      Launch sync target date: Nov 15.
                    </p>
                  </div>
                </div>

                {/* Blocker */}
                <div
                  className="flex gap-2.5 items-start mb-4"
                  style={{
                    opacity: animStep >= 3 ? 1 : 0,
                    transform:
                      animStep >= 3 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-[#EF4444]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide">
                      Blocker
                    </span>
                    <p className="text-[12px] text-[#0F2B3C] font-medium mt-0.5">
                      Budget approval needed from Fred before Friday.
                    </p>
                  </div>
                </div>

                {/* Calendar-ready Follow-up */}
                <div
                  className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA] mb-4"
                  style={{
                    opacity: animStep >= 4 ? 1 : 0,
                    transform:
                      animStep >= 4 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide">
                      Calendar-ready Follow-up
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[#0F2B3C]">
                    Q4 Launch Sync
                  </p>
                  <p className="text-[11px] text-[#2E5B82]/50 mt-0.5">
                    Nov 15 · 10:00 AM
                  </p>
                  <p className="text-[11px] text-[#2E5B82]/50">
                    Attendees: Fred, Marketing, Design
                  </p>
                  <button className="mt-2.5 px-3.5 py-1.5 bg-[#0F2B3C] text-white text-[11px] font-semibold rounded-lg hover:bg-[#1A3A5C] transition-colors flex items-center gap-1.5">
                    <CircleCheck className="w-3 h-3" />
                    Confirm & Sync
                  </button>
                </div>

                {/* Email Draft */}
                <div
                  className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA] mb-4"
                  style={{
                    opacity: animStep >= 5 ? 1 : 0,
                    transform:
                      animStep >= 5 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide">
                      Email Draft
                    </span>
                  </div>
                  <p className="text-[12px] text-[#2E5B82]/60 mb-0.5">
                    To: Fred
                  </p>
                  <p className="text-[12px] font-semibold text-[#0F2B3C] mb-1.5">
                    Subject: Budget approval + PR deck
                  </p>
                  <p className="text-[11px] text-[#2E5B82]/55 italic leading-relaxed">
                    "Following up on today's launch discussion — could you
                    confirm the budget approval before Friday? Once approved,
                    I'll upload the final PR deck to GitHub."
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <button className="px-3 py-1.5 bg-[#0F2B3C] text-white text-[11px] font-semibold rounded-lg hover:bg-[#1A3A5C] transition-colors">
                      Review Draft
                    </button>
                    <button className="px-3 py-1.5 bg-[#EDF5FC] text-[#2E5B82] text-[11px] font-semibold rounded-lg border border-[#D4E9F7] hover:bg-[#D4E9F7] transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Send
                    </button>
                  </div>
                </div>

                {/* Today's Plan */}
                <div
                  className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA] mb-4"
                  style={{
                    opacity: animStep >= 6 ? 1 : 0,
                    transform:
                      animStep >= 6 ? "translateX(0)" : "translateX(16px)",
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[10px] font-bold text-[#2E5B82]/50 uppercase tracking-wide">
                      Today's Plan
                    </span>
                  </div>
                  <ol className="space-y-1.5 text-[12px] text-[#0F2B3C] font-medium list-none">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[9px] font-bold shrink-0">
                        1
                      </span>
                      Ask manager for budget feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[9px] font-bold shrink-0">
                        2
                      </span>
                      Confirm Q4 Launch Sync attendees
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[9px] font-bold shrink-0">
                        3
                      </span>
                      Review PR deck final edits
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[9px] font-bold shrink-0">
                        4
                      </span>
                      Upload deck to GitHub
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#EDF5FC] text-[#2E5B82] flex items-center justify-center text-[9px] font-bold shrink-0">
                        5
                      </span>
                      Send follow-up to Fred
                    </li>
                  </ol>
                </div>

                {/* Bottom tagline */}
                <p
                  className="text-[11px] text-[#2E5B82]/35 text-center italic mt-2"
                  style={{
                    opacity: animStep >= 7 ? 1 : 0,
                    transition: "opacity 0.5s ease 0.2s",
                  }}
                >
                  MEMOVA prepares. You confirm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Home Page
   ───────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const postMeetingRef = useRef<HTMLDivElement>(null);
  const intuitiveRef = useRef<HTMLDivElement>(null);
  const integrationsRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setWaitlistStatus("error");
      setWaitlistMessage("Please enter a valid email.");
      return;
    }

    setWaitlistStatus("loading");
    setWaitlistMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, source: "home-waitlist" }),
      });

      if (!response.ok) {
        throw new Error("waitlist request failed");
      }

      setEmail("");
      setWaitlistStatus("success");
      setWaitlistMessage("You're on the list.");
    } catch {
      setWaitlistStatus("error");
      setWaitlistMessage("Something went wrong. Please try again.");
    }
  };

  /* Workflow steps data */
  const workflowSteps = [
    { icon: PenLine, label: "Capture", items: ["Voice", "Photo", "Handwriting"] },
    { icon: Sparkles, label: "Understand", items: ["People", "Deadlines", "Decisions"] },
    { icon: CircleCheck, label: "Confirm", items: ["Attendees", "Email draft", "Priority"] },
    { icon: Send, label: "Execute", items: ["Calendar sync", "Email send", "Daily plan"] },
  ];

  /* Use case 1 action items */
  const useCaseActions = [
    { icon: FileText, label: "Budget needs manager approval", tag: "Task" },
    { icon: Mail, label: "Draft email to Fred", tag: "Email" },
    { icon: Calendar, label: "Create launch sync — Nov 15", tag: "Event" },
    { icon: FileText, label: "Upload PR deck to GitHub", tag: "Task" },
  ];

  /* Integrations */
  const integrations = ["Google Calendar", "Outlook", "Gmail", "Slack", "GitHub", "Notebook"];

  /* Intuitive reasons */
  const intuitiveReasons = [
    { icon: PenLine, title: "You do what you already do", desc: "Notes, recordings, uploads." },
    { icon: Sparkles, title: "MEMOVA finds what matters", desc: "People, deadlines, decisions." },
    { icon: CircleCheck, title: "You stay in control", desc: "Confirm before anything is sent." },
    { icon: Send, title: "Actions go where they belong", desc: "Calendar, email, planner." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF]">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#E8F0F8]/60">
        <div className="container flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-2.5">
            <img
              alt="MEMOVA"
              className="h-[1.8rem] w-[5.6rem] shrink-0 object-cover object-[50%_69%] mix-blend-multiply"
              src="/manus-storage/memova_logo_0eb30acc.png"
            />
            <span className="text-[13px] font-bold tracking-[0.18em] text-[#0F2B3C]">
              MEMOVA
            </span>
          </div>
          <div className="hidden md:flex items-center gap-9">
            <a
              href="#workflow"
              className="text-[13px] font-medium text-[#2E5B82]/60 hover:text-[#0F2B3C] transition-colors"
            >
              How it works
            </a>
            <a
              href="#use-cases"
              className="text-[13px] font-medium text-[#2E5B82]/60 hover:text-[#0F2B3C] transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#integrations"
              className="text-[13px] font-medium text-[#2E5B82]/60 hover:text-[#0F2B3C] transition-colors"
            >
              Integrations
            </a>
            <a
              href="#waitlist"
              className="px-5 py-2 bg-[#0F2B3C] text-white text-[13px] font-semibold rounded-full hover:bg-[#1A3A5C] transition-all"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-30 pb-20 md:pt-52 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EDF5FC]/60 via-white/0 to-[#FAFCFF]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              'url("https://d2xsxph8kpxj0f.cloudfront.net/310519663636410310/fBxJzGQBiXXw4ojYaGnejX/hero_bg-WANaqfGcVbQnpPYmexk6tg.webp")',
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <SectionLabel>The most intuitive AI agent</SectionLabel>
            <h1 className="font-serif text-[2.3rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] text-[#0F2B3C] leading-[1.05] tracking-[-0.02em] mb-6 md:mb-7">
              The memo that moves
              <br />
              <em className="text-[#3B7CB8] not-italic">with your thoughts.</em>
            </h1>
            <p className="text-[15px] md:text-[17px] text-[#2E5B82]/55 font-light leading-relaxed max-w-lg mx-auto mb-9 md:mb-12">
              Messy notes become confirmed actions — calendar events, email
              drafts, and a daily plan.
            </p>
            <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <a
                href="#waitlist"
                className="px-6 sm:px-8 py-3.5 bg-[#0F2B3C] text-white text-[14px] font-semibold rounded-full hover:bg-[#1A3A5C] transition-all hover:shadow-xl hover:shadow-[#0F2B3C]/15 hover:-translate-y-0.5"
              >
                Join Waitlist
              </a>
              <a
                href="#workflow"
                className="px-6 sm:px-8 py-3.5 text-[#2E5B82] text-[14px] font-semibold rounded-full border border-[#D4E9F7] hover:bg-[#EDF5FC] transition-all"
              >
                See Workflow
              </a>
            </div>
          </div>

          {/* Pipeline pills */}
          <div className="mt-14 md:mt-20 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 justify-items-center gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              {[PenLine, Sparkles, CircleCheck, Send].map((Icon, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex min-w-[116px] items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-[#E8F0F8]/80">
                    <span className="text-[#6FA8D9]">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] font-medium text-[#2E5B82]/80">
                      {["Capture", "Understand", "Confirm", "Execute"][i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <ArrowRight className="hidden sm:block w-4 h-4 text-[#D4E9F7] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="workflow" className="py-20 md:py-40 bg-white">
        <div className="container">
          <div className="text-center mb-14 md:mb-20">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]">
              Capture. Understand.
              <br />
              Confirm. Execute.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {workflowSteps.map((step, i) => (
              <div
                key={i}
                className="relative p-7 rounded-2xl bg-[#FAFCFF] border border-[#E8F0F8] hover:shadow-xl hover:shadow-[#2E5B82]/[0.04] hover:-translate-y-1 transition-all duration-400 group"
              >
                <span className="text-[11px] font-bold text-[#6FA8D9]/40 tracking-[0.15em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-4 mb-4 w-11 h-11 rounded-xl bg-[#EDF5FC] flex items-center justify-center text-[#2E5B82] group-hover:bg-[#0F2B3C] group-hover:text-white transition-all duration-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-bold text-[#0F2B3C] mb-3 tracking-[-0.01em]">
                  {step.label}
                </h3>
                <div className="space-y-2">
                  {step.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-[13px] text-[#2E5B82]/50 font-medium"
                    >
                      <div className="w-1 h-1 rounded-full bg-[#6FA8D9]/60" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section id="use-cases" className="py-20 md:py-40 bg-[#FAFCFF] overflow-hidden">
        <div className="container">
          <div className="text-center mb-16 md:mb-24">
            <SectionLabel>Use Cases</SectionLabel>
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]">
              Real scenarios.
              <br />
              Real output.
            </h2>
          </div>

          {/* Use Case 01: Scribble to structure */}
          <div className="max-w-6xl mx-auto mb-24 md:mb-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                01
              </div>
              <div>
                <h3 className="text-[24px] md:text-[28px] font-serif text-[#0F2B3C] tracking-[-0.01em]">
                  Scribble to structure.
                </h3>
                <p className="text-[13px] text-[#2E5B82]/50 font-medium mt-1">
                  Handwritten notes become confirmed action items.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-center">
              {/* Left: handwritten note image */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#E8F0F8] to-transparent rounded-3xl opacity-60" />
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#E8F0F8] bg-[#FEFEFE] shadow-lg shadow-[#2E5B82]/[0.06]">
                  <div className="px-5 py-3 bg-[#F5F0E8] border-b border-[#E8E0D0] flex items-center gap-2">
                    <PenLine className="w-3.5 h-3.5 text-[#A09080]" />
                    <span className="text-[11px] font-semibold text-[#8A7A6A] tracking-wide uppercase">
                      Your handwritten note
                    </span>
                  </div>
                  <div className="p-1">
                    <img
                      alt="Handwritten meeting note"
                      className="w-full rounded-b-xl"
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663636410310/fBxJzGQBiXXw4ojYaGnejX/handwritten_note-Vu9BtDtF6YRhgddWMn3CZw.webp"
                    />
                  </div>
                </div>
              </div>

              {/* Center badge */}
              <MemovaBadge />

              {/* Right: MEMOVA output */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#2E5B82]/5 to-transparent rounded-3xl" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#0F2B3C] to-[#2E5B82] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">
                      MEMOVA output
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]" />
                      <span className="text-[10px] text-[#4ECDC4] font-medium">
                        4 actions detected
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {useCaseActions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA] hover:border-[#6FA8D9]/30 transition-colors group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#EDF5FC] flex items-center justify-center text-[#2E5B82] group-hover/item:bg-[#2E5B82] group-hover/item:text-white transition-colors">
                          <action.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[13px] text-[#0F2B3C] font-semibold">
                            {action.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#6FA8D9] bg-[#EDF5FC] px-2 py-0.5 rounded-full">
                          {action.tag}
                        </span>
                      </div>
                    ))}
                    {/* Confirm prompt */}
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#EDF5FC] to-[#F0F8FF] border border-[#D4E9F7]/80">
                      <div className="flex items-center gap-2 mb-3">
                        <CircleCheck className="w-4 h-4 text-[#2E5B82]" />
                        <p className="text-[13px] text-[#0F2B3C] font-bold">
                          Draft an email to Fred?
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[#0F2B3C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1A3A5C] transition-colors flex items-center gap-1.5">
                          <Send className="w-3 h-3" /> Yes, draft
                        </button>
                        <button className="px-4 py-2 bg-white text-[#2E5B82] text-[12px] font-semibold rounded-lg border border-[#D4E9F7]">
                          Keep as note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Case 02: Voice to calendar */}
          <div className="max-w-6xl mx-auto mb-24 md:mb-32">
            <div className="flex flex-row-reverse items-center justify-end gap-4 mb-8 lg:flex-row lg:justify-end">
              <div>
                <h3 className="text-[24px] md:text-[28px] font-serif text-[#0F2B3C] tracking-[-0.01em] lg:text-right">
                  Voice to calendar.
                </h3>
                <p className="text-[13px] text-[#2E5B82]/50 font-medium mt-1 lg:text-right">
                  One sentence creates a confirmed meeting invite.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                02
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-center">
              {/* Left: Calendar output */}
              <div className="relative order-3 lg:order-1">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#2E5B82]/5 to-transparent rounded-3xl" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#0F2B3C] to-[#2E5B82] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">
                      Calendar event ready
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA]">
                        <div className="text-[16px] font-bold text-[#0F2B3C] mb-3">
                          Design Team Sync
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2 text-[#2E5B82]/45">
                              <span className="text-[#6FA8D9]">
                                <Calendar className="w-3 h-3" />
                              </span>
                              <span className="font-medium">Time</span>
                            </div>
                            <span className="text-[#0F2B3C] font-semibold">
                              Tuesday 2:00 PM
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2 text-[#2E5B82]/45">
                              <span className="text-[#6FA8D9]">
                                <Mail className="w-3 h-3" />
                              </span>
                              <span className="font-medium">Attendees</span>
                            </div>
                            <span className="text-[#0F2B3C] font-semibold">
                              Alex, Sarah, Jordan
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FEF3C7]/60 border border-[#FDE68A]/40">
                        <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        <span className="text-[11px] font-semibold text-[#B45309]">
                          Awaiting your confirmation
                        </span>
                      </div>
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2B3C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1A3A5C] transition-colors">
                          <CircleCheck className="w-3.5 h-3.5" /> Confirm & sync
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EDF5FC] text-[#2E5B82] text-[12px] font-semibold rounded-lg hover:bg-[#D4E9F7] transition-colors">
                          <Mail className="w-3.5 h-3.5" /> Send alignment email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center badge */}
              <div className="order-2">
                <MemovaBadge />
              </div>

              {/* Right: Voice recording */}
              <div className="relative order-1 lg:order-3">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#E8F0F8] to-transparent rounded-3xl opacity-60" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-[#F5F0E8] border-b border-[#E8E0D0] flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-[#A09080]" />
                    <span className="text-[11px] font-semibold text-[#8A7A6A] tracking-wide uppercase">
                      Voice recording
                    </span>
                  </div>
                  <div className="p-6">
                    {/* Waveform */}
                    <div className="flex items-center gap-1 mb-5 justify-center">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-[#6FA8D9]"
                          style={{
                            opacity: 0.3 + Math.random() * 0.5,
                            height: `${4 + Math.random() * 20}px`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="p-5 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA]">
                      <p className="text-[14px] text-[#2E5B82] italic leading-relaxed font-light">
                        "Let's meet with the design team next Tuesday. Alex and
                        Sarah should be there, and Jordan from engineering."
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#2E5B82]/35 font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
                      Transcribed · 12 seconds
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Case 03: Files to briefing */}
          <div className="max-w-6xl mx-auto mb-24 md:mb-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                03
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h3 className="text-[24px] md:text-[28px] font-serif text-[#0F2B3C] tracking-[-0.01em]">
                  Files to briefing.
                </h3>
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]/40">
                  Coming later
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-center">
              {/* Left: Files */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#E8F0F8] to-transparent rounded-3xl opacity-60" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-[#F5F0E8] border-b border-[#E8E0D0] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#A09080]" />
                    <span className="text-[11px] font-semibold text-[#8A7A6A] tracking-wide uppercase">
                      Your files
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    {[
                      { ext: "MD", color: "bg-[#EDF5FC] text-[#2E5B82]", name: "Last meeting note" },
                      { ext: "PDF", color: "bg-[#FEE2E2] text-[#B91C1C]", name: "User interview notes" },
                      { ext: "XLS", color: "bg-[#D1FAE5] text-[#065F46]", name: "Budget sheet" },
                      { ext: "DOC", color: "bg-[#EDE9FE] text-[#5B21B6]", name: "Product roadmap" },
                      { ext: "PDF", color: "bg-[#FEE2E2] text-[#B91C1C]", name: "Research doc" },
                    ].map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFCFF] border border-[#EDF3FA] hover:bg-[#F0F6FC] transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${file.color} flex items-center justify-center text-[10px] font-bold`}
                        >
                          {file.ext}
                        </div>
                        <span className="text-[13px] text-[#2E5B82] font-medium">
                          {file.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D4E9F7] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center badge */}
              <MemovaBadge />

              {/* Right: Pre-meeting brief */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#2E5B82]/5 to-transparent rounded-3xl" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-lg shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#0F2B3C] to-[#2E5B82] flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#6FA8D9]" />
                    <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">
                      Pre-meeting brief
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { title: "What happened last time", desc: "Q3 launch timeline confirmed, budget pending" },
                      { title: "Open questions", desc: "Pricing model, partner onboarding" },
                      { title: "Missing context", desc: "No update from engineering since May 2" },
                      { title: "Previous action items", desc: "3 items still open from last sync" },
                      { title: "People to follow up with", desc: "Sarah (design), Jordan (eng)" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#EDF5FC] flex items-center justify-center text-[11px] text-[#2E5B82] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#0F2B3C]">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#2E5B82]/45 font-medium mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Case 04: Meetings become your daily plan */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8 justify-center">
              <div className="w-10 h-10 rounded-full bg-[#0F2B3C] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                04
              </div>
              <h3 className="text-[24px] md:text-[28px] font-serif text-[#0F2B3C] tracking-[-0.01em]">
                Meetings become your daily plan.
              </h3>
            </div>
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#2E5B82]/5 via-transparent to-[#6FA8D9]/5 rounded-3xl" />
                <div className="relative rounded-2xl bg-white border-2 border-[#E8F0F8] shadow-xl shadow-[#2E5B82]/[0.06] overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#0F2B3C] to-[#2E5B82] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-3.5 h-3.5 text-[#6FA8D9]" />
                      <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">
                        Today's plan
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#4ECDC4]">
                      5 items · auto-generated
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    {[
                      { icon: Mail, label: "Email Fred about approval", time: "9:00 AM", color: "bg-[#EF4444]" },
                      { icon: FileText, label: "Upload PR deck to GitHub", time: "10:30 AM", color: "bg-[#F59E0B]" },
                      { icon: Calendar, label: "Confirm launch sync", time: "11:00 AM", color: "bg-[#EF4444]" },
                      { icon: FileText, label: "Review pricing proposal", time: "2:00 PM", color: "bg-[#F59E0B]" },
                      { icon: Mail, label: "Ask manager for feedback", time: "4:00 PM", color: "bg-[#6FA8D9]" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA] hover:border-[#6FA8D9]/30 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                        <div className="w-8 h-8 rounded-lg bg-[#EDF5FC] flex items-center justify-center text-[#2E5B82] shrink-0">
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[13px] text-[#0F2B3C] font-semibold flex-1">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-[#2E5B82]/35 font-medium">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW PREVIEW (the modified section) ─── */}
      <WorkflowPreviewSection />

      {/* ─── AFTER YOUR MEETING ─── */}
      <section className="py-28 md:py-40 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <SectionLabel>After your meeting</SectionLabel>
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]">
              What MEMOVA does next.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: Calendar,
                title: "Calendar & Alignment",
                badge: "MVP Core",
                badgeColor: "bg-[#0F2B3C] text-white",
                desc: "Detects follow-ups, prepares events, drafts alignment emails.",
              },
              {
                icon: BookOpen,
                title: "Pre-meeting Brief",
                badge: "Coming Later",
                badgeColor: "bg-[#F59E0B] text-white",
                desc: "Gathers context, detects gaps, prepares a report.",
              },
              {
                icon: ListChecks,
                title: "Daily Planner",
                badge: "MVP Direction",
                badgeColor: "bg-[#4ECDC4] text-white",
                desc: "Turns outputs into a 5-item daily plan.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-[#FAFCFF] border border-[#E8F0F8] hover:shadow-xl hover:shadow-[#2E5B82]/[0.04] hover:-translate-y-1 transition-all duration-400"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EDF5FC] flex items-center justify-center text-[#2E5B82] mb-5">
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[15px] font-bold text-[#0F2B3C]">
                    {card.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-full ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <p className="text-[13px] text-[#2E5B82]/50 font-medium leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY IT FEELS INTUITIVE ─── */}
      <section className="py-28 md:py-40 bg-[#FAFCFF]">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]">
              Why it feels intuitive.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {intuitiveReasons.map((reason, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 rounded-2xl bg-white border border-[#E8F0F8] hover:shadow-lg hover:shadow-[#2E5B82]/[0.04] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#EDF5FC] flex items-center justify-center text-[#2E5B82] shrink-0">
                  <reason.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0F2B3C] mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-[13px] text-[#2E5B82]/50 font-medium">
                    {reason.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEGRATIONS ─── */}
      <section id="integrations" className="py-28 md:py-40 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em]">
              Works with your tools.
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <img
              alt="Integrations"
              className="w-full rounded-2xl"
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663636410310/fBxJzGQBiXXw4ojYaGnejX/integrations_icons-MdkbaHWgEB43zUuGEGGSUw.webp"
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto mt-8">
            {integrations.map((name) => (
              <div
                key={name}
                className="text-center py-2.5 rounded-xl bg-[#F8FBFE] border border-[#EDF3FA]"
              >
                <span className="text-[11px] text-[#2E5B82]/60 font-semibold tracking-wide">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WAITLIST ─── */}
      <section
        id="waitlist"
        className="py-32 md:py-44 bg-gradient-to-b from-[#FAFCFF] to-[#EDF5FC]/40"
      >
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] text-[#0F2B3C] leading-[1.1] tracking-[-0.015em] mb-5">
              Stop losing
              <br />
              important moments.
            </h2>
            <p className="text-[14px] text-[#2E5B82]/50 font-medium mb-10">
              Join the waitlist for early access.
            </p>
            <form
              onSubmit={handleWaitlist}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto"
            >
              <input
                placeholder="Work email"
                className="w-full sm:flex-1 px-5 py-3.5 rounded-full text-[13px] bg-white border border-[#D4E9F7] text-[#0F2B3C] placeholder:text-[#2E5B82]/35 outline-none focus:ring-2 focus:ring-[#6FA8D9]/30 focus:border-[#6FA8D9] transition-all"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={waitlistStatus === "loading"}
              />
              <button
                type="submit"
                disabled={waitlistStatus === "loading"}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0F2B3C] text-white text-[13px] font-semibold rounded-full hover:bg-[#1A3A5C] transition-all hover:shadow-xl hover:shadow-[#0F2B3C]/15 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {waitlistStatus === "loading" ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
            <p
              className={`mt-4 min-h-5 text-[12px] font-medium ${
                waitlistStatus === "error"
                  ? "text-[#B45309]"
                  : "text-[#2E5B82]/55"
              }`}
            >
              {waitlistMessage}
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 border-t border-[#E8F0F8]/60 bg-white/70 backdrop-blur-xl">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                className="text-[11px] text-[#2E5B82]/40 hover:text-[#2E5B82] transition-colors font-medium"
              >
                hello@memova.ai
              </a>
              <a
                href="#"
                className="text-[11px] text-[#2E5B82]/40 hover:text-[#2E5B82] transition-colors font-medium"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-[11px] text-[#2E5B82]/40 hover:text-[#2E5B82] transition-colors font-medium"
              >
                Terms
              </a>
            </div>
            <p className="text-[10px] text-[#2E5B82]/30 font-medium">
              © 2025 Memova
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
