import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  FileText,
  Link2,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  Mic2,
  PenLine,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  CSSProperties,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { navigate } from "wouter/use-browser-location";

import PersonalManualImageWheel, {
  type PersonalManualWheelItem,
} from "@/components/home/PersonalManualImageWheel";
import ActionEcosystemBand from "@/components/home/ActionEcosystemBand";
import LivingBookContextStory from "@/components/home/LivingBookContextStory";
import PublishPhoneFan from "@/components/home/PublishPhoneFan";
import { latestJournalEntry } from "@/content/journalEntries";
import { productJournalEntryState } from "@/navigation/productJournalNavigation";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/home-framework-preview.css";

type WorkflowStageId = "capture" | "book" | "review";
type WorkflowStoryId = "apollo";

type WorkflowStage = {
  id: WorkflowStageId;
  shortLabel: string;
  label: string;
  title: string;
  body: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  imageFit: "cover" | "contain";
  visualNote: string;
  facts: readonly string[];
};

type WorkflowStory = {
  id: WorkflowStoryId;
  selectorLabel: string;
  coverKicker: string;
  coverTitle: string;
  coverMeta: string;
  coverImage: string;
  coverImageWidth: number;
  coverImageHeight: number;
  coverImageAlt: string;
  eyebrow: string;
  meta: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  stages: readonly WorkflowStage[];
};

const workflowStories: readonly WorkflowStory[] = [
  {
    id: "apollo",
    selectorLabel: "Apollo 11",
    coverKicker: "Apollo 11 archive",
    coverTitle: "After the Giant Leap",
    coverMeta: "Public history · Source-linked",
    coverImage: "/demo/media/earthrise-book-cover.jpg",
    coverImageWidth: 1800,
    coverImageHeight: 1800,
    coverImageAlt: "Earth rising above the lunar horizon during Apollo 11",
    eyebrow: "Public history · Apollo 11",
    meta: "NASA source material · Educational adaptation",
    title: "Apollo 11: After the Giant Leap",
    summary:
      "Public mission records move through the full Memova loop: captured together, organized into a Living Book, and turned into reviewable Pages and actions.",
    href: "/product-journal",
    cta: "Explore the 6-chapter story",
    stages: [
      {
        id: "capture",
        shortLabel: "Capture",
        label: "Capture",
        title: "Bring the mission record together.",
        body: "Mission reports, photographs, transcripts, and notes enter one source-linked project instead of living in separate tabs.",
        image: "/demo/media/kb-apollo-case-entry-ui.png",
        imageWidth: 1320,
        imageHeight: 2868,
        imageAlt:
          "Memova mobile workspace showing the Apollo 11 source-linked sample note",
        imageFit: "contain",
        visualNote: "Apollo 11 Archive · Source-linked sample",
        facts: ["NASA records", "Mission media", "Read-only sample"],
      },
      {
        id: "book",
        shortLabel: "Book",
        label: "Build the Book",
        title: "Build the story behind the mission.",
        body: "Evidence, findings, decisions, and carry-forward actions remain connected inside one evolving Living Book.",
        image: "/demo/media/project-book-knowledge.png",
        imageWidth: 1254,
        imageHeight: 1254,
        imageAlt:
          "An illustrated Memova Living Book holding the connected Apollo 11 project context",
        imageFit: "contain",
        visualNote: "Sources → Pages → Suggested actions",
        facts: ["Source-linked", "Living context", "Suggested actions"],
      },
      {
        id: "review",
        shortLabel: "Review",
        label: "Review & share",
        title: "Review the Page. Choose every channel.",
        body: "Open the completed HTML mission debrief, then adapt the same approved context into versions for X, LinkedIn, and TikTok.",
        image: "/demo/media/apollo-user-story-card-v1.webp",
        imageWidth: 1200,
        imageHeight: 916,
        imageAlt:
          "The Apollo 11 After the Giant Leap HTML Page created from connected mission material",
        imageFit: "contain",
        visualNote: "Completed HTML Page · Review before sharing",
        facts: ["HTML Page", "X · LinkedIn · TikTok", "Review before sharing"],
      },
    ],
  },
] as const;

const personalManualWheelItems = [
  {
    id: "publicity-1953",
    src: "/demo/media/personal-manual-marilyn/marilyn-1953-publicity.webp",
    width: 800,
    height: 980,
    label: "Publicity portrait, 1953",
    alt: "Public-domain 1953 publicity portrait of Marilyn Monroe",
    objectPosition: "50% 32%",
  },
  {
    id: "niagara-1953",
    src: "/demo/media/personal-manual-marilyn/marilyn-1953-niagara.webp",
    width: 551,
    height: 670,
    label: "Niagara portrait, 1953",
    alt: "Public-domain portrait of Marilyn Monroe from 1953",
    objectPosition: "50% 30%",
  },
  {
    id: "gentlemen-prefer-blondes",
    src: "/demo/media/personal-manual-marilyn/marilyn-gentlemen-prefer-blondes.webp",
    width: 700,
    height: 906,
    label: "Gentlemen Prefer Blondes",
    alt: "Public-domain publicity photograph for Gentlemen Prefer Blondes",
    objectPosition: "50% 28%",
  },
  {
    id: "jane-russell",
    src: "/demo/media/personal-manual-marilyn/marilyn-jane-russell.webp",
    width: 800,
    height: 800,
    label: "With Jane Russell",
    alt: "Public-domain photograph of Marilyn Monroe and Jane Russell",
  },
  {
    id: "uso-korea",
    src: "/demo/media/personal-manual-marilyn/marilyn-uso-korea.webp",
    width: 762,
    height: 592,
    label: "USO tour, Korea",
    alt: "Public-domain photograph of Marilyn Monroe during the 1954 USO tour in Korea",
  },
  {
    id: "korea-air-force",
    src: "/demo/media/personal-manual-marilyn/marilyn-korea-air-force.webp",
    width: 800,
    height: 556,
    label: "Air Force performance, 1954",
    alt: "Public-domain photograph of Marilyn Monroe performing in Korea in 1954",
  },
  {
    id: "portrait-1961",
    src: "/demo/media/personal-manual-marilyn/marilyn-1961.webp",
    width: 800,
    height: 1080,
    label: "Portrait, 1961",
    alt: "Public-domain portrait of Marilyn Monroe from 1961",
    objectPosition: "50% 30%",
  },
  {
    id: "mexico-1962",
    src: "/demo/media/personal-manual-marilyn/marilyn-mexico-1962.webp",
    width: 720,
    height: 548,
    label: "Mexico visit, 1962",
    alt: "Public-domain photograph of Marilyn Monroe during a visit to Mexico in 1962",
  },
] as const satisfies readonly PersonalManualWheelItem[];

