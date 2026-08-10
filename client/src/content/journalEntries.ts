export type JournalSection = {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type JournalRelatedUpdate = {
  label: string;
  title: string;
  href: string;
};

export type JournalCategory =
  | "Product Notes"
  | "Case Studies"
  | "Announcements";

export type JournalEntry = {
  slug: string;
  week: string;
  date: string;
  isoDate: string;
  author: string;
  authorAvatarPosition: "left" | "right";
  category: JournalCategory;
  readingTime: string;
  title: string;
  summary: string;
  href?: string;
  editorialNote: string;
  sections: readonly JournalSection[];
  relatedUpdates: readonly JournalRelatedUpdate[];
};

export const journalEntries: readonly JournalEntry[] = [
  {
    slug: "why-we-changed-our-onboarding-story",
    week: "Week 12",
    date: "August 7, 2026",
    isoDate: "2026-08-07",
    author: "Silva · Product",
    authorAvatarPosition: "left",
    category: "Product Notes",
    readingTime: "4 min read",
    title: "Why we changed our onboarding story.",
    summary:
      "We were explaining more features when what people needed was a clearer view of how their own context becomes useful.",
    editorialNote:
      "This is an edited product note—not a raw meeting transcript. Customer identities and confidential details are excluded before publication.",
    sections: [
      {
        heading: "The problem was not a missing tour.",
        paragraphs: [
          "Our earlier onboarding tried to explain Notes, Books, Pages, actions, and sharing as separate features. Each part was understandable on its own, but the complete product felt broader instead of clearer.",
          "Memova only makes sense when those parts stay connected. A conversation can become a Note, the Note can deepen a living Book, and that Book can produce a Page or prepare the next action without losing where the idea came from.",
        ],
      },
      {
        heading: "We now begin with one transformation.",
        paragraphs: [
          "The new story starts with context a person chooses to keep: a conversation, note, file, meeting, or experience. Memova organizes it into a Book that grows over time, then helps turn that context into something reviewable and useful.",
        ],
        bullets: [
          "Capture the context that matters.",
          "Connect it inside a living Book.",
          "Review the Page or next action before anything is shared.",
        ],
      },
      {
        heading: "Clarity also means showing the boundaries.",
        paragraphs: [
          "The product story cannot stop at generation. Sources remain private by default, generated results preserve their relationship to the underlying context, and consequential actions wait for the user’s approval.",
          "That is why the homepage now pairs the Apollo product walkthrough with explicit Trust & Control—not as a separate promise, but as part of the same workflow.",
        ],
      },
      {
        heading: "What we are testing next.",
        paragraphs: [
          "We are looking for a simpler signal than feature recall: after the first screen, can someone explain Memova in one sentence, and can they see what their first Book would be about?",
        ],
        bullets: [
          "Does the first screen make the input-to-Book transformation obvious?",
          "Does one complete example teach more than several disconnected feature cards?",
          "Can people distinguish the private Book from the Page they may choose to share?",
        ],
      },
    ],
    relatedUpdates: [
      {
        label: "Product story",
        title: "Explore the six-chapter Apollo demo",
        href: "/product-journal",
      },
      {
        label: "Homepage",
        title: "See the new context-to-Book story",
        href: "/#top",
      },
    ],
  },
  {
    slug: "the-architecture-of-sleep",
    week: "Case Study",
    date: "August 6, 2026",
    isoDate: "2026-08-06",
    author: "xushan · Operations",
    authorAvatarPosition: "right",
    category: "Case Studies",
    readingTime: "Interactive case",
    title: "The Architecture of Sleep.",
    summary:
      "A private, anonymized atlas turns 276 dreams from 2023–2026 into pages that can be revisited, searched, and understood across time.",
    href: "/demo/The_Architecture_of_Sleep/index.html?returnTo=%2Fjournal",
    editorialNote:
      "This case presents anonymized dream material as literary patterns and personal context—not as diagnosis.",
    sections: [],
    relatedUpdates: [],
  },
] as const;

export const latestJournalEntry = journalEntries[0];

export function getJournalEntry(slug: string) {
  return journalEntries.find(entry => !entry.href && entry.slug === slug);
}
