import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileText,
  ShieldCheck,
} from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import { getJournalEntry } from "@/content/journalEntries";
import "@/styles/journal.css";

type JournalArticleProps = {
  slug: string;
};

function JournalArticleNotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-3xl place-content-center px-5 py-24 text-center sm:px-8">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--home-blue)]">
        Memova Journal
      </p>
      <h1 className="mt-5 font-serif text-5xl font-normal tracking-[-0.04em] text-[var(--home-ink)]">
        Note not found.
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-[var(--home-muted)]">
        This note may still be in editorial review or may have moved.
      </p>
      <a
        href="/journal"
        className="mx-auto mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--home-ink)] px-5 text-sm font-bold text-white"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Journal
      </a>
    </main>
  );
}

export default function JournalArticle({ slug }: JournalArticleProps) {
  const entry = getJournalEntry(slug);

  return (
    <div className="memova-home-theme min-h-screen overflow-x-clip bg-[var(--home-canvas)] text-[var(--home-ink)]">
      <header className="border-b border-[var(--home-border)]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="/"
            aria-label="Memova home"
            className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-blue)] focus-visible:ring-offset-4"
          >
            <img
              src="/memova-logo-transparent.png"
              alt="Memova"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </a>

          <a
            href="/journal"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--home-border)] bg-white px-4 text-sm font-semibold text-[var(--home-body)] shadow-[0_8px_22px_rgba(45,58,92,0.07)] transition hover:-translate-y-0.5 hover:border-[rgba(40,100,245,0.35)] hover:text-[var(--home-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-blue)] focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to Journal
          </a>
        </div>
      </header>

      {entry ? (
        <main>
          <article>
            <header className="relative isolate overflow-hidden border-b border-[var(--home-border)]/75 px-5 py-16 sm:px-8 sm:py-24">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-[rgba(179,41,243,0.07)] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-44 -left-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-[rgba(40,100,245,0.09)] blur-3xl"
              />

              <div className="mx-auto max-w-4xl">
                <a
                  href="/journal"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--home-blue)]"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Building Memova in Public
                </a>
                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
                  <span className="text-[var(--home-blue)]">{entry.week}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={entry.isoDate}>{entry.date}</time>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`memova-journal-author-avatar is-${entry.authorAvatarPosition}`}
                    aria-hidden="true"
                  />
                  <span>{entry.author}</span>
                </div>
                <h1 className="mt-6 max-w-4xl font-serif text-[clamp(3rem,8vw,6.75rem)] font-normal leading-[0.96] tracking-[-0.05em] text-[var(--home-ink)]">
                  {entry.title}
                </h1>
                <p className="mt-8 max-w-3xl text-lg leading-9 text-[var(--home-body)] sm:text-xl sm:leading-10">
                  {entry.summary}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 aria-hidden="true" className="h-4 w-4" />
                    {entry.readingTime}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-white/80 px-3 py-1.5 text-[var(--home-blue)]">
                    <FileText aria-hidden="true" className="h-4 w-4" />
                    Published note
                  </span>
                </div>
              </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,44rem)_17rem] lg:items-start lg:justify-between">
              <div className="min-w-0">
                <aside className="rounded-[1.5rem] border border-[rgba(40,100,245,0.18)] bg-[rgba(40,100,245,0.055)] p-5 text-sm leading-7 text-[var(--home-body)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-[var(--home-blue)]"
                    />
                    <p>{entry.editorialNote}</p>
                  </div>
                </aside>

                <div className="mt-12 space-y-14">
                  {entry.sections.map(section => (
                    <section key={section.heading}>
                      <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.02] tracking-[-0.04em] text-[var(--home-ink)]">
                        {section.heading}
                      </h2>
                      <div className="mt-6 space-y-5 text-base leading-8 text-[var(--home-body)] sm:text-lg sm:leading-9">
                        {section.paragraphs.map(paragraph => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      {section.bullets ? (
                        <ul className="mt-7 space-y-3 border-l-2 border-[rgba(40,100,245,0.28)] pl-5 text-sm font-semibold leading-7 text-[var(--home-ink)] sm:text-base">
                          {section.bullets.map(bullet => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.5rem] border border-[var(--home-border)] bg-white p-5 shadow-[0_18px_50px_rgba(45,58,92,0.07)] sm:p-6 lg:sticky lg:top-8">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[var(--home-blue)]">
                  Related updates
                </p>
                <div className="mt-5 divide-y divide-[var(--home-border)]">
                  {entry.relatedUpdates.map(update => (
                    <a
                      key={update.href}
                      href={update.href}
                      className="group flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <span>
                        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.13em] text-[var(--home-muted)]">
                          {update.label}
                        </span>
                        <strong className="mt-1 block text-sm leading-6 text-[var(--home-ink)] group-hover:text-[var(--home-blue)]">
                          {update.title}
                        </strong>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--home-blue)] transition group-hover:translate-x-1"
                      />
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </article>
        </main>
      ) : (
        <JournalArticleNotFound />
      )}

      <SiteFooter />
    </div>
  );
}