const contextDirections = [
  {
    number: "01",
    label: "Build with context",
    title: "Keep the why behind the work.",
    body: "Keep research, conversations, decisions, and work outputs connected as a project evolves.",
    illustration: {
      src: "/demo/media/context-directions/project-flow-v1.webp",
      width: 752,
      height: 506,
      alt: "A connected workflow of linked project steps and decisions",
    },
    examples: [
      "Founder updates",
      "Product decisions",
      "Research",
      "Project progress",
    ],
    outcome: ["Project Book", "HTML Page", "Reviewed update"],
  },
  {
    number: "02",
    label: "Understand yourself over time",
    title: "See the patterns across your life.",
    body: "Bring together journals, dreams, AI conversations, and lived experiences to reveal what would otherwise remain scattered.",
    illustration: {
      src: "/demo/media/context-directions/living-book-growth-v1.webp",
      width: 600,
      height: 600,
      alt: "An open book growing into a colorful branching pattern",
    },
    examples: [
      "Dreams",
      "Daily reflections",
      "AI conversations",
      "Changing preferences",
    ],
    outcome: ["Personal Book", "Personal Manual", "Selected Pages"],
  },
] as const;

const trustProofs = [
  {
    icon: LockKeyhole,
    title: "Your inputs stay private.",
    body: "Sources, Books, and working Personal Manuals remain in your private workspace by default.",
  },
  {
    icon: Link2,
    title: "Sources stay connected.",
    body: "Each generated Page keeps the references and context behind it connected inside Memova.",
  },
  {
    icon: PenLine,
    title: "Review every shareable version.",
    body: "Correct a Personal Manual, edit a Page, and remove sensitive details before anything becomes external.",
  },
  {
    icon: ShieldCheck,
    title: "Confirm every destination.",
    body: "You choose the final version, channel, visibility, and moment for sharing.",
  },
] as const;

type HeroSource = {
  id: string;
  label: string;
  detail: string;
  note: string;
  icon: typeof FileText;
  rotation: number;
  thumbnail?: string;
  badge?: string;
};

export type HeroPathPoint = { x: number; y: number };
export type HeroPathSegment = [
  HeroPathPoint,
  HeroPathPoint,
  HeroPathPoint,
  HeroPathPoint,
];

export const desktopHeroPath: HeroPathSegment[] = [
  [
    { x: 0.08, y: 0.12 },
    { x: 0.34, y: 0.01 },
    { x: 0.78, y: 0.03 },
    { x: 0.9, y: 0.18 },
  ],
  [
    { x: 0.9, y: 0.18 },
    { x: 0.97, y: 0.32 },
    { x: 0.16, y: 0.27 },
    { x: 0.18, y: 0.43 },
  ],
  [
    { x: 0.18, y: 0.43 },
    { x: 0.2, y: 0.57 },
    { x: 0.95, y: 0.47 },
    { x: 0.9, y: 0.61 },
  ],
  [
    { x: 0.9, y: 0.61 },
    { x: 0.86, y: 0.73 },
    { x: 0.39, y: 0.68 },
    { x: 0.49, y: 0.79 },
  ],
  [
    { x: 0.49, y: 0.79 },
    { x: 0.51, y: 0.83 },
    { x: 0.53, y: 0.86 },
    { x: 0.54, y: 0.88 },
  ],
];

export const mobileHeroPath: HeroPathSegment[] = [
  [
    { x: 0.82, y: 0.1 },
    { x: 0.95, y: 0.14 },
    { x: 0.26, y: 0.15 },
    { x: 0.16, y: 0.25 },
  ],
  [
    { x: 0.16, y: 0.25 },
    { x: 0.07, y: 0.34 },
    { x: 0.93, y: 0.3 },
    { x: 0.82, y: 0.42 },
  ],
  [
    { x: 0.82, y: 0.42 },
    { x: 0.7, y: 0.54 },
    { x: 0.14, y: 0.45 },
    { x: 0.22, y: 0.57 },
  ],
  [
    { x: 0.22, y: 0.57 },
    { x: 0.29, y: 0.67 },
    { x: 0.62, y: 0.63 },
    { x: 0.51, y: 0.76 },
  ],
  [
    { x: 0.51, y: 0.76 },
    { x: 0.5, y: 0.8 },
    { x: 0.5, y: 0.83 },
    { x: 0.5, y: 0.85 },
  ],
];

const clampHeroProgress = (value: number) => Math.min(1, Math.max(0, value));

const smoothHeroProgress = (value: number) => {
  const bounded = clampHeroProgress(value);
  return bounded * bounded * (3 - 2 * bounded);
};

export const getHeroSourceBaseOpacity = (progress: number, mobile: boolean) => {
  if (!mobile) return 0.92;

  const mobileSourceVisibility = smoothHeroProgress(progress / 0.26);
  return 0.22 + mobileSourceVisibility * 0.18;
};

function getHeroCubicPoint(
  segment: HeroPathSegment,
  progress: number
): HeroPathPoint {
  const [start, controlA, controlB, end] = segment;
  const inverse = 1 - progress;
  const inverseSquared = inverse * inverse;
  const progressSquared = progress * progress;

  return {
    x:
      inverseSquared * inverse * start.x +
      3 * inverseSquared * progress * controlA.x +
      3 * inverse * progressSquared * controlB.x +
      progressSquared * progress * end.x,
    y:
      inverseSquared * inverse * start.y +
      3 * inverseSquared * progress * controlA.y +
      3 * inverse * progressSquared * controlB.y +
      progressSquared * progress * end.y,
  };
}

export function retargetHeroPath(
  segments: HeroPathSegment[],
  endpoint: HeroPathPoint
): HeroPathSegment[] {
  const retargeted = segments.map(segment =>
    segment.map(point => ({ ...point }))
  ) as HeroPathSegment[];
  const finalSegment = retargeted.at(-1);
  if (!finalSegment) return retargeted;

  const originalEndpoint = finalSegment[3];
  const delta = {
    x: endpoint.x - originalEndpoint.x,
    y: endpoint.y - originalEndpoint.y,
  };

  finalSegment[2] = {
    x: finalSegment[2].x + delta.x,
    y: finalSegment[2].y + delta.y,
  };
  finalSegment[3] = { ...endpoint };
  return retargeted;
}

export function createHeroPathSampler(
  segments: HeroPathSegment[],
  width: number,
  height: number
) {
  const samples: Array<HeroPathPoint & { distance: number }> = [];
  let distance = 0;
  let previous: HeroPathPoint | undefined;

  segments.forEach((segment, segmentIndex) => {
    for (let step = 0; step <= 36; step += 1) {
      if (segmentIndex > 0 && step === 0) continue;
      const normalized = getHeroCubicPoint(segment, step / 36);
      const point = { x: normalized.x * width, y: normalized.y * height };
      if (previous) {
        distance += Math.hypot(point.x - previous.x, point.y - previous.y);
      }
      samples.push({ ...point, distance });
      previous = point;
    }
  });

  return (progress: number) => {
    const target = clampHeroProgress(progress) * distance;
    let low = 0;
    let high = samples.length - 1;

    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (samples[middle].distance < target) low = middle + 1;
      else high = middle;
    }

    const next = samples[low];
    const previousSample = samples[Math.max(0, low - 1)];
    const span = next.distance - previousSample.distance;
    const localProgress =
      span > Number.EPSILON
        ? clampHeroProgress((target - previousSample.distance) / span)
        : 1;

    return {
      x: previousSample.x + (next.x - previousSample.x) * localProgress,
      y: previousSample.y + (next.y - previousSample.y) * localProgress,
      angle: Math.atan2(next.y - previousSample.y, next.x - previousSample.x),
    };
  };
}

