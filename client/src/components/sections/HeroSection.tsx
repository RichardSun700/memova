import { useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  FileText,
  Camera,
  Shield,
  Lock,
  UserCheck,
  ArrowRight,
  BrainCircuit,
  ListChecks,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft,
  Search,
  Eye,
} from "lucide-react";
import { shouldSkipInitialMarketingMotion } from "@/seo/seoHandoff";
import { productJournalEntryState } from "@/navigation/productJournalNavigation";
import { navigate } from "wouter/use-browser-location";

function openProductJournal(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  navigate("/product-journal", { state: productJournalEntryState });
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export default function HeroSection() {
  const skipInitialMotion = shouldSkipInitialMarketingMotion();
  const [hoveredSide, setHoveredSide] = useState<"before" | "after" | null>(
    null
  );

  // Traceability states
  const [hoveredTrace, setHoveredTrace] = useState<"sync" | "survey" | null>(
    null
  );
  const [clickedTrace, setClickedTrace] = useState<"sync" | "survey" | null>(
    null
  );

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="memova-site-hero relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16"
    >
      {/* Subtle colorful background glows - Rich but Clean */}
      <div className="memova-ambient memova-ambient--blue absolute top-1/4 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="memova-ambient memova-ambient--violet absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="memova-ambient memova-ambient--center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-100/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Background Pattern */}
      <div className="memova-brand-grid absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: Granola-Inspired Editorial Header */}
          <div className="min-w-0 max-w-full lg:col-span-6 space-y-6 text-left flex flex-col justify-center">
            <motion.div
              initial={skipInitialMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="memova-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--memova-blue)]/10 border border-[var(--memova-blue)]/20 w-fit"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--memova-blue)] animate-pulse-soft" />
              <span className="text-[11px] font-bold text-[var(--memova-navy)] uppercase tracking-wider">
                Agent memory for everyday context
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                id="home-hero-heading"
                initial={skipInitialMotion ? false : { opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="max-w-[22rem] font-serif text-[2.65rem] sm:max-w-xl sm:text-5xl md:text-6xl text-[var(--memova-navy)] leading-[1.08] sm:leading-[1.12] tracking-tight font-normal"
              >
                Your everyday context,
                <br />
                <span className="memova-gradient-text font-display font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ready for agents.
                </span>
              </motion.h1>

              <motion.p
                initial={skipInitialMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="max-w-[22rem] text-base text-[#475569] sm:max-w-xl leading-relaxed"
              >
                Memova turns the notes, conversations, and ideas you choose to
                capture into private agent memory—and useful workflows you
                approve.
              </motion.p>
            </div>

            {/* CTA Buttons with Snappy Scale Feedbacks */}
            <motion.div
              initial={skipInitialMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex max-w-[22rem] items-center gap-3 flex-wrap pt-4 sm:max-w-xl"
            >
              <motion.a
                href="#waitlist"
                data-analytics-event="ios_early_access_click"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="memova-primary-action px-7 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-[13px] rounded-full
                           shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                Join iOS Early Access
              </motion.a>
              <motion.a
                href="/product-journal"
                onClick={openProductJournal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="memova-secondary-action px-7 py-3 bg-white text-[var(--memova-navy)] font-bold text-[13px] rounded-full
                           border border-[#DDE6FF] shadow-sm transition-all duration-200
                           hover:border-indigo-400 hover:shadow-indigo-500/5 hover:text-indigo-600"
              >
                Open Product Journal
              </motion.a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={skipInitialMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex max-w-[22rem] items-center gap-3 overflow-hidden flex-wrap pt-6 sm:max-w-xl"
            >
              {[
                {
                  icon: Shield,
                  text: "You choose what to capture",
                  color:
                    "hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/20",
                },
                {
                  icon: Lock,
                  text: "Private, exportable memory",
                  color:
                    "hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/20",
                },
                {
                  icon: UserCheck,
                  text: "Approve before action",
                  color:
                    "hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/20",
                },
              ].map(({ icon: BadgeIcon, text, color }) => (
                <motion.span
                  key={text}
                  whileHover={{ y: -2 }}
                  className={`memova-trust-chip flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#637083]
                             bg-white rounded-full border border-[#E8EEF7] shadow-sm cursor-pointer transition-all duration-200 ${color}`}
                >
                  <BadgeIcon className="w-3.5 h-3.5 text-[var(--memova-blue)]" />
                  {text}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Granola-Inspired Before & After Contrast Panel */}
          <div className="min-w-0 lg:col-span-6 flex justify-center">
            <motion.div
              id="alignment-loop-preview"
              initial={
                skipInitialMotion ? false : { opacity: 0, scale: 0.95, y: 30 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="memova-brand-panel w-full max-w-[310px] sm:max-w-lg bg-slate-50/50 border border-slate-200/60 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md"
            >
              {/* Decorative Glow inside Panel */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

              {/* Panel Title */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Alignment Loop
                </span>
                <span className="hidden text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider sm:inline-flex">
                  Trace sources
                </span>
              </div>

              <div className="space-y-4">
                {/* BEFORE: Dual Input (Raw Note + Transcript) */}
                <motion.div
                  onMouseEnter={() => setHoveredSide("before")}
                  onMouseLeave={() => setHoveredSide(null)}
                  animate={{
                    scale:
                      hoveredSide === "before"
                        ? 1.01
                        : hoveredSide === "after"
                          ? 0.98
                          : 1,
                    opacity: hoveredSide === "after" ? 0.6 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="memova-context-card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-amber-400 hover:shadow-amber-100/30 transition-all duration-300 relative cursor-pointer group"
                >
                  <div className="absolute top-3.5 right-4 hidden text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider sm:block">
                    Context Inputs
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Before
                  </h4>

                  <div className="space-y-3">
                    {/* Input 1: User's Raw Notes */}
                    <div className="bg-amber-50/20 border border-amber-100/50 rounded-xl p-2.5 transition-colors duration-300 relative">
                      <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider absolute -top-2 left-3">
                        Notes
                      </span>
                      <p
                        className={`text-[11px] font-medium leading-relaxed text-slate-600 mt-1 transition-all duration-300 ${
                          hoveredTrace === "sync" ||
                          clickedTrace === "sync" ||
                          hoveredTrace === "survey" ||
                          clickedTrace === "survey"
                            ? "bg-amber-100/60 text-amber-900 rounded px-1"
                            : ""
                        }`}
                      >
                        Fred wants PRD survey review done. Refactor sync to
                        CRDTs by June 5.
                      </p>
                    </div>

                    {/* Input 2: Spoken Transcript */}
                    <div className="bg-blue-50/20 border border-blue-100/50 rounded-xl p-2.5 transition-colors duration-300 relative">
                      <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider absolute -top-2 left-3">
                        Voice
                      </span>
                      <p
                        className={`text-[11px] font-medium leading-relaxed text-slate-600 mt-1 transition-all duration-300 ${
                          hoveredTrace === "sync" || clickedTrace === "sync"
                            ? "bg-blue-100/60 text-blue-900 rounded px-1"
                            : ""
                        }`}
                      >
                        &ldquo;Wait, so next Tuesday we need to align with Chen
                        Wei on the sync API. Let&apos;s refactor to CRDTs...
                        wait, who owns this? Chen Wei.&rdquo;
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow Connector */}
                <div className="flex justify-center my-0.5">
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-slate-100 border border-slate-200 rounded-full p-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                  </motion.div>
                </div>

                {/* AFTER: Structured Action with Interactive Traceability */}
                <motion.div
                  onMouseEnter={() => setHoveredSide("after")}
                  onMouseLeave={() => setHoveredSide(null)}
                  animate={{
                    scale:
                      hoveredSide === "after"
                        ? 1.01
                        : hoveredSide === "before"
                          ? 0.98
                          : 1,
                    opacity: hoveredSide === "before" ? 0.6 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="memova-action-card bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-4 shadow-md hover:border-indigo-400 hover:shadow-indigo-100/40 transition-all duration-300 relative cursor-pointer group"
                >
                  <div className="absolute top-3 right-4 hidden text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider sm:flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-spin-slow" />{" "}
                    Agent-ready
                  </div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />{" "}
                    After
                  </h4>

                  <div className="space-y-2.5">
                    {/* Action Item 1: Refactor Sync */}
                    <div
                      onMouseEnter={() => setHoveredTrace("sync")}
                      onMouseLeave={() => setHoveredTrace(null)}
                      onClick={() =>
                        setClickedTrace(clickedTrace === "sync" ? null : "sync")
                      }
                      className={`flex items-start gap-2.5 bg-white border rounded-xl p-2.5 shadow-sm transition-all duration-300 ${
                        hoveredTrace === "sync" || clickedTrace === "sync"
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-hidden="true"
                        tabIndex={-1}
                        className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        readOnly
                      />
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">
                            Refactor sync module to CRDTs
                          </p>
                          {/* Traceability Magnifying Glass */}
                          <motion.button
                            type="button"
                            aria-label={
                              clickedTrace === "sync"
                                ? "Hide source links for the CRDT action"
                                : "Show source links for the CRDT action"
                            }
                            aria-expanded={clickedTrace === "sync"}
                            aria-controls="hero-trace-sync"
                            onClick={event => {
                              event.stopPropagation();
                              setClickedTrace(
                                clickedTrace === "sync" ? null : "sync"
                              );
                            }}
                            whileHover={{ scale: 1.1 }}
                            className={`p-1 rounded-md transition-colors ${
                              hoveredTrace === "sync" || clickedTrace === "sync"
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <Search className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Owner: @chen
                          </span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Due: June 5
                          </span>
                        </div>

                        {/* Source Attribution Popover */}
                        <AnimatePresence>
                          {(hoveredTrace === "sync" ||
                            clickedTrace === "sync") && (
                            <motion.div
                              id="hero-trace-sync"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 pt-2 border-t border-dashed border-slate-100 text-[10px] text-slate-500 flex flex-col gap-1"
                            >
                              <span className="font-bold text-indigo-600 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Source link
                              </span>
                              <p className="italic">
                                Derived from{" "}
                                <strong className="text-amber-600">
                                  📝 Raw Notes
                                </strong>{" "}
                                (&quot;Refactor sync to CRDTs by June 5&quot;)
                                &amp;{" "}
                                <strong className="text-blue-600">
                                  🎙️ Transcript
                                </strong>{" "}
                                (&quot;align with Chen Wei&quot;).
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action Item 2: Review Survey */}
                    <div
                      onMouseEnter={() => setHoveredTrace("survey")}
                      onMouseLeave={() => setHoveredTrace(null)}
                      onClick={() =>
                        setClickedTrace(
                          clickedTrace === "survey" ? null : "survey"
                        )
                      }
                      className={`flex items-start gap-2.5 bg-white border rounded-xl p-2.5 shadow-sm transition-all duration-300 ${
                        hoveredTrace === "survey" || clickedTrace === "survey"
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-hidden="true"
                        tabIndex={-1}
                        className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        readOnly
                      />
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">
                            Review user survey results PDF
                          </p>
                          {/* Traceability Magnifying Glass */}
                          <motion.button
                            type="button"
                            aria-label={
                              clickedTrace === "survey"
                                ? "Hide source links for the survey action"
                                : "Show source links for the survey action"
                            }
                            aria-expanded={clickedTrace === "survey"}
                            aria-controls="hero-trace-survey"
                            onClick={event => {
                              event.stopPropagation();
                              setClickedTrace(
                                clickedTrace === "survey" ? null : "survey"
                              );
                            }}
                            whileHover={{ scale: 1.1 }}
                            className={`p-1 rounded-md transition-colors ${
                              hoveredTrace === "survey" ||
                              clickedTrace === "survey"
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <Search className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Owner: @fred
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Task: PRD Sync
                          </span>
                        </div>

                        {/* Source Attribution Popover */}
                        <AnimatePresence>
                          {(hoveredTrace === "survey" ||
                            clickedTrace === "survey") && (
                            <motion.div
                              id="hero-trace-survey"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 pt-2 border-t border-dashed border-slate-100 text-[10px] text-slate-500 flex flex-col gap-1"
                            >
                              <span className="font-bold text-indigo-600 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Source link
                              </span>
                              <p className="italic">
                                Extracted from{" "}
                                <strong className="text-amber-600">
                                  📝 Raw Notes
                                </strong>{" "}
                                (&quot;Fred wants PRD survey review done&quot;).
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Horizontal Workflow Animation - below */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -4 }}
          className="memova-workflow-panel relative rounded-2xl border border-[#DDE6FF] bg-white/80 backdrop-blur-sm p-5 md:p-7 shadow-xl shadow-[var(--memova-navy)]/[0.04] mt-16 hover:border-indigo-300 hover:shadow-indigo-500/5 transition-all duration-300"
        >
          {/* Workflow stages */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 md:gap-0 items-center">
            {/* Stage 1: Input Methods */}
            <div className="flex flex-col items-center">
              <div className="flex gap-2 mb-3">
                {[
                  {
                    icon: Mic,
                    color: "bg-[#EEF2FF]",
                    iconColor: "text-[#6366F1]",
                  },
                  {
                    icon: FileText,
                    color: "bg-[#F0FDF4]",
                    iconColor: "text-[#16A34A]",
                  },
                  {
                    icon: Camera,
                    color: "bg-[#FFF7ED]",
                    iconColor: "text-[#EA580C]",
                  },
                ].map(({ icon: Icon, color, iconColor }, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center border border-black/5 cursor-pointer shadow-sm`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                  </motion.div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#8C96A8] uppercase tracking-wider">
                Context in
              </span>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex items-center justify-center px-2">
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#A9B9D8]" />
              </motion.div>
            </div>

            {/* Stage 2: Private KB */}
            <div className="flex flex-col items-center py-2 md:py-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-3 cursor-pointer"
              >
                <FileText className="w-5 h-5 text-[#8C96A8]" />
              </motion.div>
              <span className="text-[10px] font-bold text-[#8C96A8] uppercase tracking-wider">
                Agent memory
              </span>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex items-center justify-center px-2">
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.3,
                  ease: "easeInOut",
                }}
                className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#A9B9D8]" />
              </motion.div>
            </div>

            {/* Stage 3: Structured Alignment */}
            <div className="flex flex-col items-center py-2 md:py-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#E0D7FF] flex items-center justify-center shadow-sm mb-3 cursor-pointer"
              >
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
              </motion.div>
              <span className="text-[10px] font-bold text-[#8C96A8] uppercase tracking-wider">
                Workflow ready
              </span>
            </div>

            {/* Arrow 3 */}
            <div className="hidden md:flex items-center justify-center px-2">
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.6,
                  ease: "easeInOut",
                }}
                className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#A9B9D8]" />
              </motion.div>
            </div>

            {/* Stage 4: User-Approved Agent loop */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center shadow-sm mb-3 cursor-pointer"
              >
                <ListChecks className="w-5 h-5 text-[#10B981]" />
              </motion.div>
              <span className="text-[10px] font-bold text-[#8C96A8] uppercase tracking-wider">
                You approve
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
