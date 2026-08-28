import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  FileText,
  LayoutGrid,
  Megaphone,
} from "lucide-react";
import { useMemo, useState } from "react";

import SiteFooter from "@/components/SiteFooter";
import { type JournalCategory, journalEntries } from "@/content/journalEntries";
import "@/styles/journal.css";

type JournalFilter = "All" | JournalCategory;

const journalFilters = [
  { label: "All", icon: LayoutGrid },
  { label: "Product Notes", icon: FileText },
  { label: "Case Studies", icon: BookOpenText },
  { label: "Announcements", icon: Megaphone },
] as const satisfies readonly {
  label: JournalFilter;
  icon: typeof LayoutGrid;
}[];

export default function Journal() {
  const [activeFilter, setActiveFilter] = useState<JournalFilter>("All");
  const visibleEntries = useMemo(
    () =>
      activeFilter === "All"
        ? journalEntries
        : journalEntries.filter(entry => entry.category === activeFilter),
    [activeFilter]
  );

  return (
    <div className="memova-home-theme memova-journal-page">
      <header className="memova-journal-header">
        <div className="memova-journal-header-inner">
          <a href="/" aria-label="Memova home" className="memova-journal-brand">
            <img src="/memova-logo-transparent.png" alt="Memova" />
          </a>

          <nav className="memova-journal-nav" aria-label="Primary navigation">
            <a href="/#capture">Product</a>
            <a href="/#act">How it works</a>
            <a href="/product-demo/">Product demo</a>
            <a href="/journal" aria-current="page">
              Journal
            </a>
          </nav>

          <a className="memova-journal-cta" href="/#waitlist">
            Join Early Access
          </a>
          <a className="memova-journal-mobile-home" href="/#top">
            <ArrowLeft aria-hidden="true" />
            Memova
          </a>
        </div>
      </header>

      <main className="memova-journal-main">
        <section
          className="memova-journal-index"
          aria-labelledby="memova-journal-heading"
        >
          <h1 id="memova-journal-heading">Journal</h1>

          <div
            className="memova-journal-filters"
            role="toolbar"
            aria-label="Filter journal notes"
          >
            {journalFilters.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={activeFilter === label}
                className={activeFilter === label ? "is-active" : undefined}
                onClick={() => setActiveFilter(label)}
              >
                <Icon aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="memova-journal-timeline" aria-live="polite">
            {visibleEntries.length ? (
              visibleEntries.map(entry => {
                const EntryMarker =
                  entry.category === "Case Studies" ? BookOpenText : FileText;
                const EntryArrow = entry.href ? ArrowUpRight : ArrowRight;

                return (
                  <article className="memova-journal-entry" key={entry.slug}>
                    <a href={entry.href ?? `/journal/${entry.slug}`}>
                      <span className="memova-journal-entry-marker">
                        <EntryMarker aria-hidden="true" />
                      </span>
                      <span className="memova-journal-entry-copy">
                        <span className="memova-journal-entry-type">
                          {entry.category}
                        </span>
                        <strong>{entry.title}</strong>
                        <span className="memova-journal-entry-summary">
                          {entry.summary}
                        </span>
                        <span className="memova-journal-author-row">
                          <span
                            className={`memova-journal-author-avatar is-${entry.authorAvatarPosition}`}
                            aria-hidden="true"
                          />
                          <span>{entry.author}</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.week}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={entry.isoDate}>{entry.date}</time>
                          <span aria-hidden="true">·</span>
                          <span>{entry.readingTime}</span>
                        </span>
                      </span>
                      <EntryArrow
                        className="memova-journal-entry-arrow"
                        aria-hidden="true"
                      />
                    </a>
                  </article>
                );
              })
            ) : (
              <div className="memova-journal-empty">
                <span
                  className="memova-journal-future-marker"
                  aria-hidden="true"
                />
                <div>
                  <strong>No published notes here yet.</strong>
                  <span>This category will appear as the journal grows.</span>
                </div>
              </div>
            )}

            {activeFilter === "All" || activeFilter === "Product Notes" ? (
              <div className="memova-journal-future">
                <span
                  className="memova-journal-future-marker"
                  aria-hidden="true"
                />
                <div>
                  <strong>More notes are being prepared.</strong>
                  <span>
                    Edited, de-identified, and reviewed before publication.
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="memova-journal-back-row">
            <a href="/#top">
              <ArrowLeft aria-hidden="true" />
              Back to Memova
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