const heroSources: HeroSource[] = [
  {
    id: "meeting",
    label: "Customer interview",
    detail: "Interview #12 · 24 min",
    note: "“I understand the problem, but not the workflow.”",
    icon: MessageSquareText,
    rotation: -7,
  },
  {
    id: "voice",
    label: "Founder voice note",
    detail: "Day 04 · 02:14",
    note: "Lead the launch story with one clear outcome.",
    icon: Mic2,
    rotation: 6,
  },
  {
    id: "pdf",
    label: "Launch plan.pdf",
    detail: "30-day plan · 8 pages",
    note: "Private beta → public release.",
    icon: FileText,
    rotation: -4,
    badge: "PDF",
  },
  {
    id: "screenshot",
    label: "Product prototype",
    detail: "Dashboard · Beta build",
    note: "The first-run workflow needs to feel obvious.",
    icon: Sparkles,
    rotation: 5,
    thumbnail: "/user-cases/thumbs/product_iteration_alignment_dashboard.png",
  },
  {
    id: "research",
    label: "Market research",
    detail: "AI productivity",
    note: "Early adopters need context before features.",
    icon: Link2,
    rotation: -6,
  },
  {
    id: "idea",
    label: "Founder note",
    detail: "Private · Day 12",
    note: "Share the beta journey, not just launch day.",
    icon: PenLine,
    rotation: 7,
  },
  {
    id: "customer",
    label: "Customer call",
    detail: "Design partner · 31 min",
    note: "Simplify how the workflow is explained.",
    icon: MessageSquareText,
    rotation: -5,
  },
  {
    id: "reflection",
    label: "Product decision",
    detail: "Onboarding · Day 16",
    note: "Simplify onboarding around one core outcome.",
    icon: PenLine,
    rotation: 4,
  },
  {
    id: "brief",
    label: "Prototype feedback",
    detail: "Round 3 · 6 reviews",
    note: "The new flow makes the first value clearer.",
    icon: FileText,
    rotation: -3,
  },
  {
    id: "reference",
    label: "Launch materials",
    detail: "Page · update · social",
    note: "One story, adapted after founder review.",
    icon: Link2,
    rotation: 6,
  },
];

