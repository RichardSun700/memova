export const SITE_URL = "https://memova.ai";
export const SOCIAL_IMAGE = `${SITE_URL}/memova-logo-transparent.png`;

export type ChangeFrequency = "weekly" | "monthly" | "yearly";
export type SchemaType = "WebPage" | "AboutPage" | "SoftwareApplication" | "Article";

export type SitePage = {
  path: string;
  title: string;
  description: string;
  index: boolean;
  changeFrequency: ChangeFrequency;
  priority: number;
  summary: string;
  schemaType: SchemaType;
};

const publicPages: SitePage[] = [
  {
    path: "/",
    title: "Memova — From Everyday Context to Compounding Knowledge",
    description:
      "Explore how Memova turns ideas into context, context into action, and every approved result into private knowledge that compounds over time.",
    index: true,
    changeFrequency: "weekly",
    priority: 1,
    summary:
      "The complete Memova product story follows everyday context from capture through Notes, Pages, Books, approved actions, and source-linked knowledge that becomes more useful over time.",
    schemaType: "SoftwareApplication",
  },
  {
    path: "/ios",
    title: "Memova for iPhone — Join iOS Early Access",
    description:
      "Join Memova iOS early access and turn everyday context into private agent memory, follow-ups, plans, and useful workflows.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.95,
    summary:
      "Memova for iPhone provides a low-friction way to capture selected notes, conversations, and ideas, structure them as agent memory, and prepare useful next steps.",
    schemaType: "SoftwareApplication",
  },
  {
    path: "/agent-memory",
    title: "What Is Agent Memory? A Practical Definition by Memova",
    description:
      "Learn how agent memory turns everyday context into editable, source-grounded knowledge that agents can use for useful workflows.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.9,
    summary:
      "Agent memory is durable, editable, source-grounded context about people, projects, decisions, commitments, and preferences that an agent can use across workflows.",
    schemaType: "Article",
  },
  {
    path: "/how-it-works",
    title: "How Memova Turns Everyday Context Into Agent Workflows",
    description:
      "See how Memova moves from user-chosen capture to structured agent memory, useful workflow preparation, and human approval.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.9,
    summary:
      "Memova follows a transparent flow: capture context naturally, structure what matters, build reusable agent memory, prepare a workflow, and ask the user to approve consequential actions.",
    schemaType: "WebPage",
  },
  {
    path: "/user-cases",
    title: "Memova Use Cases — From Context to Useful Workflows",
    description:
      "Explore real examples of notes and conversations becoming agent memory, follow-ups, plans, briefs, and interactive workflows.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.85,
    summary:
      "Memova use cases show the complete transformation from a user’s original note or conversation to structured memory and a practical workflow outcome.",
    schemaType: "WebPage",
  },
  {
    path: "/use-cases/meeting-to-follow-up",
    title: "Meeting Notes to Decisions and Follow-Ups — Memova",
    description:
      "See how Memova turns meeting context into remembered decisions, owners, follow-ups, and a workflow ready for review.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.8,
    summary:
      "A meeting becomes more useful when its decisions, owners, commitments, and unresolved questions become durable agent memory and reviewable follow-up work.",
    schemaType: "Article",
  },
  {
    path: "/use-cases/idea-to-product-brief",
    title: "Founder Idea to Product Brief and Tasks — Memova",
    description:
      "See how Memova turns a loosely captured founder idea into agent memory, a product brief, open questions, and reviewable tasks.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.8,
    summary:
      "A loosely captured product idea becomes structured context about the user, problem, constraints, decisions, and open questions before Memova prepares a brief and tasks.",
    schemaType: "Article",
  },
  {
    path: "/use-cases/conversation-to-action-plan",
    title: "Important Conversation to Action Plan — Memova",
    description:
      "See how Memova preserves commitments and context from an important conversation, then prepares a calm action plan for approval.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.8,
    summary:
      "An important conversation can become durable memory about commitments, timing, people, and concerns, followed by a calm action plan that the user reviews.",
    schemaType: "Article",
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
  summary: "This private Memova account or connection page is not intended for search indexing.",
  schemaType: "WebPage",
};

const notFoundPage: SitePage = {
  ...privatePage,
  path: "/404",
  title: "Page Not Found — Memova",
  description: "The requested Memova page could not be found.",
  summary: "The requested page does not exist and should not appear in search results.",
};

const privatePrefixes = [
  "/login",
  "/profile",
  "/connected-clients",
  "/settings/",
  "/mcp/oauth/",
  "/bay-area-agent-demo-2",
  "/user-cases/demos/",
];

export const sitePages = publicPages;

export function getSitePage(pathname: string): SitePage {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  const exact = publicPages.find((page) => page.path === normalized);
  if (exact) return exact;
  if (privatePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix))) {
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
      operatingSystem: page.path === "/ios" ? "iOS" : "iOS, Web",
    };
  }

  return base;
}
