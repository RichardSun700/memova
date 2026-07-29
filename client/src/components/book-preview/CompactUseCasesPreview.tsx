import { ArrowUpRight, NotebookPen, Sparkles } from "lucide-react";

import { cases as realUserCases, type UserCase } from "@/pages/UserCases";

const featuredCases = realUserCases.slice(0, 2);

function CompactCaseCard({ item, index }: { item: UserCase; index: number }) {
  const caseHref = item.demoHref || "/user-cases";

  return (
    <article className="memova-case-card overflow-hidden rounded-[1.75rem] border border-[#DDE6FF] bg-white shadow-xl shadow-[var(--memova-navy)]/[0.05]">
      <div className="grid h-full grid-cols-1 md:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-[#E8EEF7] bg-gradient-to-br from-[#F8FBFF] via-white to-[#F5F7FF] p-4 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C96A8]">
              <NotebookPen aria-hidden="true" className="h-3.5 w-3.5" />
              Source note
            </span>
            <span className="rounded-full border border-[#DDE6FF] bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--memova-blue)]">
              0{index + 1}
            </span>
          </div>

          <img
            src={item.sourceImage}
            alt={`${item.title} source note`}
            className="mx-auto aspect-[886/1848] max-h-[360px] w-auto rounded-2xl border border-white bg-[#F4F4FA] object-contain shadow-inner"
            loading="lazy"
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="border-b border-[#E8EEF7] p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F2F6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--memova-blue)]">
                {item.category}
              </span>
              <span className="text-[11px] font-semibold text-[#8C96A8]">
                {item.person}
              </span>
            </div>

            <h3 className="mt-3 font-display text-xl font-bold leading-tight text-[var(--memova-navy)] md:text-2xl">
              {item.title}
            </h3>
            <p className="mt-2 text-[13px] font-medium leading-6 text-[#637083]">
              {item.description}
            </p>
          </div>

          <a
            href={caseHref}
            target={item.demoHref ? "_blank" : undefined}
            rel={item.demoHref ? "noopener noreferrer" : undefined}
            className="group relative block min-h-[280px] flex-1 overflow-hidden bg-[#F6F9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--memova-blue)]"
            aria-label={`Open ${item.title} case`}
          >
            <img
              src={item.image || item.sourceImage}
              alt={`${item.title} output preview`}
              className="h-full min-h-[280px] w-full object-cover object-top transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.015]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--memova-navy)]/90 via-[var(--memova-navy)]/55 to-transparent p-5 pt-16">
              <span className="memova-output-chip inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-[12px] font-bold text-[var(--memova-navy)] shadow-lg">
                <Sparkles
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--memova-blue)]"
                />
                Open interactive case
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--memova-blue)]"
                />
              </span>
            </div>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function CompactUseCasesPreview() {
  return (
    <section
      id="user-cases"
      aria-labelledby="use-cases-heading"
      className="memova-site-use-cases relative scroll-mt-20 overflow-hidden bg-[#FAFCFF] py-24 md:py-28"
    >
      <div
        aria-hidden="true"
        className="memova-dot-grid pointer-events-none absolute inset-0 bg-[radial-gradient(#E8EEF7_1.2px,transparent_1.2px)] opacity-60 [background-size:24px_24px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--memova-blue)]">
              Real use cases
            </p>
            <h2
              id="use-cases-heading"
              className="scroll-mt-28 font-display text-3xl font-bold leading-tight text-[var(--memova-navy)] md:text-4xl lg:text-5xl"
            >
              Real notes.
              <br />
              <span className="memova-gradient-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Useful, shareable output.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[13px] font-medium leading-6 text-[#637083]">
              Two examples show the original note alongside the page it becomes.
            </p>
          </div>

          <a
            href="/user-cases"
            className="memova-primary-action inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--memova-navy)] px-5 text-[12px] font-bold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--memova-blue)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            Browse all use cases
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {featuredCases.map((item, index) => (
            <CompactCaseCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