function HomeV2Header() {
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountName = auth.user?.display_name?.trim() || "Memova account";
  const accountInitial = accountName.charAt(0).toUpperCase() || "M";

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [accountOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="home-v2-header">
      <div className="home-v2-container home-v2-header-inner">
        <a className="home-v2-logo" href="#top" aria-label="Memova home">
          <img src="/memova-logo-transparent.png" alt="Memova" />
        </a>

        <nav className="home-v2-desktop-nav" aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#use-cases">Use Cases</a>
          <a href="/journal">Journal</a>
          <a href="#trust">Trust</a>
        </nav>

        <div className="home-v2-header-actions">
          <a className="home-v2-button home-v2-header-cta" href="#waitlist">
            <span className="home-v2-header-cta-long">Join Early Access</span>
            <span className="home-v2-header-cta-short">Join</span>
          </a>
          {auth.isAuthenticated ? (
            <div className="home-v2-account-menu" ref={accountMenuRef}>
              <button
                className="home-v2-account-trigger"
                type="button"
                aria-label={`Open ${accountName}'s account menu`}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen(open => !open)}
              >
                <span className="home-v2-account-avatar" aria-hidden="true">
                  {auth.user?.avatar_url ? (
                    <img
                      key={auth.user.avatar_version || auth.user.avatar_url}
                      src={auth.user.avatar_url}
                      alt=""
                      onError={() => void auth.refreshUser().catch(() => {})}
                    />
                  ) : (
                    accountInitial
                  )}
                </span>
                <span>{accountName}</span>
                <ChevronDown className="home-v2-account-chevron" aria-hidden="true" />
              </button>
              {accountOpen ? (
                <div className="home-v2-account-popover" role="menu" aria-label="Account">
                  <a href="/profile" role="menuitem" onClick={() => setAccountOpen(false)}>
                    <UserRound aria-hidden="true" />
                    Profile
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false);
                      void auth.logout();
                    }}
                  >
                    <LogOut aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <a className="home-v2-sign-in" href="/login">
              Sign in
            </a>
          )}
          <button
            type="button"
            className="home-v2-menu-button"
            aria-expanded={mobileOpen}
            aria-controls="home-v2-mobile-nav"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen(open => !open)}
          >
            {mobileOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="home-v2-mobile-nav"
          className="home-v2-mobile-nav"
          aria-label="Mobile navigation"
        >
          <div className="home-v2-container home-v2-mobile-nav-inner">
            <a href="#product" onClick={closeMobileMenu}>
              Product <ChevronRight aria-hidden="true" />
            </a>
            <a href="#use-cases" onClick={closeMobileMenu}>
              Use Cases <ChevronRight aria-hidden="true" />
            </a>
            <a href="/journal" onClick={closeMobileMenu}>
              Journal <ChevronRight aria-hidden="true" />
            </a>
            <a href="#trust" onClick={closeMobileMenu}>
              Trust <ChevronRight aria-hidden="true" />
            </a>
            {auth.isAuthenticated ? (
              <div className="home-v2-mobile-account">
                <a href="/profile" onClick={closeMobileMenu}>
                  <span className="home-v2-account-avatar" aria-hidden="true">
                    {auth.user?.avatar_url ? (
                      <img
                        key={auth.user.avatar_version || auth.user.avatar_url}
                        src={auth.user.avatar_url}
                        alt=""
                        onError={() => void auth.refreshUser().catch(() => {})}
                      />
                    ) : (
                      accountInitial
                    )}
                  </span>
                  <span>{accountName}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    void auth.logout();
                  }}
                >
                  <LogOut aria-hidden="true" />
                  Log out
                </button>
              </div>
            ) : (
              <a href="/login" onClick={closeMobileMenu}>
                Sign in <ChevronRight aria-hidden="true" />
              </a>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function HeroSourceCard({
  source,
  index,
}: {
  source: HeroSource;
  index: number;
}) {
  const Icon = source.icon;

  return (
    <article
      className={`home-v3-source-card home-v3-source-${source.id}`}
      data-hero-source
      data-source-index={index}
      data-rotation={source.rotation}
      style={
        {
          "--source-rotation-start": `${source.rotation}deg`,
        } as CSSProperties
      }
    >
      {source.thumbnail ? (
        <img
          className="home-v3-source-thumbnail"
          src={source.thumbnail}
          alt=""
          width="430"
          height="760"
          loading="eager"
          decoding="async"
        />
      ) : null}
      <div className="home-v3-source-heading">
        <span className="home-v3-source-icon">
          <Icon aria-hidden="true" />
        </span>
        <span>
          <strong>{source.label}</strong>
          <small>{source.detail}</small>
        </span>
        {source.badge ? (
          <span className="home-v3-source-badge">{source.badge}</span>
        ) : null}
      </div>
      <p>{source.note}</p>
    </article>
  );
}

function HeroBookStory() {
  return (
    <div className="home-v3-book-story" data-hero-motion-stage>
      <div className="home-v3-source-field" aria-hidden="true">
        {heroSources.map((source, index) => (
          <HeroSourceCard source={source} index={index} key={source.id} />
        ))}
      </div>

      <span
        className="home-v3-book-intake"
        data-book-intake
        aria-hidden="true"
      />

      <figure className="home-v3-book-figure" data-hero-book>
        <img
          className="home-v3-book-base-image"
          src="/demo/media/hero-open-book-complete-v4.webp"
          alt=""
          width="1671"
          height="941"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="home-v3-book-spread-content"
          data-generated-page
          aria-label="Suggested actions and an illustrative founder launch Page generated from the connected sources"
        >
          <img
            className="home-v3-book-final-composite"
            src="/demo/media/hero-book-final-reference-v5-960.webp"
            srcSet="/demo/media/hero-book-final-reference-v5-960.webp 960w, /demo/media/hero-book-final-reference-v5-1857.webp 1857w"
            sizes="(min-width: 900px) min(110vw, 860px), 102vw"
            alt=""
            width="1857"
            height="847"
            fetchPriority="high"
            decoding="async"
          />
          <section
            className="home-v3-book-left-page"
            aria-labelledby="home-v3-actions-title"
          >
            <div className="home-v3-book-page-inner home-v3-book-left-inner">
              <div
                className="home-v3-page-reveal home-v3-actions-intro"
                data-page-reveal
                data-reveal-start="0.52"
                data-reveal-span="0.12"
              >
                <p className="home-v3-book-page-label">
                  Structured from founder inputs
                </p>
                <h2 id="home-v3-actions-title">Suggested actions</h2>
              </div>
              <ol className="home-v3-action-list">
                <li
                  className="home-v3-page-reveal"
                  data-page-reveal
                  data-reveal-start="0.6"
                  data-reveal-span="0.12"
                >
                  <span>01</span>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Clarify the product story around one core outcome.
                    </span>
                    <span className="home-v3-copy-mobile">
                      Clarify one core outcome.
                    </span>
                  </p>
                </li>
                <li
                  className="home-v3-page-reveal"
                  data-page-reveal
                  data-reveal-start="0.65"
                  data-reveal-span="0.12"
                >
                  <span>02</span>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Move customer insights into the launch narrative.
                    </span>
                    <span className="home-v3-copy-mobile">
                      Move insights into the story.
                    </span>
                  </p>
                </li>
                <li
                  className="home-v3-page-reveal"
                  data-page-reveal
                  data-reveal-start="0.7"
                  data-reveal-span="0.12"
                >
                  <span>03</span>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Share the beta journey with early users.
                    </span>
                    <span className="home-v3-copy-mobile">
                      Share the beta journey.
                    </span>
                  </p>
                </li>
              </ol>

              <section
                className="home-v3-page-reveal home-v3-signals"
                data-page-reveal
                data-reveal-start="0.75"
                data-reveal-span="0.13"
                aria-labelledby="home-v3-signals-title"
              >
                <h3 id="home-v3-signals-title">Signals reviewed</h3>
                <ul>
                  <li>
                    <MessageSquareText aria-hidden="true" />
                    <strong>12</strong>
                    <span>Customer interviews</span>
                  </li>
                  <li>
                    <UsersRound aria-hidden="true" />
                    <strong>8</strong>
                    <span>Product discussions</span>
                  </li>
                  <li>
                    <Sparkles aria-hidden="true" />
                    <strong>6</strong>
                    <span>Prototype reviews</span>
                  </li>
                  <li>
                    <PenLine aria-hidden="true" />
                    <strong>5</strong>
                    <span>Founder notes</span>
                  </li>
                </ul>
              </section>

              <p
                className="home-v3-page-reveal home-v3-actions-source"
                data-page-reveal
                data-reveal-start="0.86"
                data-reveal-span="0.1"
              >
                <RefreshCcw aria-hidden="true" /> 31 sources connected
              </p>
            </div>
          </section>

          <article
            className="home-v3-book-right-webpage"
            aria-labelledby="home-v3-webpage-title"
          >
            <div className="home-v3-book-page-inner home-v3-book-right-inner">
              <div
                className="home-v3-page-reveal home-v3-webpage-intro"
                data-page-reveal
                data-reveal-start="0.56"
                data-reveal-span="0.12"
              >
                <header className="home-v3-webpage-header">
                  <span>Memova Page</span>
                  <span className="home-v3-webpage-draft">
                    Illustrative case
                  </span>
                </header>
                <h2 id="home-v3-webpage-title">
                  <span className="home-v3-copy-desktop">
                    Building in Public:
                    <br />
                    AI Product Launch
                  </span>
                  <span className="home-v3-copy-mobile">AI Product Launch</span>
                </h2>
              </div>

              <img
                className="home-v3-page-reveal home-v3-launch-brief-image"
                data-page-reveal
                data-reveal-start="0.62"
                data-reveal-span="0.14"
                src="/demo/media/ai-product-launch-workspace-v1-480.webp"
                srcSet="/demo/media/ai-product-launch-workspace-v1-480.webp 480w, /demo/media/ai-product-launch-workspace-v1-960.webp 960w"
                sizes="(min-width: 900px) 300px, 44vw"
                alt="Illustrative AI founder workspace with a product dashboard, prototype feedback, launch calendar, and handwritten notes"
                width="960"
                height="400"
                loading="lazy"
                decoding="async"
              />

              <section
                className="home-v3-page-reveal home-v3-webpage-summary"
                data-page-reveal
                data-reveal-start="0.7"
                data-reveal-span="0.13"
                aria-label="Summary"
              >
                <span>Building in public</span>
                <p>
                  We turned customer conversations, product decisions, and
                  founder notes into a launch story ready to share.
                </p>
              </section>

              <div
                className="home-v3-page-reveal home-v3-webpage-flow"
                data-page-reveal
                data-reveal-start="0.78"
                data-reveal-span="0.12"
                aria-label="Capture, synthesize, share"
              >
                <span>Capture</span>
                <ArrowRight aria-hidden="true" />
                <span>Synthesize</span>
                <ArrowRight aria-hidden="true" />
                <span>Share</span>
              </div>

              <div
                className="home-v3-page-reveal home-v3-brief-cards"
                data-page-reveal
                data-reveal-start="0.82"
                data-reveal-span="0.12"
              >
                <section>
                  <header>
                    <span className="home-v3-brief-card-icon">
                      <UsersRound aria-hidden="true" />
                    </span>
                    <strong>Audience</strong>
                  </header>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Early adopters
                      <br />
                      AI builders
                      <br />
                      Design partners
                    </span>
                    <span className="home-v3-copy-mobile">AI builders</span>
                  </p>
                </section>
                <section>
                  <header>
                    <span className="home-v3-brief-card-icon">
                      <FileText aria-hidden="true" />
                    </span>
                    <strong>Output</strong>
                  </header>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Launch page
                      <br />
                      Founder update
                      <br />
                      Social drafts
                    </span>
                    <span className="home-v3-copy-mobile">Launch page</span>
                  </p>
                </section>
                <section className="home-v3-brief-card-status">
                  <header>
                    <span className="home-v3-brief-card-icon">
                      <CircleCheck aria-hidden="true" />
                    </span>
                    <strong>Status</strong>
                  </header>
                  <p>
                    <span className="home-v3-copy-desktop">
                      Ready for founder review
                    </span>
                    <span className="home-v3-copy-mobile">For review</span>
                  </p>
                </section>
              </div>

              <footer
                className="home-v3-page-reveal home-v3-webpage-footer"
                data-page-reveal
                data-reveal-start="0.89"
                data-reveal-span="0.1"
              >
                <span className="home-v3-page-status">
                  <Check aria-hidden="true" />
                  <span className="home-v3-copy-desktop">
                    Ready for founder review
                  </span>
                  <span className="home-v3-copy-mobile">For review</span>
                </span>
                <span>
                  <LockKeyhole aria-hidden="true" />
                  <span className="home-v3-copy-desktop">
                    Private until shared
                  </span>
                  <span className="home-v3-copy-mobile">Private</span>
                </span>
              </footer>
            </div>
          </article>
        </div>
        <figcaption>One living Book</figcaption>
      </figure>
    </div>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const motionStage = hero.querySelector<HTMLElement>(
      "[data-hero-motion-stage]"
    );
    if (!motionStage) return;
    const bookIntake = hero.querySelector<HTMLElement>("[data-book-intake]");

    const sources = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-hero-source]")
    );
    const book = hero.querySelector<HTMLElement>("[data-hero-book]");
    const page = hero.querySelector<HTMLElement>("[data-generated-page]");
    const pageRevealNodes = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-page-reveal]")
    );
    const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
    const announcement = hero.querySelector<HTMLElement>(
      "[data-hero-announcement]"
    );
    let frame = 0;
    let cachedWidth = 0;
    let cachedHeight = 0;
    let cachedMobilePath = false;
    let geometryDirty = true;
    let lastRenderedProgress = Number.NaN;
    let lastRenderedReducedMotion: boolean | undefined;
    let samplePath = createHeroPathSampler(desktopHeroPath, 1, 1);

    const render = () => {
      frame = 0;
      const reducedMotion = reducedMotionQuery.matches;
      hero.dataset.reducedMotion = reducedMotion ? "true" : "false";
      hero.dataset.motionReady = "true";
      if (reducedMotion) {
        if (lastRenderedReducedMotion === true && !geometryDirty) return;
        hero.dataset.scrollPhase = "page";
        hero.style.setProperty("--hero-progress", "1");
        lastRenderedProgress = 1;
        lastRenderedReducedMotion = true;
        geometryDirty = false;
        return;
      }

      const rect = hero.getBoundingClientRect();
      const runway = Math.max(1, hero.offsetHeight - window.innerHeight);
      const animationRunway = Math.max(1, runway * 0.82);
      const progress =
        Math.round(clampHeroProgress(-rect.top / animationRunway) * 10_000) /
        10_000;
      const mobile = window.innerWidth < 900;
      const mobilePath = mobile && window.innerHeight >= 500;
      const stageWidth = motionStage.clientWidth;
      const stageHeight = motionStage.clientHeight;

      if (
        progress === lastRenderedProgress &&
        lastRenderedReducedMotion === false &&
        !geometryDirty
      ) {
        return;
      }

      if (
        geometryDirty ||
        stageWidth !== cachedWidth ||
        stageHeight !== cachedHeight ||
        mobilePath !== cachedMobilePath
      ) {
        cachedWidth = stageWidth;
        cachedHeight = stageHeight;
        cachedMobilePath = mobilePath;
        const stageRect = motionStage.getBoundingClientRect();
        const intakeRect = bookIntake?.getBoundingClientRect();
        const endpoint = intakeRect
          ? {
              x: clampHeroProgress(
                (intakeRect.left + intakeRect.width / 2 - stageRect.left) /
                  Math.max(1, stageWidth)
              ),
              y: clampHeroProgress(
                (intakeRect.top + intakeRect.height / 2 - stageRect.top) /
                  Math.max(1, stageHeight)
              ),
            }
          : mobilePath
            ? mobileHeroPath.at(-1)?.[3]
            : desktopHeroPath.at(-1)?.[3];
        const pathTemplate = mobilePath ? mobileHeroPath : desktopHeroPath;
        samplePath = createHeroPathSampler(
          endpoint ? retargetHeroPath(pathTemplate, endpoint) : pathTemplate,
          stageWidth,
          stageHeight
        );
        geometryDirty = false;
      }

      lastRenderedProgress = progress;
      lastRenderedReducedMotion = false;

      hero.style.setProperty("--hero-progress", progress.toFixed(4));
      hero.dataset.scrollPhase =
        progress < 0.52 ? "sources" : progress < 0.89 ? "forming" : "page";

      sources.forEach((source, index) => {
        const chainStep =
          (mobile ? 0.39 : 0.43) / Math.max(1, sources.length - 1);
        const chainOffset = (sources.length - 1 - index) * chainStep;
        const pathProgress = clampHeroProgress(progress * 1.12 + chainOffset);
        const point = samplePath(pathProgress);
        const intake = smoothHeroProgress((pathProgress - 0.83) / 0.17);
        const startRotation = Number(source.dataset.rotation ?? 0);
        const pathAngle = (point.angle * 180) / Math.PI;
        const rotation = pathAngle * 0.13 + startRotation * (1 - intake) * 0.48;
        const baseScale = mobile ? 0.82 : 0.92;
        const scale = baseScale * (1 - intake * 0.72);
        const baseOpacity = getHeroSourceBaseOpacity(progress, mobile);
        const opacity = baseOpacity * (1 - intake);

        source.style.setProperty("--source-x", `${point.x.toFixed(2)}px`);
        source.style.setProperty("--source-y", `${point.y.toFixed(2)}px`);
        source.style.setProperty("--source-scale", scale.toFixed(4));
        source.style.setProperty(
          "--source-rotation",
          `${rotation.toFixed(2)}deg`
        );
        source.style.setProperty("--source-opacity", opacity.toFixed(4));
        source.style.setProperty(
          "--source-depth",
          String(30 + Math.round(pathProgress * 50))
        );
      });

      const bookProgress = smoothHeroProgress((progress - 0.16) / 0.58);
      if (book) {
        const startScale = mobile ? 0.78 : 0.86;
        const bookScale = startScale + (1 - startScale) * bookProgress;
        const bookY = (1 - bookProgress) * (mobile ? 58 : 42);
        book.style.setProperty("--book-scale", bookScale.toFixed(4));
        book.style.setProperty("--book-y", `${bookY.toFixed(2)}px`);
      }

      const pageProgress = smoothHeroProgress((progress - 0.48) / 0.1);
      if (page) {
        page.style.setProperty("--page-opacity", pageProgress.toFixed(4));
        page.style.setProperty(
          "--page-scale",
          (0.985 + pageProgress * 0.015).toFixed(4)
        );
        page.style.setProperty(
          "--page-y",
          `${((1 - pageProgress) * 6).toFixed(2)}px`
        );
      }

      pageRevealNodes.forEach(node => {
        const revealStart = Number(node.dataset.revealStart ?? 0.5);
        const revealSpan = Number(node.dataset.revealSpan ?? 0.16);
        const revealProgress = smoothHeroProgress(
          (progress - revealStart) / revealSpan
        );
        node.style.setProperty("--reveal-opacity", revealProgress.toFixed(4));
        node.style.setProperty(
          "--reveal-y",
          `${((1 - revealProgress) * 7).toFixed(2)}px`
        );
      });

      if (copy) {
        const copyProgress = smoothHeroProgress((progress - 0.52) / 0.38);
        const minimumOpacity = mobile ? 0.04 : 0.72;
        copy.style.setProperty(
          "--copy-opacity",
          (1 - copyProgress * (1 - minimumOpacity)).toFixed(4)
        );
        copy.style.setProperty(
          "--copy-y",
          `${(-copyProgress * (mobile ? 34 : 12)).toFixed(2)}px`
        );
      }

      if (announcement) {
        const announcementProgress = smoothHeroProgress(
          (progress - 0.52) / 0.3
        );
        announcement.style.setProperty(
          "--announcement-opacity",
          (1 - announcementProgress * (mobile ? 0.92 : 0.2)).toFixed(4)
        );
      }
    };

    const scheduleRender = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    };

    const refreshGeometry = () => {
      geometryDirty = true;
      scheduleRender();
    };

    const handleReducedMotionChange = () => {
      lastRenderedReducedMotion = undefined;
      scheduleRender();
    };

    render();
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", refreshGeometry, { passive: true });
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refreshGeometry);
    resizeObserver?.observe(motionStage);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", refreshGeometry);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="home-v3-hero"
      aria-labelledby="home-v2-title"
      data-scroll-hero
      data-scroll-phase="sources"
      data-motion-ready="false"
    >
      <div className="home-v3-hero-sticky">
        <div className="home-v2-container home-v3-hero-container">
          <a
            className="home-v2-announcement home-v3-announcement"
            href="/journal"
            aria-label={`Open the Memova Journal: ${latestJournalEntry.title}`}
            data-hero-announcement
          >
            <Sparkles aria-hidden="true" />
            <span className="home-v2-announcement-type">
              Building Memova in Public · {latestJournalEntry.week}
            </span>
            <span className="home-v2-announcement-divider" aria-hidden="true">
              —
            </span>
            <span>{latestJournalEntry.title}</span>
            <ArrowRight aria-hidden="true" />
          </a>

          <div className="home-v3-hero-stage">
            <div className="home-v3-hero-copy" data-hero-copy>
              <h1 id="home-v2-title">
                <span>YOUR CONTEXT,</span> <span>FINALLY UNDERSTOOD.</span>
              </h1>
              <p className="home-v3-hero-subhead">
                Turn your thoughts and experiences into living books that
                understand you better over time.
              </p>
              <a
                className="home-v2-button home-v3-primary-cta"
                href="#waitlist"
              >
                Join Early Access <ArrowRight aria-hidden="true" />
              </a>
            </div>

            <HeroBookStory />
          </div>
        </div>
      </div>
    </section>
  );
}

