/**
 * Privacy Section - Redesigned to match the clean, minimalist, card-based layout
 * of AnythingLLM, customized for Memova's actual product structure.
 * Theme: Light/White Theme with subtle, clean background glows and physical magnetic hover states.
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Lock, Smartphone, Cpu, Key, ShieldAlert } from "lucide-react";

export default function PrivacySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Cpu,
      title: "Local-first capture",
      desc: "Voice, OCR, notes, and files are structured on device first.",
      tone: "blue",
    },
    {
      icon: Key,
      title: "Passcode boundary",
      desc: "Private outputs open only after your local passcode.",
      tone: "mint",
    },
    {
      icon: Lock,
      title: "Permission gate",
      desc: "Agents can prepare work, but execution waits for approval.",
      tone: "violet",
    },
    {
      icon: ShieldAlert,
      title: "No training use",
      desc: "Your private knowledge base stays yours.",
      tone: "mint",
    },
  ];

  return (
    <section
      className="memova-site-privacy scroll-mt-20 py-20 md:py-32 relative overflow-hidden bg-white text-[var(--memova-navy)]"
      ref={ref}
      id="privacy"
      aria-labelledby="privacy-heading"
    >
      {/* Subtle colorful background gradient blobs - Rich but Clean */}
      <div className="memova-ambient memova-ambient--blue absolute top-1/4 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="memova-ambient memova-ambient--violet absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="memova-ambient memova-ambient--mint absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-50/30 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="memova-brand-grid absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Upper Section: Text Left, Laptop Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-16 md:mb-20">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="memova-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-600"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Trust & permission layer
            </motion.div>

            <motion.h2
              id="privacy-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="memova-section-heading scroll-mt-28 font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-tight"
            >
              Private. Local.
              <br />
              <span className="memova-gradient-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Permissioned.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[13px] font-medium text-[#475569] max-w-xl leading-relaxed"
            >
              A trusted context entry layer for agents: local-first,
              consent-first, boundary-first.
            </motion.p>
          </div>

          {/* Right Minimal Privacy Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full max-w-[500px] aspect-[4/3] flex items-center justify-center"
            >
              <SimplifiedPrivacyVisual />
            </motion.div>
          </div>
        </div>

        {/* Lower Section: 4 Minimal Grid Cards with Hover Glow & Magnetic Lift */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`memova-privacy-card memova-privacy-card--${card.tone} p-6 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden`}
            >
              {/* Inner subtle glow background on hover */}
              <div className="memova-privacy-card-glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="memova-privacy-icon h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[14px] font-bold text-[var(--memova-navy)] tracking-tight transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] font-medium text-[var(--memova-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SimplifiedPrivacyVisual() {
  const nodes = [
    {
      icon: Cpu,
      label: "Local capture",
      x: "left-[8%] top-[18%]",
      tone: "blue",
    },
    { icon: Key, label: "Passcode", x: "right-[7%] top-[24%]", tone: "mint" },
    {
      icon: Lock,
      label: "Permission gate",
      x: "left-[10%] bottom-[18%]",
      tone: "violet",
    },
    {
      icon: ShieldAlert,
      label: "No training",
      x: "right-[9%] bottom-[16%]",
      tone: "mint",
    },
  ];

  return (
    <div className="group relative h-full w-full cursor-pointer">
      <div className="memova-privacy-halo absolute inset-8 rounded-full bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

      <div className="absolute inset-[10%] rounded-[2rem] border border-white/70 bg-white/70 shadow-2xl shadow-slate-900/[0.06] backdrop-blur-xl" />
      <div className="absolute inset-[16%] rounded-[1.5rem] border border-[#DDE6FF] bg-[#F8FAFF]/80" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[20%] rounded-full border border-dashed border-[#B8C7F0]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[28%] rounded-full border border-dashed border-[#CFE8DA]"
      />

      <div className="absolute left-1/2 top-1/2 z-10 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] border border-[#DDE6FF] bg-white shadow-xl shadow-blue-900/[0.08] transition-transform duration-500 group-hover:scale-[1.03]">
        <div className="memova-privacy-core-icon mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
          <Lock className="h-5 w-5" />
        </div>
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C96A8]">
            Private KB
          </div>
          <div className="mt-1 text-[13px] font-bold text-[#0F172A]">
            User-owned context
          </div>
        </div>
      </div>

      {nodes.map((node, index) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
          className={`absolute z-20 ${node.x}`}
        >
          <div className="memova-privacy-node flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-900/[0.05] backdrop-blur transition-transform duration-300 group-hover:-translate-y-1">
            <div
              className={`memova-privacy-icon memova-privacy-icon--${node.tone} flex h-8 w-8 items-center justify-center rounded-xl border`}
            >
              <node.icon className="h-4 w-4" />
            </div>
            <span className="whitespace-nowrap text-[10px] font-bold text-[#475569]">
              {node.label}
            </span>
          </div>
        </motion.div>
      ))}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 500 375"
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          d="M144 105 C184 108 205 135 250 153"
          stroke="url(#privacyLineBlue)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 8"
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M356 124 C320 130 292 145 250 153"
          stroke="url(#privacyLineGreen)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 8"
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.35, 0.85, 0.35] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M149 270 C188 248 210 230 250 222"
          stroke="url(#privacyLinePurple)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 8"
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.35, 0.85, 0.35] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: 0.8,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M358 270 C320 248 288 232 250 222"
          stroke="url(#privacyLineAmber)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 8"
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.35, 0.85, 0.35] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: 1.2,
            ease: "easeInOut",
          }}
        />
        <defs>
          <linearGradient
            id="privacyLineBlue"
            x1="144"
            y1="105"
            x2="250"
            y2="153"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2864F5" stopOpacity="0.15" />
            <stop offset="1" stopColor="#6A54F5" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient
            id="privacyLineGreen"
            x1="356"
            y1="124"
            x2="250"
            y2="153"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7ECBA1" stopOpacity="0.22" />
            <stop offset="1" stopColor="#2864F5" stopOpacity="0.68" />
          </linearGradient>
          <linearGradient
            id="privacyLinePurple"
            x1="149"
            y1="270"
            x2="250"
            y2="222"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#B329F3" stopOpacity="0.15" />
            <stop offset="1" stopColor="#6A54F5" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient
            id="privacyLineAmber"
            x1="358"
            y1="270"
            x2="250"
            y2="222"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7ECBA1" stopOpacity="0.22" />
            <stop offset="1" stopColor="#6A54F5" stopOpacity="0.68" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
