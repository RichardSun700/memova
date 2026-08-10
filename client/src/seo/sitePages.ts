import { latestJournalEntry } from "../content/journalEntries";

export const SITE_URL = "https://memova.ai";
export const SOCIAL_IMAGE = `${SITE_URL}/memova-logo-transparent.png`;

export type ChangeFrequency = "weekly" | "monthly" | "yearly";
export type SchemaType =
  | "WebPage"
  | "AboutPage"
  | "SoftwareApplication"
  | "Article";

export type SitePage = {
  path: string;
  title: string;
  description: string;
  index: boolean;
  changeFrequency: ChangeFrequency;
  priority: number;
  summary: string;
  schemaType: SchemaType;
  hero?: {
    eyebrow: string;
    title: string;
    intro: string;
  };
};

const publicPages: SitePage[] = [
  {
    path: "/",
    title: "Memova — Your Context, Finally Understood",
    description:
      "Memova turns conversations, notes, files, and experiences into living Books, shareable Pages, and reviewable next actions.",
    index: true,
    changeFrequency: "weekly",
    priority: 1,
    summary:
      "Memova connects the context you choose to remember into living Books that grow over time, become useful Pages, and support actions and sharing that remain under your control.",
    schemaType: "SoftwareApplication",
    hero: {
      eyebrow: "Personal superalignment",
      title: "Your context, finally understood.",
      intro:
        "Turn your thoughts and experiences into living Books that understand you better over time.",
    },
  },
  {
    path: "/journal",
    title: "Building Memova in Public — Memova Journal",
    description:
      "Read edited, de-identified, and team-reviewed notes about the product decisions, questions, and lessons shaping Memova.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.8,
    summary:
      "Building Memova in Public is the team journal for carefully prepared notes about product decisions, open questions, and lessons from building Memova; every public entry is edited, de-identified, and reviewed before publication.",
    schemaType: "WebPage",
    hero: {
      eyebrow: "Memova Journal",
      title: "Building Memova in Public",
      intro:
        "Notes from what we are learning as we build, published only after editorial, privacy, and team review.",
    },
  },
  {
    path: `/journal/${latestJournalEntry.slug}`,
    title: `${latestJournalEntry.title} — Memova Journal`,
    description: latestJournalEntry.summary,
    index: true,
    changeFrequency: "monthly",
    priority: 0.78,
    summary: latestJournalEntry.summary,
    schemaType: "Article",
    hero: {
      eyebrow: `Building Memova in Public · ${latestJournalEntry.week}`,
      title: latestJournalEntry.title,
      intro: latestJournalEntry.summary,
    },
  },
  {
    path: "/product-journal",
    title: "Memova Product Journal — From Context to Compounding Knowledge",
    description:
      "Explore the complete Memova product journey from everyday context through Notes, Books, Pages, approved actions, and knowledge that compounds.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.85,
    summary:
      "The Memova Product Journal is a self-contained, chapter-based walkthrough showing how selected context becomes source-linked Notes, living Books, useful Pages, approved actions, and durable knowledge.",
    schemaType: "WebPage",
    hero: {
      eyebrow: "Product Journal",
      title: "Follow context as it becomes compounding knowledge.",
      intro:
        "Open the complete six-chapter Memova story, explore at your own pace, and close it whenever you are ready to return to the website.",
    },
  },
  {
    path: "/mcp",
    title: "Connect Memova Agent Memory With MCP",
    description:
      "Connect Memova’s user-controlled context to compatible agents through MCP while keeping memory editable and actions reviewable.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.65,
    summary:
      "Memova’s MCP connection lets compatible agents use user-controlled context from a private knowledge base while preserving review and approval boundaries.",
    schemaType: "WebPage",
    hero: {
      eyebrow: "Plugins & MCP",
      title: "Connect Memova to Codex and MCP clients.",
      intro:
        "Give compatible agents permissioned access to the context you choose—while your knowledge stays user-owned, editable, and reviewable.",
    },
  },
  {
    path: "/privacy",
    title: "Privacy Policy — Memova",
    description:
      "Read how Memova handles personal information, user-chosen context, connected services, data controls, and privacy requests.",
    index: true,
    changeFrequency: "yearly",
    priority: 0.35,
    summary:
      "The Memova privacy policy explains how the service handles personal information, user choices, connected services, retention, security, and privacy requests.",
    schemaType: "WebPage",
  },
  {
    path: "/terms",
    title: "Terms of Service — Memova",
    description:
      "Review the terms that govern access to and use of Memova products, websites, software, integrations, and related services.",
    index: true,
    changeFrequency: "yearly",
    priority: 0.3,
    summary:
      "The Memova terms explain the conditions that govern use of the website, software, integrations, accounts, user content, and related services.",
    schemaType: "WebPage",
  },
];

const privatePage: SitePage = {
  path: "/private",
  title: "Memova Account",
  description: "Private Memova account and connection page.",
  index: false,
  changeFrequency: "yearly",
  priority: 0,
  summary:
    "This private Memova account or connection page is not intended for search indexing.",
  schemaType: "WebPage",
};

const frameworkPreviewPage: SitePage = {
  ...privatePage,
  path: "/framework-preview",
  title: "Memova Homepage Framework Preview",
  description:
    "Local preview of the evolving Memova homepage framework and interaction design.",
  summary:
    "A private local preview used to review the Memova homepage narrative, product examples, responsive layout, and scroll-driven Book interaction before publication.",
};

const notFoundPage: SitePage = {
  ...privatePage,
  path: "/404",
  title: "Page Not Found — Memova",
  description: "The requested Memova page could not be found.",
  summary:
    "The requested page does not exist and should not appear in search results.",
};

const privatePrefixes = [
  "/login",
  "/profile",
  "/connected-clients",
  "/settings/",
  "/mcp/oauth/",
  "/user-cases/demos/",
];

export const sitePages = publicPages;

export function getSitePage(pathname: string): SitePage {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  if (normalized === "/framework-preview") {
    return frameworkPreviewPage;
  }
  if (normalized === "/privacy-policy") {
    return publicPages.find(page => page.path === "/privacy")!;
  }
  const exact = publicPages.find(page => page.path === normalized);
  if (exact) return exact;
  if (
    privatePrefixes.some(
      prefix => normalized === prefix || normalized.startsWith(prefix)
    )
  ) {
    return { ...privatePage, path: normalized };
  }
  return { ...notFoundPage, path: normalized };
}

export function getCanonicalUrl(page: SitePage): string {
  return new URL(page.path, SITE_URL).toString();
}

export function getStructuredData(page: SitePage) {
  const url = getCanonicalUrl(page);
  const base = {
    "@context": "https://schema.org",
    "@type": page.schemaType,
    name: page.title,
    description: page.description,
    url,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Memova",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Memova",
      url: SITE_URL,
      logo: SOCIAL_IMAGE,
    },
  };

  if (page.schemaType === "SoftwareApplication") {
    return {
      ...base,
      applicationCategory: "ProductivityApplication",
      operatingSystem: "iOS, Web",
    };
  }

  return base;
}