const apolloLogoLaunchPath: HeroPathSegment[] = [
  [
    { x: 0.07, y: 0.76 },
    { x: 0.07, y: 0.61 },
    { x: 0.07, y: 0.38 },
    { x: 0.07, y: 0.2 },
  ],
  [
    { x: 0.07, y: 0.2 },
    { x: 0.07, y: 0.02 },
    { x: 0.14, y: 0.02 },
    { x: 0.23, y: 0.13 },
  ],
  [
    { x: 0.23, y: 0.13 },
    { x: 0.3, y: 0.22 },
    { x: 0.39, y: 0.41 },
    { x: 0.47, y: 0.52 },
  ],
];

const APOLLO_LAUNCH_DURATION_MS = 1800;

function CaseStoryImage({
  story,
  launching,
  onLaunch,
  onComplete,
}: {
  story: WorkflowStory;
  launching: boolean;
  onLaunch: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onComplete: () => void;
}) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const rocketRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const rocket = rocketRef.current;
    if (!track || !rocket) return;

    let frame = 0;
    let startTime: number | undefined;
    let completed = false;

    const renderRocket = (progress: number) => {
      const sampler = createHeroPathSampler(
        apolloLogoLaunchPath,
        track.clientWidth,
        track.clientHeight
      );
      const point = sampler(progress);
      const angle = progress <= 0.001 ? 0 : (point.angle * 180) / Math.PI + 90;
      rocket.style.left = "0";
      rocket.style.top = "0";
      rocket.style.transform = `translate3d(calc(${point.x}px - 50%), calc(${point.y}px - 50%), 0) rotate(${angle}deg)`;
    };

    renderRocket(0);
    if (!launching) return;

    const animateRocket = (time: number) => {
      startTime ??= time;
      const rawProgress = Math.min(
        1,
        (time - startTime) / APOLLO_LAUNCH_DURATION_MS
      );
      renderRocket(smoothHeroProgress(rawProgress));

      if (rawProgress < 1) {
        frame = window.requestAnimationFrame(animateRocket);
        return;
      }

      if (!completed) {
        completed = true;
        onComplete();
      }
    };

    frame = window.requestAnimationFrame(animateRocket);
    return () => window.cancelAnimationFrame(frame);
  }, [launching, onComplete]);

  return (
    <span
      className="home-v2-case-story-image"
      data-case-story-image={story.id}
      data-launching={launching || undefined}
    >
      <img
        className="home-v2-case-story-earthrise"
        src="/demo/media/apollo11-earth-horizon.jpg"
        alt={story.coverImageAlt}
        width="1800"
        height="1800"
        loading="lazy"
        decoding="async"
      />
      <span ref={trackRef} className="home-v2-case-story-track">
        <span className="home-v2-case-story-track-crop" aria-hidden="true">
          <img
            className="home-v2-case-story-track-mark"
            src="/memova-logo-transparent.png"
            alt=""
            width="716"
            height="527"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span
          ref={rocketRef}
          className="home-v2-case-story-rocket"
          aria-hidden="true"
        >
          <img
            className="home-v2-case-story-rocket-idle"
            src="/demo/media/apollo-case-launch/rocket-idle-v1.png"
            alt=""
            width="512"
            height="512"
            loading="eager"
            decoding="async"
          />
          <img
            className="home-v2-case-story-rocket-live"
            src="/demo/media/apollo-case-launch/rocket-v1.png"
            alt=""
            width="512"
            height="512"
            loading="eager"
            decoding="async"
          />
        </span>
        <a
          href={getWorkflowStoryHref(story)}
          className="home-v2-case-story-fire"
          aria-label={`Launch the rocket and open ${story.title}`}
          aria-disabled={launching || undefined}
          tabIndex={launching ? -1 : undefined}
          onClick={onLaunch}
        >
          <span>{launching ? "IN FLIGHT" : "LAUNCH"}</span>
          <ArrowRight aria-hidden="true" />
        </a>
      </span>
      <span className="home-v2-case-story-launch-hint">
        Press LAUNCH to open the full story.
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {launching ? `Rocket launching toward ${story.title}.` : ""}
      </span>
    </span>
  );
}

