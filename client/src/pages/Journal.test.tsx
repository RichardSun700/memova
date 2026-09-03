import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { journalEntries, latestJournalEntry } from "@/content/journalEntries";
import Journal from "./Journal";
import JournalArticle from "./JournalArticle";

describe("Memova Journal", () => {
  it("lists the product note and the linked dream case with their authors", () => {
    const html = renderToStaticMarkup(<Journal />);
    const dreamEntry = journalEntries.find(entry => entry.href);

    expect(html).toContain("Journal");
    expect(html).toContain("Product Notes");
    expect(html).toContain("Case Studies");
    expect(html).toContain(latestJournalEntry.title);
    expect(html).toContain(latestJournalEntry.week);
    expect(html).toContain(`/journal/${latestJournalEntry.slug}`);
    expect(html).toContain("Silva · Product");
    expect(dreamEntry).toBeDefined();
    expect(html).toContain("The Architecture of Sleep.");
    expect(html).toContain("Ada · Operations");
    expect(html).toContain(
      "/demo/The_Architecture_of_Sleep/index.html?returnTo=%2Fjournal"
    );
    expect(html).toContain("More notes are being prepared.");
    expect(html).not.toContain("data-product-journal");
    expect(html).toContain('href="/#capture"');
    expect(html).toContain('href="/#act"');
    expect(html).toContain('href="/product-demo/"');
    expect(html).not.toContain('href="/#product"');
    expect(html).not.toContain('href="/#use-cases"');
    expect(html).not.toContain('href="/#trust"');
    expect(html).toContain('href="/#top"');
  });

  it("renders a dated, authored article with body and related updates", () => {
    const html = renderToStaticMarkup(
      <JournalArticle slug={latestJournalEntry.slug} />
    );

    expect(html).toContain(latestJournalEntry.title);
    expect(html).toContain(latestJournalEntry.date);
    expect(html).toContain(latestJournalEntry.author);
    expect(html).toContain(latestJournalEntry.summary);
    expect(html).toContain("The problem was not a missing tour.");
    expect(html).toContain("What we are testing next.");
    expect(html).toContain('href="/product-journal"');
    expect(html).toContain("Published note");
  });
});