function getWorkflowStoryHref(story: WorkflowStory) {
  return story.href;
}

function FirstValueSection() {
  const [transitionStoryId, setTransitionStoryId] =
    useState<WorkflowStoryId | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const transitionLockRef = useRef<WorkflowStoryId | null>(null);
  const navigationStartedRef = useRef(false);

  const transitionStory =
    workflowStories.find(story => story.id === transitionStoryId) ?? null;

  const navigateToStory = useCallback((story: WorkflowStory) => {
    if (navigationStartedRef.current) return;
    navigationStartedRef.current = true;

    if (story.href === "/product-journal") {
      navigate(story.href, { state: productJournalEntryState });
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    window.location.assign(getWorkflowStoryHref(story));
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const resetStoryTransition = () => {
      transitionLockRef.current = null;
      navigationStartedRef.current = false;
      setTransitionStoryId(null);
    };

    window.addEventListener("pageshow", resetStoryTransition);
    return () => window.removeEventListener("pageshow", resetStoryTransition);
  }, []);

  useEffect(() => {
    if (!transitionStory) return;

    const fallbackTimer = window.setTimeout(() => {
      navigateToStory(transitionStory);
    }, APOLLO_LAUNCH_DURATION_MS + 500);

    return () => window.clearTimeout(fallbackTimer);
  }, [navigateToStory, transitionStory]);

  const startStoryTransition = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    story: WorkflowStory
  ) => {
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
    if (transitionLockRef.current) return;

    event.currentTarget.blur();
    transitionLockRef.current = story.id;
    navigationStartedRef.current = false;

    if (story.id === "apollo") {
      void import("@/pages/ProductJournal");
    }

    if (prefersReducedMotion) {
      navigateToStory(story);
      return;
    }

    setTransitionStoryId(story.id);
  };

  return (
    <section
      id="product"
      className="home-v2-section home-v2-first-value"
      aria-labelledby="home-v2-first-value-heading"
    >
      <div className="home-v2-container">
        <div className="home-v2-section-intro home-v2-section-intro-split">
          <div>
            <p className="home-v2-eyebrow">
              How Memova works · Open a real story
            </p>
            <h2 id="home-v2-first-value-heading">
              One story. The full Memova loop.
            </h2>
          </div>
          <p>
            Open the Apollo 11 Book to follow source material from capture,
            through a Living Book, to a result you can review and use. The same
            loop can turn your own context into a Personal Manual, a private
            Book, a public Page, or a channel-ready version you choose to share.
          </p>
        </div>

        <div
          className="home-v2-case-book-library"
          data-transitioning={transitionStory ? "true" : "false"}
          role="group"
          aria-label="Open a Memova case page"
        >
          <div className="home-v2-case-book-shelf">
            {workflowStories.map(story => (
              <div className="home-v2-case-book-slot" key={story.id}>
                <div
                  className="home-v2-case-book-button"
                  data-case-book-trigger={story.id}
                >
                  <CaseStoryImage
                    story={story}
                    launching={transitionStory?.id === story.id}
                    onLaunch={event => startStoryTransition(event, story)}
                    onComplete={() => navigateToStory(story)}
                  />
                  <span className="home-v2-case-book-label">
                    <span>{story.eyebrow}</span>
                    <strong>{story.title}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompoundingSection() {
  return (
    <section
      id="book"
      className="home-v2-section home-v2-compounding"
      aria-labelledby="home-v2-compounding-heading"
    >
      <div className="home-v2-container home-v2-compounding-layout">
        <header className="home-v2-compounding-copy">
          <div className="home-v2-compounding-heading-block">
            <p className="home-v2-eyebrow">Inside a Living Book</p>
            <h2 id="home-v2-compounding-heading">
              Your context should grow—not start over.
            </h2>
          </div>
          <div className="home-v2-compounding-prose">
            <p>
              Notes store isolated information. A Living Book keeps the sources,
              thinking, decisions, and outputs behind your work connected over
              time—so every new Page can build on the context that already
              exists.
            </p>
            <p className="home-v2-compounding-detail">
              An AI Product Launch Book is one example. The same structure can
              hold research, meetings, personal reflections, or any evolving
              body of work.
            </p>
          </div>
        </header>

        <LivingBookContextStory />
      </div>
    </section>
  );
}

function PersonalManualSection() {
  const [posterOpen, setPosterOpen] = useState(false);
  const posterTriggerRef = useRef<HTMLButtonElement>(null);
  const posterCloseRef = useRef<HTMLButtonElement>(null);

  const closePoster = useCallback(() => {
    setPosterOpen(false);
    window.requestAnimationFrame(() => posterTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!posterOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("home-v2-manual-poster-open");
    const focusFrame = window.requestAnimationFrame(() =>
      posterCloseRef.current?.focus()
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        posterCloseRef.current?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      closePoster();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("home-v2-manual-poster-open");
    };
  }, [closePoster, posterOpen]);

  return (
    <section
      id="personal-manual"
      className="home-v2-section home-v2-personal-manual"
      aria-labelledby="home-v2-personal-manual-heading"
    >
      <div className="home-v2-container home-v2-manual-section-layout">
        <header className="home-v2-manual-section-intro">
          <div className="home-v2-manual-heading-block">
            <p className="home-v2-eyebrow">
              Understand yourself · Share selectively
            </p>
            <h2 id="home-v2-personal-manual-heading">
              A living manual for being you.
            </h2>
          </div>
          <div className="home-v2-manual-intro-copy">
            <p>
              Memova turns your evolving context into a guide to how you think,
              work, and connect—private by default, shareable when you choose.
            </p>
            <p className="home-v2-direction-note">
              Living context, not a personality test.
            </p>
          </div>
        </header>

        <div className="home-v2-manual-showcase">
          <figure className="home-v2-manual-wheel-feature">
            <PersonalManualImageWheel items={personalManualWheelItems} />
            <figcaption>
              Public archive moments become visual chapters before they are
              shaped into a shareable Personal Manual.
            </figcaption>
          </figure>

          <figure className="home-v2-manual-visual home-v2-manual-visual-poster">
            <div className="home-v2-manual-poster-frame">
              <button
                ref={posterTriggerRef}
                type="button"
                className="home-v2-manual-poster-link"
                aria-label="Open the illustrative Personal Manual poster in a full-screen viewer"
                aria-haspopup="dialog"
                aria-expanded={posterOpen}
                onClick={() => setPosterOpen(true)}
              >
                <img
                  src="/demo/media/personal-manual-marilyn-poster-v1-640.webp"
                  srcSet="/demo/media/personal-manual-marilyn-poster-v1-640.webp 640w, /demo/media/personal-manual-marilyn-poster-v1-1200.webp 1199w"
                  sizes="(min-width: 1024px) 584px, (min-width: 640px) 76vw, calc(100vw - 72px)"
                  alt="An illustrative fictional Personal Manual poster using Marilyn Monroe as a visual example, with sections for working hours, communication preferences, working conditions, needs, feedback, interests, and challenges"
                  width="1199"
                  height="1312"
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  Open full-size
                  <ArrowRight aria-hidden="true" />
                </span>
              </button>
            </div>
            <figcaption>
              Illustrative format only: not verified biographical information,
              not a real Memova account, and not an inferred profile of Marilyn
              Monroe.
              <span className="home-v2-manual-poster-hint">
                Open the image at full size to read every detail.
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {posterOpen ? (
        <div
          className="home-v2-manual-poster-lightbox"
          data-manual-poster-lightbox="true"
          onClick={event => {
            if (event.target === event.currentTarget) closePoster();
          }}
        >
          <div
            className="home-v2-manual-poster-lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-v2-manual-poster-lightbox-title"
          >
            <header>
              <div>
                <span>Illustrative Personal Manual</span>
                <h3 id="home-v2-manual-poster-lightbox-title">
                  Marilyn Monroe · public archive
                </h3>
              </div>
              <button
                ref={posterCloseRef}
                type="button"
                className="home-v2-manual-poster-lightbox-close"
                aria-label="Close the full-size Personal Manual poster"
                onClick={closePoster}
              >
                <X aria-hidden="true" />
                <span>Close</span>
              </button>
            </header>
            <div className="home-v2-manual-poster-lightbox-scroll">
              <img
                src="/demo/media/personal-manual-marilyn-poster-v1-1200.webp"
                alt="An illustrative fictional Personal Manual poster using Marilyn Monroe as a visual example, shown at full size"
                width="1199"
                height="1312"
                decoding="async"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PublishAnywhereSection() {
  return (
    <section
      id="publish-anywhere"
      className="home-v2-section home-v2-publish-anywhere"
      aria-labelledby="home-v2-publish-anywhere-heading"
      data-publish-scroll-scene="true"
    >
      <div className="home-v2-container home-v2-publish-scroll-sticky">
        <div className="home-v2-publish-intro">
          <h2 id="home-v2-publish-anywhere-heading">
            One Page. Every place you show up.
          </h2>
          <div className="home-v2-publish-copy">
            <p>
              Turn one reviewed Memova Page into channel-ready versions for
              every place you show up. Publish in one click where direct
              integrations are available—or export each version ready to post.
            </p>
            <p>
              Share sooner, learn from real feedback, and keep building in
              public without spending your day editing social content.
              Especially useful for founders, creators, and anyone who needs to
              stay visible while doing the actual work.
            </p>
          </div>
        </div>
        <figure className="home-v2-publish-visual">
          <PublishPhoneFan />
        </figure>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="home-v2-section home-v2-outcomes"
      aria-labelledby="home-v2-use-cases-heading"
    >
      <div className="home-v2-container">
        <div className="home-v2-section-intro home-v2-section-intro-split">
          <div>
            <p className="home-v2-eyebrow">Two directions</p>
            <h2 id="home-v2-use-cases-heading">
              For what you&apos;re building—and who you&apos;re becoming.
            </h2>
          </div>
          <p>
            Memova turns everyday conversations, notes, files, and experiences
            into Living Books. Keep the context behind what you&apos;re building
            connected—or understand the patterns unfolding across your own life.
            Share only when you choose.
          </p>
        </div>

        <div className="home-v2-context-directions">
          {contextDirections.map(direction => (
            <article
              key={direction.number}
              className="home-v2-context-direction"
              data-context-direction={direction.number}
            >
              <div
                className="home-v2-context-direction-illustration"
                aria-hidden="true"
              >
                <img
                  src={direction.illustration.src}
                  width={direction.illustration.width}
                  height={direction.illustration.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <header className="home-v2-context-direction-header">
                <span className="home-v2-context-direction-number">
                  {direction.number}
                </span>
                <p>{direction.label}</p>
                <h3>{direction.title}</h3>
              </header>

              <p className="home-v2-context-direction-body">{direction.body}</p>

              <ul
                className="home-v2-context-direction-examples"
                aria-label={`${direction.label} examples`}
              >
                {direction.examples.map(example => (
                  <li key={example}>{example}</li>
                ))}
              </ul>

              <div className="home-v2-context-direction-result">
                <span>What it can become</span>
                <ol aria-label={`${direction.label} outcomes`}>
                  {direction.outcome.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>

        <p className="home-v2-context-directions-closing">
          The same Memova loop can help you build something—or understand who
          you are becoming.
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section
      id="trust"
      className="home-v2-section home-v2-trust"
      aria-labelledby="home-v2-trust-heading"
    >
      <div className="home-v2-container">
        <div className="home-v2-trust-shell">
          <div className="home-v2-trust-heading">
            <p className="home-v2-eyebrow">Control &amp; trust</p>
            <h2 id="home-v2-trust-heading">Your work stays yours.</h2>
            <p>
              Inputs and Books stay private by default. Personal Manuals,
              generated Pages, and social versions wait for your review. You
              choose what becomes public and when.
            </p>
          </div>

          <div className="home-v2-trust-grid">
            <div className="home-v2-trust-list">
              {trustProofs.map(({ icon: Icon, title, body }) => (
                <div className="home-v2-trust-proof" key={title}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="home-v2-control-panel"
              aria-label="Illustrative Memova privacy and sharing controls"
            >
              <div className="home-v2-control-title">
                <LockKeyhole aria-hidden="true" /> A living Book · Controls
              </div>
              <div>
                <span>Private sources</span>
                <strong>Private</strong>
              </div>
              <div>
                <span>Generated Pages</span>
                <strong>Review required</strong>
              </div>
              <div>
                <span>Manual &amp; social versions</span>
                <strong>Choose what to show</strong>
              </div>
              <div>
                <span>Actions &amp; sharing</span>
                <strong>Your approval</strong>
              </div>
              <div className="home-v2-control-footer">
                <ShieldCheck aria-hidden="true" /> Private until you choose
                otherwise
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const [status, setStatus] = useState<"idle" | "error" | "preview">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("preview");
  };

  return (
    <section
      id="waitlist"
      className="home-v2-final-cta"
      aria-labelledby="home-v2-final-heading"
    >
      <div className="home-v2-container home-v2-final-inner">
        <h2 id="home-v2-final-heading">Start your first living Book.</h2>
        <p>
          Bring the conversations, notes, files, and experiences you want Memova
          to understand—then keep them as a private Manual, turn them into a
          Page, or prepare a reviewed version for a platform.
        </p>
        <p className="home-v2-final-vision">
          Helping you, your AI, the people around you, and the entire world
          understand one another and stay aligned. Personal superalignment
          starts with Memova.
        </p>

        <form
          className="home-v2-waitlist-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <label className="sr-only" htmlFor="home-v2-email">
            Work email
          </label>
          <input
            id="home-v2-email"
            name="email"
            type="email"
            placeholder="Work email"
          />
          <button className="home-v2-button" type="submit">
            Join Early Access <ArrowRight aria-hidden="true" />
          </button>
        </form>
        <p
          className={`home-v2-form-status ${status === "error" ? "is-error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {status === "error"
            ? "Enter a valid email to preview the confirmation state."
            : status === "preview"
              ? "Preview confirmed—no email was sent from this local framework."
              : "Framework preview: email submission is intentionally disabled locally."}
        </p>
      </div>
    </section>
  );
}

function HomeV2Footer() {
  return (
    <footer className="home-v2-footer">
      <div className="home-v2-container home-v2-footer-inner">
        <a
          className="home-v2-logo home-v2-footer-logo"
          href="#top"
          aria-label="Back to top"
        >
          <img src="/memova-logo-transparent.png" alt="Memova" />
        </a>
        <nav aria-label="Footer navigation">
          <a href="#product">Product</a>
          <a href="#use-cases">Use Cases</a>
          <a href="/journal">Journal</a>
          <a href="#trust">Trust</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <p>© 2026 Memova</p>
      </div>
    </footer>
  );
}

export default function HomeFrameworkPreview() {
  return (
    <div id="top" className="memova-home-v2">
      <HomeV2Header />
      <main>
        <HeroSection />
        <FirstValueSection />
        <CompoundingSection />
        <PersonalManualSection />
        <PublishAnywhereSection />
        <ActionEcosystemBand />
        <UseCasesSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <HomeV2Footer />
    </div>
  );
}
