"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  ArrowDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileImage,
  FileText,
  Folder,
  FolderLock,
  FolderOpen,
  Link2,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";

import "./demo-base.css";
import "./migrated-sections.css";
import "./brand-unification.css";
import "./scroll-stories.css";
import "./continuous-overrides.css";

const PAGES = [
  {
    id: "knowledge-base",
    number: "01",
    navTitle: "Knowledge Base",
    title: "From everyday signals to understood Context.",
    chapter: "Chapter 01 · Collect & Understand",
    time: "00:00–00:20",
    recording: true,
  },
  {
    id: "note",
    number: "02",
    navTitle: "Note",
    title: "From Context to action.",
    chapter: "Chapter 02 · Act",
    time: "00:20–00:52",
    recording: true,
  },
  {
    id: "book",
    number: "03",
    navTitle: "Book",
    title: "From scattered sources to a living Book.",
    chapter: "Chapter 03 · Connect",
    time: "00:52–01:20",
    recording: true,
  },
  {
    id: "output-share",
    number: "04",
    navTitle: "Output & Share",
    title: "From knowledge to expression.",
    chapter: "Chapter 04 · Express",
    time: "01:20–02:05",
    recording: true,
  },
  {
    id: "alignment",
    number: "05",
    navTitle: "Context Return",
    title: "From every action and expression to new Context.",
    chapter: "Chapter 05 · Return",
    time: "02:05–02:52",
    recording: true,
  },
  {
    id: "end",
    number: "06",
    navTitle: "End",
    title: "From Context to a growing knowledge world.",
    chapter: "Chapter 06 · Compound",
    time: "02:52–03:00",
    recording: false,
  },
] as const;

const NARRATION_SEGMENTS = [
  {
    id: "01-everyday-context",
    number: "01",
    title: "Everyday Context",
    src: "/demo/audio/pages/01-everyday-context.m4a",
    duration: 14,
  },
  {
    id: "01-personal-llm-wiki",
    number: "01",
    title: "Personal LLM Wiki",
    src: "/demo/audio/pages/01-personal-llm-wiki.m4a",
    duration: 6.492993,
  },
  {
    id: "01-knowledge-base-ui",
    number: "01",
    title: "Knowledge Base Setup",
    src: "/demo/audio/pages/01-knowledge-base-ui.m4a",
    duration: 7.545011,
  },
  {
    id: "01-apollo-case",
    number: "01",
    title: "Apollo 11 Case",
    src: "/demo/audio/pages/01-apollo-case.m4a",
    duration: 2.253991,
  },
  {
    id: "02-note-workflow",
    number: "02",
    title: "Note Workflow",
    src: "/demo/audio/pages/02-note-workflow.m4a",
    duration: 21.006009,
  },
  {
    id: "02-complete-note",
    number: "02",
    title: "The Complete Note",
    src: "/demo/audio/pages/02-complete-note.m4a",
    duration: 5.381995,
  },
  {
    id: "03-project-ingest",
    number: "03",
    title: "Sources Into a Book",
    src: "/demo/audio/pages/03-project-ingest.m4a",
    duration: 12.541995,
  },
  {
    id: "03-project-book-ui",
    number: "03",
    title: "Project Book Generation",
    src: "/demo/audio/pages/03-project-book-ui.m4a",
    duration: 19.652993,
  },
  {
    id: "04-platform-results",
    number: "04",
    title: "Platform Results",
    src: "/demo/audio/pages/04-platform-results.m4a",
    duration: 4.87,
  },
  {
    id: "04-standalone-note-sharing",
    number: "04",
    title: "Standalone Note Sharing",
    src: "/demo/audio/pages/04-standalone-note-sharing.m4a",
    duration: 26.308005,
  },
  {
    id: "04-project-html-sharing",
    number: "04",
    title: "Project HTML Sharing",
    src: "/demo/audio/pages/04-project-html-sharing.m4a",
    duration: 9.686009,
  },
  {
    id: "05-context-return",
    number: "05",
    title: "Context Return",
    src: "/demo/audio/pages/05-context-return.m4a",
    duration: 15.326009,
  },
  {
    id: "05-ask-memova",
    number: "05",
    title: "Ask Memova",
    src: "/demo/audio/pages/05-ask-memova.m4a",
    duration: 27.831995,
  },
  {
    id: "06-end",
    number: "06",
    title: "End",
    src: "/demo/audio/pages/06-end.m4a",
    duration: 10.990998,
  },
] as const;

type NarrationSegment = (typeof NARRATION_SEGMENTS)[number];
type NarrationPlaybackState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "complete"
  | "error";

type NarrationContextValue = {
  activeId: NarrationSegment["id"] | null;
  playbackState: NarrationPlaybackState;
  playbackTime: number;
  duration: number;
  toggleNarration: (segment: NarrationSegment) => Promise<void>;
  resetNarration: (segmentId: NarrationSegment["id"]) => void;
};

const NarrationContext = createContext<NarrationContextValue | null>(null);

const KB_SOURCE_FRAGMENTS = [
  {
    id: "meeting",
    label: "Meeting note",
    meta: "Voice · decisions",
    asset: "/demo/icons/memova-meeting.svg",
  },
  {
    id: "spark",
    label: "Spark",
    meta: "Ideas · point of view",
    asset: "/demo/icons/memova-spark.svg",
  },
  {
    id: "book",
    label: "Book & files",
    meta: "Pages · docs · media",
    asset: "/demo/icons/memova-book.svg",
  },
] as const;

const KB_OUTCOMES = [
  { id: "action", label: "Action" },
  { id: "social", label: "Social Content" },
  { id: "html", label: "HTML Page" },
  { id: "knowledge", label: "Personal Knowledge" },
] as const;

const KB_WIKI_FOLDERS = [
  {
    id: "memova",
    label: "_memova",
    detail: "Machine-managed",
    kind: "locked",
    group: "govern",
    offset: [-138, -58],
  },
  {
    id: "inbox",
    label: "inbox",
    detail: "Capture & staging",
    kind: "folder",
    group: "capture",
    offset: [62, -82],
  },
  {
    id: "wiki",
    label: "wiki",
    detail: "Long-term knowledge",
    kind: "folder",
    group: "understand",
    offset: [144, 56],
  },
  {
    id: "projects",
    label: "projects",
    detail: "Project context",
    kind: "folder",
    group: "understand",
    offset: [-70, 92],
  },
  {
    id: "daily",
    label: "daily",
    detail: "Working memory",
    kind: "folder",
    group: "capture",
    offset: [-116, 44],
  },
  {
    id: "outputs",
    label: "outputs",
    detail: "Useful results",
    kind: "open",
    group: "create",
    offset: [118, -44],
  },
  {
    id: "schemas",
    label: "schemas",
    detail: "Agent-readable rules",
    kind: "folder",
    group: "govern",
    offset: [84, 78],
  },
  {
    id: "archive",
    label: "archive",
    detail: "Retained history",
    kind: "folder",
    group: "govern",
    offset: [-92, -72],
  },
] as const;

const KB_WIKI_GROUPS = [
  { id: "capture", number: "01", label: "Capture", detail: "Collect" },
  { id: "understand", number: "02", label: "Understand", detail: "Connect" },
  { id: "govern", number: "03", label: "Govern", detail: "Keep trustworthy" },
  { id: "create", number: "04", label: "Create", detail: "Put to work" },
] as const;

const KB_ROOT_FILES = [
  { id: "agents", label: "AGENTS.md", detail: "Agent instructions" },
  { id: "index", label: "index.md", detail: "Knowledge index" },
  { id: "log", label: "log.md", detail: "Change history" },
  { id: "readme", label: "README.md", detail: "Human guide" },
] as const;

const KB_ORBIT_TRACKS = [
  { radiusX: 25, radiusY: 19, turns: 0.64 },
  { radiusX: 22, radiusY: 28, turns: -0.52 },
  { radiusX: 16, radiusY: 35, turns: 0.78 },
] as const;

const KB_ORBIT_ITEMS = [
  {
    id: "meeting",
    label: "Meeting audio",
    meta: "Voice · decisions · commitments",
    type: "meeting",
    track: 0,
    phase: -1.46,
    target: [38, 28],
    rotation: -3,
  },
  {
    id: "spark",
    label: "Personal inspiration",
    meta: "Ideas · point of view",
    type: "spark",
    track: 1,
    phase: 3.62,
    target: [50, 28],
    rotation: 2,
  },
  {
    id: "files",
    label: "Files & research",
    meta: "Evidence · source material",
    type: "files",
    track: 0,
    phase: 0.15,
    target: [62, 28],
    rotation: 2,
  },
  {
    id: "inbox",
    label: "inbox",
    meta: "Capture & staging",
    type: "inbox",
    track: 2,
    phase: 2.45,
    target: [38, 48],
    rotation: -2,
  },
  {
    id: "wiki",
    label: "wiki",
    meta: "Long-term knowledge",
    type: "wiki",
    track: 2,
    phase: 1.1,
    target: [50, 48],
    rotation: 3,
  },
  {
    id: "projects",
    label: "projects",
    meta: "Project context",
    type: "projects",
    track: 1,
    phase: -0.45,
    target: [62, 48],
    rotation: -2,
  },
  {
    id: "outputs",
    label: "outputs",
    meta: "Action · content · HTML",
    type: "outputs",
    track: 1,
    phase: 0.72,
    target: [44, 61],
    rotation: 2,
  },
] as const;

const NOTE_WORKFLOW_CUES = [
  {
    at: 0.2,
    title: "Record context as it happens",
    detail:
      "Add voice, notes, ideas, and images without interrupting the meeting.",
  },
  {
    at: 4.4,
    title: "Turn the meeting into a complete Note",
    detail:
      "Memova prepares a shareable HTML preview, Suggested Actions, Summary, and Transcript.",
  },
  {
    at: 11.8,
    title: "Run Suggested Actions in one tap",
    detail:
      "Create an interactive webpage, draft an email, or set a calendar event from the same context.",
  },
] as const;

const KNOWLEDGE_BASE_SETUP_CUES = [
  {
    at: 0,
    title: "Start from an empty workspace",
    detail:
      "Open Knowledge Base setup before any projects or meeting packets exist.",
  },
  {
    at: 0.7,
    title: "Keep the archive local and portable",
    detail:
      "Meeting knowledge stays searchable while its Markdown archive lives in the user's iCloud Drive.",
  },
  {
    at: 1.9,
    title: "Choose a user-owned iCloud vault",
    detail:
      "Create or reconnect a vault, then approve the parent folder Memova may write to.",
  },
  {
    at: 6.47,
    title: "Inspect the connected, agent-readable tree",
    detail:
      "Memova creates inbox, projects, outputs, schemas, wiki, and root instruction files.",
  },
] as const;

const BOOK_WORKFLOW_CUES = [
  {
    at: 0.2,
    title: "Choose the visual Pages to create",
    detail: "Select multiple output types from the same Project context.",
  },
  {
    at: 3.3,
    title: "Guide each output with a focused brief",
    detail:
      "Add a clear instruction for every Page while Memova keeps the source material connected.",
  },
  {
    at: 8.2,
    title: "Review generated Pages inside the Book",
    detail:
      "Each result returns to the living Book alongside its notes, library items, and files.",
  },
  {
    at: 16.2,
    title: "Open the Page and share with control",
    detail:
      "Preview the finished HTML, then choose a QR code, link, editable copy, or permissioned access.",
  },
] as const;

const STANDALONE_NOTE_SHARING_CUES = [
  {
    at: 0,
    title: "Start from the finished standalone Note",
    detail:
      "Open its generated HTML output while the original Note, actions, and evidence remain connected.",
  },
  {
    at: 2.53,
    title: "Move the HTML output into sharing",
    detail:
      "Preview the finished Page, then open the channel-specific share surface.",
  },
  {
    at: 4.13,
    title: "Shape the X expression before publishing",
    detail:
      "Compare formats, keep the source-linked card, and share the concise version to X.",
  },
  {
    at: 15.83,
    title: "Reframe the same context for LinkedIn",
    detail:
      "Switch channels and compare text, article, multi-image, video, and link-preview treatments.",
  },
  {
    at: 22.6,
    title: "Publish the visual LinkedIn version",
    detail:
      "Choose the multi-image post and share it without rebuilding or disconnecting the source.",
  },
] as const;

const PROJECT_HTML_SHARING_CUES = [
  {
    at: 0,
    title: "Return to the source-linked Project",
    detail:
      "Open the Apollo 11 Project Book and its finished generated Page from the Home workspace.",
  },
  {
    at: 3.7,
    title: "Open the Page's share surface",
    detail:
      "Preview the finished HTML, then choose how this output should travel.",
  },
  {
    at: 6.1,
    title: "Adapt one Page for a social channel",
    detail:
      "The same source-linked Page becomes a TikTok-ready 9:16 video with a matching caption.",
  },
  {
    at: 9.5,
    title: "Take the finished assets with you",
    detail:
      "Copy the caption, then save the rendered video directly to Photos.",
  },
] as const;

const ASK_MEMOVA_WHY_THIS_CUES = [
  {
    at: 0,
    title: "Ask inside the active Project",
    detail:
      "Open Ask Memova with the Apollo archive's notes, library items, files, and prior work already in context.",
  },
  {
    at: 4,
    title: "Describe the change in plain language",
    detail:
      "Ask for a new cover and a shorter title that match the user's established public-writing style.",
  },
  {
    at: 7.73,
    title: "Receive a reviewable update",
    detail:
      "Memova explains what changed and returns a review card instead of silently overwriting the Page.",
  },
  {
    at: 12.9,
    title: "Compare before and after",
    detail:
      "Inspect the revised cover and title beside the previous version before keeping or restoring the change.",
  },
  {
    at: 17.43,
    title: "Ask why this version fits",
    detail:
      "Use Why this? to inspect the reasoning behind the proposed result, not only the result itself.",
  },
  {
    at: 19.8,
    title: "Trace the answer to its sources",
    detail:
      "The rationale cites the Project note, cover imagery, a public NASA record, and the user's previous writing.",
  },
  {
    at: 24,
    title: "Open the cited evidence",
    detail:
      "Follow the public-web citation to the original NASA mission overview, then return without losing the conversation.",
  },
  {
    at: 27.33,
    title: "Turn the choice into personal alignment",
    detail:
      "Confirm the preference so Personal Knowledge can carry the chosen voice, cover style, and evidence standard forward.",
  },
] as const;

const BOOK_PAGES = [
  {
    id: "mission",
    title: "After the Giant Leap",
    type: "Mission Debrief",
    image: "/demo/media/earthrise-book-cover.jpg",
  },
  {
    id: "decisions",
    title: "Decisions That Changed the Landing",
    type: "Visual Story",
    image: "/demo/media/aldrin-visor.jpg",
  },
  {
    id: "timeline",
    title: "Eight Days to Tranquility",
    type: "Mission Timeline",
    image: "/demo/media/apollo-launch.jpg",
  },
  {
    id: "evidence",
    title: "Evidence from the Surface",
    type: "Research Page",
    image: "/demo/media/mission-control.jpg",
  },
] as const;

const PLATFORM_OUTPUTS = [
  {
    id: "x",
    source: "From Standalone Note Output",
    platform: "X",
    format: "Text + Link",
    kind: "image",
    asset: "/demo/media/chapter-04-output-x-real-ui.jpg",
    icon: "/demo/icons/social/x.svg",
    alt: "Real Memova mobile UI showing the Apollo 11 X link-card output",
  },
  {
    id: "linkedin",
    source: "From Standalone Note Output",
    platform: "LinkedIn",
    format: "Visual Carousel",
    kind: "image",
    asset: "/demo/media/chapter-04-output-linkedin-real-ui.jpg",
    icon: "/demo/icons/social/linkedin.svg",
    alt: "Real Memova mobile UI showing the Apollo 11 LinkedIn multi-image output",
  },
  {
    id: "tiktok",
    source: "From Project HTML Output",
    platform: "TikTok",
    format: "9:16 Video",
    kind: "video",
    asset: "/demo/media/chapter-04-output-tiktok-real-ui.mp4",
    poster: "/demo/media/chapter-04-output-tiktok-real-ui-poster.jpg",
    icon: "/demo/icons/social/tiktok-color.svg",
    alt: "Real Memova mobile UI showing the Apollo 11 TikTok video output",
  },
] as const;

const SOCIAL_DESTINATIONS = [
  { id: "instagram", label: "Instagram", x: 30.5, y: 9, scale: 1, delay: -1.2 },
  { id: "youtube", label: "YouTube", x: 69.5, y: 9, scale: 1, delay: -2.1 },
  {
    id: "x",
    label: "X",
    x: 35,
    y: 23,
    scale: 1.02,
    delay: -0.4,
    primary: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    x: 64.8,
    y: 23,
    scale: 1.02,
    delay: -1.9,
    primary: true,
  },
  { id: "threads", label: "Threads", x: 31.5, y: 37, scale: 0.98, delay: -3.1 },
  { id: "reddit", label: "Reddit", x: 68.5, y: 37, scale: 0.98, delay: -0.8 },
  { id: "telegram", label: "Telegram", x: 35.4, y: 51, scale: 0.96, delay: -1 },
  {
    id: "tiktok",
    label: "TikTok",
    x: 64.5,
    y: 51,
    scale: 1.02,
    delay: -2.7,
    primary: true,
  },
  { id: "medium", label: "Medium", x: 30.2, y: 65, scale: 0.96, delay: -2.5 },
  {
    id: "facebook",
    label: "Facebook",
    x: 69.8,
    y: 65,
    scale: 0.98,
    delay: -3.5,
  },
  {
    id: "substack",
    label: "Substack",
    x: 35.2,
    y: 79,
    scale: 0.96,
    delay: -1.6,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    x: 64.7,
    y: 79,
    scale: 0.96,
    delay: -3.8,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    x: 31.6,
    y: 92,
    scale: 0.96,
    delay: -2.9,
  },
  { id: "discord", label: "Discord", x: 68.8, y: 92, scale: 0.98, delay: -0.2 },
] as const;

const PROJECT_INGEST_MATERIALS = [
  {
    id: "note",
    type: "image",
    src: "/demo/media/project-memova-note.png",
    alt: "Memova Apollo 11 Note with suggested actions and summary",
    variant: "note",
    rotation: -4,
    desktop: [5, 29],
    compact: [14, 44],
  },
  {
    id: "html",
    type: "image",
    src: "/demo/media/project-html-page.png",
    alt: "Completed Apollo 11 interactive HTML mission debrief",
    variant: "html",
    rotation: 3,
    desktop: [27, 20],
    compact: [61, 42],
  },
  {
    id: "video",
    type: "video",
    src: "/demo/media/project-apollo-flyover.mp4",
    alt: "NASA Apollo 11 landing-site flyover footage",
    variant: "video",
    rotation: 1,
    desktop: [20, 52],
    compact: [51, 65],
  },
  {
    id: "launch",
    type: "image",
    src: "/demo/media/project-apollo-launch.jpg",
    alt: "NASA Apollo 11 Saturn V launch photograph",
    variant: "launch",
    rotation: -5,
    desktop: [7, 74],
    compact: [18, 78],
  },
  {
    id: "aldrin",
    type: "image",
    src: "/demo/media/project-aldrin-visor.jpg",
    alt: "NASA photograph of Buzz Aldrin on the lunar surface",
    variant: "photo",
    rotation: 4,
    desktop: [29, 75],
    compact: [77, 80],
  },
] as const;

type ProjectIngestMaterial = (typeof PROJECT_INGEST_MATERIALS)[number];

const clampProgress = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const progressRange = (value: number, start: number, end: number) =>
  clampProgress((value - start) / (end - start));

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useNearViewport<T extends Element>(
  elementRef: RefObject<T | null>,
  rootMargin = "320px 0px"
) {
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, rootMargin]);

  return isNearViewport;
}

function useProjectIngestProgress(
  sectionRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const section = sectionRef.current;
    const scrollRoot = section?.closest<HTMLElement>(".chapter-scroll");
    if (!section || !scrollRoot) return undefined;
    const continuous = scrollRoot.dataset.continuousScroll === "true";

    let frame = 0;
    let continuousViewportTop = 80;
    let continuousViewportHeight = Math.max(
      1,
      window.innerHeight - continuousViewportTop
    );
    let continuousViewportWidth = window.innerWidth;

    const measureContinuousViewport = () => {
      if (!continuous) return;

      const narrativeTop = Number.parseFloat(
        window.getComputedStyle(scrollRoot).getPropertyValue("--narrative-top")
      );
      const viewportFrame = section.querySelector<HTMLElement>(
        ".project-ingest-sticky, .scroll-driven-story > .concept-beat"
      );

      continuousViewportTop = Number.isFinite(narrativeTop) ? narrativeTop : 80;
      /*
       * The continuous layout is sized with --chapter-viewport (100svh).
       * Measure that rendered frame once instead of using window.innerHeight,
       * which changes whenever a mobile browser expands or collapses its UI.
       */
      continuousViewportHeight = Math.max(
        1,
        viewportFrame?.getBoundingClientRect().height ??
          continuousViewportHeight
      );
      continuousViewportWidth = window.innerWidth;
    };

    measureContinuousViewport();

    const update = () => {
      frame = 0;
      const sectionRect = section.getBoundingClientRect();
      const viewportTop = continuous
        ? continuousViewportTop
        : scrollRoot.getBoundingClientRect().top;
      const viewportHeight = continuous
        ? continuousViewportHeight
        : scrollRoot.clientHeight;
      const travelled = viewportTop - sectionRect.top;
      const distance = Math.max(1, section.offsetHeight - viewportHeight);
      const next = clampProgress(travelled / distance);

      setProgress(current =>
        Math.abs(current - next) > 0.0005 ? next : current
      );
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      if (!continuous) {
        requestUpdate();
        return;
      }

      const previousTop = continuousViewportTop;
      const previousHeight = continuousViewportHeight;
      const previousWidth = continuousViewportWidth;
      measureContinuousViewport();

      /* Ignore address-bar-only resizes when the 100svh layout did not move. */
      if (
        Math.abs(previousTop - continuousViewportTop) > 0.5 ||
        Math.abs(previousHeight - continuousViewportHeight) > 0.5 ||
        Math.abs(previousWidth - continuousViewportWidth) > 0.5
      ) {
        requestUpdate();
      }
    };

    update();
    const scrollTarget: Window | HTMLElement = continuous ? window : scrollRoot;
    scrollTarget.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion, sectionRef]);

  return reducedMotion ? 1 : progress;
}

function syncRecordingShellFocus(shell: HTMLElement | null) {
  if (!shell) return;

  const focus = Array.from(
    shell.querySelectorAll<HTMLElement>("[data-recording-slot]")
  ).reduce(
    (current, column) =>
      Math.max(
        current,
        Number.parseFloat(column.dataset.recordingFocusValue ?? "0") || 0
      ),
    0
  );
  const baseNav =
    Number.parseFloat(
      window.getComputedStyle(shell).getPropertyValue("--demo-nav-base")
    ) || 76;

  shell.style.setProperty("--demo-recording-focus", focus.toFixed(4));
  shell.style.setProperty(
    "--demo-nav-height",
    `${(baseNav * (1 - focus)).toFixed(2)}px`
  );
  shell.dataset.recordingOverlay = focus > 0.04 ? "true" : "false";
  shell.dataset.recordingFullscreen = focus >= 0.999 ? "true" : "false";
  shell.dataset.recordingMode =
    focus > 0.9 ? "active" : focus > 0.04 ? "transition" : "idle";
}

function useRecordingFocus(
  columnRef: RefObject<HTMLDivElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  reducedMotion: boolean,
  focusWeight: number
) {
  useEffect(() => {
    const column = columnRef.current;
    const scrollRoot = column?.closest<HTMLElement>(".chapter-scroll");
    const shell = column?.closest<HTMLElement>(".framework-shell");
    if (!column || !scrollRoot || !shell) return undefined;
    const continuous = scrollRoot.dataset.continuousScroll === "true";

    let frame = 0;

    const resetPresentation = () => {
      column.style.removeProperty("--recording-focus");
      column.style.removeProperty("--recording-scale");
      column.style.removeProperty("--recording-opacity");
      column.style.removeProperty("--recording-height");
      column.style.removeProperty("--recording-center-offset-y");
      column.style.removeProperty("--recording-viewport-center-y");
      column.style.removeProperty("--recording-frame-inset");
      column.style.removeProperty("--recording-frame-border-width");
      delete column.dataset.recordingFocusValue;
      delete column.dataset.recordingOverlay;
      delete column.dataset.recordingFullscreen;
    };

    /*
     * Public-site recordings stay as normal document content. Apply that
     * presentation once and let IntersectionObserver pause off-screen video;
     * avoid one window scroll/resize/ResizeObserver pipeline per recording.
     */
    if (continuous) {
      column.style.setProperty("--recording-focus", "0");
      column.style.setProperty("--recording-scale", "1");
      column.style.setProperty("--recording-opacity", "1");
      column.style.setProperty(
        "--recording-height",
        "var(--recording-readable-height)"
      );
      column.style.setProperty("--recording-center-offset-y", "0px");
      column.style.setProperty("--recording-frame-inset", "7px");
      column.style.setProperty("--recording-frame-border-width", "1px");
      column.dataset.recordingFocusValue = "0";
      column.dataset.recordingFocus = "idle";
      column.dataset.recordingOverlay = "false";
      column.dataset.recordingFullscreen = "false";
      syncRecordingShellFocus(shell);

      const visibilityObserver =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(
              ([entry]) => {
                const video = videoRef.current;
                if (!entry.isIntersecting && video && !video.paused) {
                  video.pause();
                }
              },
              { rootMargin: "80px 0px", threshold: 0 }
            );

      visibilityObserver?.observe(column);

      return () => {
        visibilityObserver?.disconnect();
        resetPresentation();
        syncRecordingShellFocus(shell);
      };
    }

    const update = () => {
      frame = 0;
      const rootRect = scrollRoot.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const viewportTop = 0;
      const viewportHeight = window.innerHeight;

      const rootCenter = viewportTop + viewportHeight / 2;
      const columnCenter = columnRect.top + columnRect.height / 2;
      const distance = Math.abs(columnCenter - rootCenter);
      const focusDistance = Math.max(1, viewportHeight * 0.74);
      const measuredFocus =
        easeInOutCubic(clampProgress(1 - distance / focusDistance)) *
        clampProgress(focusWeight);
      const easedFocus = reducedMotion
        ? measuredFocus > 0.58
          ? 1
          : 0
        : measuredFocus;
      /*
       * The layout keeps a fixed top inset to avoid the old scroll/resize
       * feedback loop. Normalize the final 1.5% continuously so the nav can
       * reach zero and the recording can reach the exact viewport height
       * without adding a threshold jump to the scroll motion.
       */
      const focus = reducedMotion
        ? easedFocus
        : clampProgress(easedFocus / 0.985);
      const restingHeight = Math.min(1100, Math.max(280, rootRect.height - 72));
      const recordingHeight =
        restingHeight + (viewportHeight - restingHeight) * focus;
      const centerOffsetY = (rootCenter - columnCenter) * focus;
      const opacity = 0.68 + focus * 0.32;

      column.style.setProperty("--recording-focus", focus.toFixed(4));
      column.style.setProperty("--recording-scale", "1");
      column.style.setProperty("--recording-opacity", opacity.toFixed(4));
      column.style.setProperty(
        "--recording-height",
        `${recordingHeight.toFixed(2)}px`
      );
      column.style.setProperty(
        "--recording-center-offset-y",
        `${centerOffsetY.toFixed(2)}px`
      );
      column.style.setProperty(
        "--recording-viewport-center-y",
        `${(columnCenter + centerOffsetY).toFixed(2)}px`
      );
      column.style.setProperty(
        "--recording-frame-inset",
        `${(7 * (1 - focus)).toFixed(2)}px`
      );
      column.style.setProperty(
        "--recording-frame-border-width",
        `${(1 - focus).toFixed(3)}px`
      );
      column.dataset.recordingFocusValue = focus.toFixed(4);
      column.dataset.recordingFocus = focus > 0.9 ? "active" : "transition";
      column.dataset.recordingOverlay = focus > 0.04 ? "true" : "false";
      column.dataset.recordingFullscreen = focus >= 0.999 ? "true" : "false";
      syncRecordingShellFocus(shell);

      const video = videoRef.current;
      if (focus < 0.08 && video && !video.paused) video.pause();
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    const scrollTarget: HTMLElement = scrollRoot;
    scrollTarget.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(scrollRoot);
    resizeObserver.observe(column);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver.disconnect();
      resetPresentation();
      syncRecordingShellFocus(shell);
    };
  }, [columnRef, focusWeight, videoRef, reducedMotion]);
}

type ChapterNavigationProps = {
  activePage: number;
  onNavigate: (index: number) => void;
};

function DirectionArrow({
  direction,
}: {
  direction: "down" | "left" | "right";
}) {
  const rotation =
    direction === "left"
      ? "rotate(90 12 12)"
      : direction === "right"
        ? "rotate(-90 12 12)"
        : undefined;

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.75v14.5M6.75 14l5.25 5.25L17.25 14" transform={rotation} />
    </svg>
  );
}

function ChapterNavigation({ activePage, onNavigate }: ChapterNavigationProps) {
  const previous = PAGES[activePage - 1];
  const next = PAGES[activePage + 1];

  return (
    <nav className="chapter-navigation" aria-label="Chapter navigation">
      <button
        type="button"
        className="chapter-button previous"
        disabled={!previous}
        onClick={() => onNavigate(activePage - 1)}
      >
        <DirectionArrow direction="left" />
        <span>
          <small>Previous chapter</small>
          <strong>{previous?.navTitle ?? "The beginning"}</strong>
        </span>
      </button>

      <p className="chapter-position" aria-live="polite">
        {PAGES[activePage].number} / {String(PAGES.length).padStart(2, "0")}
      </p>

      <button
        type="button"
        className="chapter-button next"
        data-testid="next-chapter"
        disabled={!next}
        onClick={() => onNavigate(activePage + 1)}
      >
        <span>
          <small>Next chapter</small>
          <strong>{next?.navTitle ?? "End of demo"}</strong>
        </span>
        <DirectionArrow direction="right" />
      </button>
    </nav>
  );
}

type RecordingTimelineCue = {
  at: number;
  title: string;
  detail: string;
};

type RecordingPlayerProps = {
  label: string;
  title?: string;
  chapterKicker?: string;
  chapterTitle?: string;
  src?: string;
  poster?: string;
  durationLabel?: string;
  active?: boolean;
  focusWeight?: number;
  timelineCues?: readonly RecordingTimelineCue[];
  timelineWindowSize?: number;
  preserveSidecar?: boolean;
  placeholderContent?: ReactNode;
};

const formatPlaybackTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export async function settleNarrationPlayback({
  media,
  isCurrent,
  onPlaying,
  onFailure,
  onCancelled,
}: {
  media: Pick<HTMLAudioElement, "play">;
  isCurrent: () => boolean;
  onPlaying: () => void;
  onFailure: () => void;
  onCancelled?: () => void;
}) {
  try {
    await media.play();
    if (!isCurrent()) {
      onCancelled?.();
      return;
    }
    onPlaying();
  } catch {
    if (isCurrent()) onFailure();
  }
}

export function isNarrationBeatCurrent(
  bounds: Pick<DOMRect, "top" | "bottom">,
  viewportHeight: number
) {
  const listeningBandTop = viewportHeight * 0.2;
  const listeningBandBottom = viewportHeight * 0.8;
  return bounds.bottom > listeningBandTop && bounds.top < listeningBandBottom;
}

function useNarrationController() {
  const controller = useContext(NarrationContext);
  if (!controller) {
    throw new Error(
      "InlineNarrationControl must be rendered inside NarrationContext"
    );
  }
  return controller;
}

function InlineNarrationControl({
  segmentId,
}: {
  segmentId: NarrationSegment["id"];
}) {
  const segment = NARRATION_SEGMENTS.find(item => item.id === segmentId);
  const {
    activeId,
    playbackState,
    playbackTime,
    duration,
    toggleNarration,
    resetNarration,
  } = useNarrationController();
  const previousSegmentId = useRef(segmentId);

  useEffect(() => {
    if (previousSegmentId.current !== segmentId) {
      resetNarration(previousSegmentId.current);
      previousSegmentId.current = segmentId;
    }
  }, [resetNarration, segmentId]);

  if (!segment) return null;

  const isActive = activeId === segment.id;
  const isPlaying = isActive && playbackState === "playing";
  const resolvedDuration =
    isActive && duration > 0 ? duration : segment.duration;
  const resolvedTime = isActive ? playbackTime : 0;
  const progress =
    resolvedDuration > 0
      ? Math.min(1, Math.max(0, resolvedTime / resolvedDuration))
      : 0;
  const actionLabel =
    isActive && playbackState === "loading"
      ? "Cancel"
      : isPlaying
        ? "Pause"
        : isActive && playbackState === "paused"
          ? "Resume"
          : isActive && playbackState === "complete"
            ? "Replay"
            : isActive && playbackState === "error"
              ? "Try again"
              : "Listen";

  return (
    <div
      className="narration-slot"
      data-narration-ui="audio-guide"
      data-narration-control={segment.id}
      data-narration-chapter={segment.number}
      data-state={isActive ? playbackState : "idle"}
    >
      <button
        type="button"
        className={`inline-narration-control${isActive ? " is-active" : ""}${isPlaying ? " is-playing" : ""}`}
        data-state={isActive ? playbackState : "idle"}
        aria-label={`${actionLabel}: ${segment.title}`}
        aria-pressed={isPlaying}
        onClick={() => void toggleNarration(segment)}
      >
        <span className="inline-narration-control__icon" aria-hidden="true">
          {isPlaying ? <Pause /> : <Play />}
        </span>
        <span className="inline-narration-control__identity">
          <small className="inline-narration-control__eyebrow">
            Audio guide
          </small>
          <strong className="inline-narration-control__title">
            {segment.title}
          </strong>
        </span>
        <span className="inline-narration-control__copy">
          <strong className="inline-narration-control__label">
            {actionLabel}
          </strong>
          <small className="inline-narration-control__time">
            {isActive && resolvedTime > 0
              ? `${formatPlaybackTime(resolvedTime)} / `
              : ""}
            {formatPlaybackTime(resolvedDuration)}
          </small>
        </span>
        <progress
          className="inline-narration-control__progress"
          aria-label={`${segment.title} narration progress`}
          max={1}
          value={progress}
        />
      </button>
    </div>
  );
}

function PageNarrationAnchor({
  segmentId,
}: {
  segmentId: NarrationSegment["id"];
}) {
  return (
    <div className="page-narration-anchor" data-page-narration={segmentId}>
      <InlineNarrationControl segmentId={segmentId} />
    </div>
  );
}

function RecordingPlayer({
  label,
  title,
  chapterKicker,
  chapterTitle,
  src,
  poster,
  durationLabel = "Recording to be added",
  active = true,
  focusWeight,
  timelineCues,
  timelineWindowSize,
  preserveSidecar = false,
  placeholderContent,
}: RecordingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const resolvedFocusWeight = focusWeight ?? (active ? 1 : 0);
  useRecordingFocus(columnRef, videoRef, reducedMotion, resolvedFocusWeight);
  const [playbackState, setPlaybackState] = useState<
    "idle" | "playing" | "paused" | "complete"
  >("idle");
  const [playbackTime, setPlaybackTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const displayTitle =
    title ??
    label.replace(/\s+product recording$/i, "").replace(/\s+recording$/i, "");
  const hasTimeline = Boolean(timelineCues?.length);
  const playbackStarted = playbackState !== "idle" || playbackTime > 0;
  const activeCueIndex =
    playbackStarted && timelineCues?.length
      ? timelineCues.reduce(
          (latest, cue, index) => (playbackTime >= cue.at ? index : latest),
          -1
        )
      : -1;
  const visibleCueStart =
    timelineWindowSize && activeCueIndex >= 0
      ? Math.max(0, activeCueIndex - timelineWindowSize + 1)
      : 0;
  const timelineProgress =
    recordingDuration > 0
      ? Math.min(1, Math.max(0, playbackTime / recordingDuration))
      : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!active && video && !video.paused) video.pause();
  }, [active]);

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }

    if (video.ended) {
      video.currentTime = 0;
      setPlaybackTime(0);
    }
    try {
      await video.play();
    } catch {
      setPlaybackState("paused");
    }
  };

  const statusText =
    playbackState === "playing"
      ? "Playing"
      : playbackState === "paused"
        ? "Paused"
        : playbackState === "complete"
          ? "Playback complete"
          : src
            ? "Ready to play"
            : "Recording slot reserved";

  return (
    <div
      ref={columnRef}
      className={`recording-column${src ? "" : " is-placeholder"}${hasTimeline ? " has-timeline" : ""}${preserveSidecar ? " preserves-sidecar" : ""}`}
      data-recording-slot
      data-recording-focus="idle"
      data-recording-overlay="false"
      data-recording-fullscreen="false"
      data-recording-active={active}
    >
      {hasTimeline && chapterTitle ? (
        <aside className="recording-chapter-title">
          <span>{chapterKicker ?? "Chapter"}</span>
          <strong>{chapterTitle}</strong>
        </aside>
      ) : null}

      {hasTimeline && timelineCues ? (
        <aside
          className="recording-timeline"
          data-visible-cues={activeCueIndex + 1}
          aria-label={`${displayTitle} walkthrough`}
        >
          <header>
            <div>
              <span>Live UI walkthrough</span>
              <strong>What Memova is doing</strong>
            </div>
            <time>
              {formatPlaybackTime(playbackTime)}
              <small> / {formatPlaybackTime(recordingDuration || 30)}</small>
            </time>
          </header>

          <progress
            aria-label={`${displayTitle} playback progress`}
            max={1}
            value={timelineProgress}
          />

          <ol aria-live="polite">
            {timelineCues.map((cue, index) => {
              const isVisible =
                index <= activeCueIndex && index >= visibleCueStart;
              const isActive = index === activeCueIndex;
              const isComplete =
                playbackState === "complete" || index < activeCueIndex;

              return (
                <li
                  key={`${cue.at}-${cue.title}`}
                  className={`${isVisible ? "is-visible" : ""}${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                  aria-hidden={!isVisible}
                >
                  <div className="recording-timeline-step">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <time>{formatPlaybackTime(cue.at)}</time>
                  </div>
                  <div>
                    <strong>{cue.title}</strong>
                    <p>{cue.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>
      ) : null}

      {!hasTimeline || preserveSidecar ? (
        <aside className="recording-sidecar">
          <span>Product UI:</span>
          <strong>{displayTitle}</strong>
          <div
            className={`recording-sidecar-state${playbackState === "complete" ? " is-ready" : ""}`}
            aria-live="polite"
          >
            <i aria-hidden="true" />
            <small>{statusText}</small>
          </div>
          <p>
            {src
              ? playbackState === "playing"
                ? "Click screen to pause"
                : "Click screen to play"
              : durationLabel}
          </p>
          {src ? <time>{durationLabel}</time> : null}
        </aside>
      ) : null}

      <div
        className={`recording-frame${src ? " is-interactive" : " is-placeholder"}`}
        data-playback-state={playbackState}
        role={src ? "button" : undefined}
        tabIndex={src ? 0 : undefined}
        aria-label={
          src
            ? `${playbackState === "playing" ? "Pause" : "Play"} ${displayTitle} recording`
            : undefined
        }
        aria-pressed={src ? playbackState === "playing" : undefined}
        onClick={src ? toggleVideo : undefined}
        onKeyDown={
          src
            ? event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                void toggleVideo();
              }
            : undefined
        }
      >
        {src ? (
          <>
            <video
              ref={videoRef}
              aria-label={label}
              muted
              playsInline
              preload="none"
              poster={poster}
              onPlay={() => setPlaybackState("playing")}
              onLoadedMetadata={event => {
                setRecordingDuration(event.currentTarget.duration);
                setPlaybackTime(event.currentTarget.currentTime);
              }}
              onTimeUpdate={event =>
                setPlaybackTime(event.currentTarget.currentTime)
              }
              onSeeked={event =>
                setPlaybackTime(event.currentTarget.currentTime)
              }
              onPause={() => {
                const video = videoRef.current;
                if (video && !video.ended && video.currentTime > 0)
                  setPlaybackState("paused");
              }}
              onEnded={event => {
                setPlaybackTime(event.currentTarget.duration);
                setPlaybackState("complete");
              }}
            >
              <source src={src} type="video/mp4" />
            </video>
            <span className="recording-play-control" aria-hidden="true">
              {playbackState === "playing" ? (
                <Pause strokeWidth={2.15} />
              ) : (
                <Play strokeWidth={2.15} />
              )}
            </span>
          </>
        ) : (
          <div
            className="recording-placeholder"
            role="img"
            aria-label={`${label} placeholder`}
          >
            {placeholderContent ?? (
              <>
                <span>Chapter recording</span>
                <strong>{label}</strong>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type ConceptBeatProps = {
  label: string;
  time: string;
  className?: string;
  testId?: string;
  beatId?: NarrationSegment["id"];
  narrationId?: NarrationSegment["id"];
  children: ReactNode;
};

function ConceptBeat({
  label,
  time,
  className = "",
  testId,
  beatId,
  narrationId,
  children,
}: ConceptBeatProps) {
  return (
    <section
      className={`chapter-beat concept-beat ${className}`}
      data-testid={testId}
      data-story-beat={beatId}
    >
      {narrationId ? <PageNarrationAnchor segmentId={narrationId} /> : null}
      <div className="beat-meta">
        <p>{label}</p>
        <time>{time}</time>
      </div>
      {children}
    </section>
  );
}

function PlatformPreview({
  output,
}: {
  output: (typeof PLATFORM_OUTPUTS)[number];
}) {
  const usesColorAsset = output.id === "tiktok";
  const previewRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isNearViewport = useNearViewport(previewRef, "240px 0px");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (output.kind !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    if (isNearViewport && !reducedMotion) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isNearViewport, output.kind, reducedMotion]);

  return (
    <article
      ref={previewRef}
      className={`platform-preview platform-preview--${output.id}`}
    >
      <div className="platform-preview-meta">
        <span
          data-platform-logo={output.id}
          className={`platform-brand-mark social-brand-mark--${output.id}${usesColorAsset ? " is-multicolor" : ""}`}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={output.icon} alt="" />
        </span>
        <div>
          <span>{output.source}</span>
          <strong>
            {output.platform} · {output.format}
          </strong>
        </div>
      </div>

      <div className="platform-real-ui">
        {output.kind === "video" ? (
          <video
            ref={videoRef}
            aria-label={output.alt}
            src={output.asset}
            poster={output.poster}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              src={output.asset}
              alt={output.alt}
            />
          </>
        )}
      </div>
    </article>
  );
}

function ProjectMaterialFragment({
  material,
  index,
  progress,
  compact,
}: {
  material: ProjectIngestMaterial;
  index: number;
  progress: number;
  compact: boolean;
}) {
  const start = compact ? material.compact : material.desktop;
  const target = compact ? [56, 43] : [49, 41];
  const mergeStart = 0.055 + index * 0.03;
  const mergeEnd = 0.46 + index * 0.035;
  const merge = easeInOutCubic(progressRange(progress, mergeStart, mergeEnd));
  const fade = progressRange(progress, mergeEnd - 0.075, mergeEnd + 0.015);
  const left = start[0] + (target[0] - start[0]) * merge;
  const top = start[1] + (target[1] - start[1]) * merge;
  const scale = 1 - merge * 0.94;
  const rotation = material.rotation * (1 - merge);
  const opacity = 1 - fade;
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isNearViewport = useNearViewport(figureRef);

  useEffect(() => {
    if (material.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    if (isNearViewport && opacity > 0.08) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isNearViewport, material.type, opacity]);

  return (
    <figure
      ref={figureRef}
      className={`project-ingest-material project-ingest-material--${material.variant}`}
      aria-hidden={opacity < 0.05}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        opacity,
        filter: `blur(${fade * 2.2}px)`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      {material.type === "video" ? (
        <video
          ref={videoRef}
          src={material.src}
          aria-label={material.alt}
          muted
          playsInline
          preload="none"
          onLoadedMetadata={event => {
            const video = event.currentTarget;
            if (video.duration > 24) video.currentTime = 22;
            if (isNearViewport) video.play().catch(() => {});
          }}
          onTimeUpdate={event => {
            const video = event.currentTarget;
            if (video.currentTime > 29) video.currentTime = 22;
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          decoding="async"
          src={material.src}
          alt={material.alt}
          draggable="false"
        />
      )}
    </figure>
  );
}

function ProjectIngestBeat() {
  const sectionRef = useRef<HTMLElement>(null);
  const compact = useMediaQuery("(max-width: 820px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const progress = useProjectIngestProgress(sectionRef, reducedMotion);

  const collector = {
    x: compact ? 50 : 46,
    y: compact ? 50 : 51,
  };
  const bookReveal = easeOutCubic(progressRange(progress, 0.025, 0.23));
  const bookSettle = easeInOutCubic(progressRange(progress, 0.31, 0.55));
  const finalFocus = easeInOutCubic(progressRange(progress, 0.61, 0.84));
  const bookX = collector.x + (50 - collector.x) * finalFocus;
  const bookY = collector.y + ((compact ? 31 : 32) - collector.y) * finalFocus;
  const bookScale =
    0.34 + bookReveal * 0.75 - bookSettle * 0.09 - finalFocus * 0.08;
  const bookOpacity = 0.05 + bookReveal * 0.95;

  const introExit = easeInOutCubic(progressRange(progress, 0.08, 0.3));
  const finaleEnter = easeOutCubic(progressRange(progress, 0.77, 0.9));
  const statusEnter = easeOutCubic(progressRange(progress, 0.54, 0.7));

  return (
    <section
      ref={sectionRef}
      className="project-ingest-beat"
      data-testid="project-book-ingest"
      data-story-beat="03-project-ingest"
    >
      <div className="project-ingest-sticky">
        <PageNarrationAnchor segmentId="03-project-ingest" />
        <div className="beat-meta">
          <p>Chapter 03 · Connect</p>
          <time>00:52–00:58</time>
        </div>

        <div className="project-ingest-stage">
          <div className="project-ingest-dots" aria-hidden="true" />
          <div className="project-ingest-orb" aria-hidden="true" />

          <div
            className="project-ingest-intro"
            style={{
              opacity: 1 - introExit,
              filter: `blur(${introExit * 10}px)`,
              transform: compact
                ? `translateY(-${introExit * 24}px)`
                : `translateY(calc(-50% - ${introExit * 24}px))`,
            }}
          >
            <h2>From scattered sources to a living Book.</h2>
            <p>
              Note, finished Page, photographs, footage, and private knowledge
              meet in one working context.
            </p>
          </div>

          {!reducedMotion ? (
            <div
              className="project-ingest-fragments"
              aria-label="Project source materials"
            >
              {PROJECT_INGEST_MATERIALS.map((material, index) => (
                <ProjectMaterialFragment
                  key={material.id}
                  material={material}
                  index={index}
                  progress={progress}
                  compact={compact}
                />
              ))}
            </div>
          ) : null}

          <div
            className="project-ingest-glow"
            aria-hidden="true"
            style={{
              left: `${collector.x}%`,
              top: `${collector.y}%`,
              opacity:
                progressRange(progress, 0.05, 0.2) *
                (1 - progressRange(progress, 0.46, 0.64)),
              transform: `translate(-50%, -50%) scale(${0.55 + bookReveal * 0.8})`,
            }}
          />

          <figure
            className="project-ingest-book"
            style={{
              left: `${bookX}%`,
              top: `${bookY}%`,
              opacity: bookOpacity,
              transform: `translate(-50%, -50%) scale(${bookScale})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              src="/demo/media/project-book-knowledge.png"
              alt="Two hands holding an open Memova Book that collects the Project context"
            />
            <figcaption
              style={{
                opacity: statusEnter,
                transform: `translate(-50%, ${12 - statusEnter * 12}px)`,
              }}
            >
              <span aria-hidden="true" />5 sources connected
            </figcaption>
          </figure>

          <div
            className="project-ingest-finale"
            style={{
              opacity: finaleEnter,
              filter: `blur(${(1 - finaleEnter) * 10}px)`,
              transform: `translate(-50%, ${20 - finaleEnter * 20}px)`,
            }}
          >
            <h2>Project Book ready.</h2>
            <p>
              Every source and output stays connected—and becomes context for
              what comes next.
            </p>
          </div>

          <p className="project-ingest-credit">
            Apollo 11 source material · NASA
          </p>

          <div
            className="project-ingest-cue"
            style={{ opacity: 1 - progressRange(progress, 0.02, 0.16) }}
          >
            <span>Scroll to collect</span>
            <DirectionArrow direction="down" />
          </div>
        </div>
      </div>
    </section>
  );
}

function KnowledgeFolderIcon({
  node,
}: {
  node: (typeof KB_WIKI_FOLDERS)[number];
}) {
  if (node.id === "projects") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        loading="lazy"
        decoding="async"
        className="kb-wiki-node-icon"
        src="/demo/icons/memova-project.svg"
        alt=""
      />
    );
  }

  const Icon =
    node.kind === "locked"
      ? FolderLock
      : node.kind === "open"
        ? FolderOpen
        : Folder;
  return <Icon aria-hidden="true" strokeWidth={1.7} />;
}

function OrbitSignalIcon({
  type,
}: {
  type: (typeof KB_ORBIT_ITEMS)[number]["type"];
}) {
  const asset =
    type === "meeting"
      ? "/demo/icons/memova-meeting.svg"
      : type === "spark"
        ? "/demo/icons/memova-spark.svg"
        : type === "files"
          ? "/demo/icons/memova-file.svg"
          : type === "projects"
            ? "/demo/icons/memova-project.svg"
            : null;

  if (asset) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        loading="lazy"
        decoding="async"
        className="kb-orbit-signal-icon"
        src={asset}
        alt=""
      />
    );
  }

  const fallbackNode =
    KB_WIKI_FOLDERS.find(node => node.id === type) ?? KB_WIKI_FOLDERS[1];
  return <KnowledgeFolderIcon node={fallbackNode} />;
}

function KnowledgeBaseChapter({
  footer,
  onOpenCase,
}: {
  footer: ReactNode;
  onOpenCase: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const compact = useMediaQuery("(max-width: 900px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const progress = useProjectIngestProgress(sectionRef, reducedMotion);

  const orbitTravel = easeInOutCubic(progressRange(progress, 0.005, 0.18));
  const snapToWiki = easeInOutCubic(progressRange(progress, 0.13, 0.285));
  const backgroundDock = easeInOutCubic(progressRange(progress, 0.015, 0.14));
  const backgroundLift = progressRange(progress, 0.005, 0.36);
  const backgroundScale = 1.04 + backgroundLift * 0.09;
  // Dock the Earth beneath the Memova core before the orbit resolves into the Wiki.
  const backgroundShiftX = compact ? 0 : backgroundDock * 14.6;
  const backgroundShiftY = compact
    ? backgroundLift * -7
    : backgroundDock * (20.33 + backgroundLift * 1.82);
  const backgroundGroundRise = easeInOutCubic(
    progressRange(progress, 0.08, 0.31)
  );
  const backgroundLighten = easeInOutCubic(
    progressRange(progress, 0.255, 0.37)
  );
  const heroOpacity = 1 - easeOutCubic(progressRange(progress, 0.14, 0.25));
  const orbitOpacity = 1 - easeInOutCubic(progressRange(progress, 0.16, 0.3));
  const lunarOpacity = 1 - easeInOutCubic(progressRange(progress, 0.2, 0.38));
  const coreReveal = easeOutCubic(progressRange(progress, 0.035, 0.13));
  const traceReveal =
    easeOutCubic(progressRange(progress, 0.075, 0.12)) *
    (1 - progressRange(progress, 0.19, 0.235));
  const wikiReveal = easeOutCubic(progressRange(progress, 0.17, 0.3));
  const rootReveal = easeOutCubic(progressRange(progress, 0.18, 0.28));
  const structureReveal = easeInOutCubic(progressRange(progress, 0.19, 0.33));
  const outputReveal = easeOutCubic(progressRange(progress, 0.28, 0.37));
  const shellMorph = easeInOutCubic(progressRange(progress, 0.39, 0.5));
  const conceptExit = easeInOutCubic(progressRange(progress, 0.4, 0.51));
  const videoReveal = easeOutCubic(progressRange(progress, 0.435, 0.52));
  const caseReveal = easeInOutCubic(progressRange(progress, 0.79, 0.89));
  const videoOpacity = videoReveal * (1 - caseReveal);
  const stage =
    progress < 0.46 ? "context" : progress < 0.82 ? "video" : "case";
  const conceptPhase =
    progress < 0.205 ? "orbit" : progress < 0.435 ? "wiki" : "handoff";
  const narrationId: NarrationSegment["id"] =
    stage === "video"
      ? "01-knowledge-base-ui"
      : stage === "case"
        ? "01-apollo-case"
        : conceptPhase === "orbit"
          ? "01-everyday-context"
          : "01-personal-llm-wiki";

  const wikiWidth =
    (compact ? 342 : 1040) + shellMorph * (compact ? -120 : -798);
  const wikiHeight = (compact ? 452 : 520) + shellMorph * 24;
  const wikiRadius = 25 + shellMorph * 5;
  const wikiContentOpacity =
    wikiReveal * (1 - progressRange(progress, 0.435, 0.485));

  return (
    <article className="knowledge-chapter" data-content-slot="knowledge-base">
      <section
        ref={sectionRef}
        className="kb-story-scroll scroll-driven-story scroll-driven-story--four"
        data-auto-stage={stage}
        data-testid="chapter-01-scroll-story"
      >
        <ConceptBeat
          label="Chapter 01 · Collect & Understand"
          time="00:00–00:20"
          className="kb-story-beat"
          testId="chapter-01-intro"
          beatId={narrationId}
          narrationId={narrationId}
        >
          <div
            className="kb-story-stage"
            data-stage={stage}
            data-concept-phase={conceptPhase}
          >
            <div
              className="kb-story-scene-meta"
              aria-label="Chapter 01 scene timing"
            >
              <span className={stage === "context" ? "is-active" : ""}>
                Everyday context <time>00:00–00:08</time>
              </span>
              <span className={stage === "video" ? "is-active" : ""}>
                Knowledge Base Setup · Real UI <time>00:08–00:18</time>
              </span>
              <span className={stage === "case" ? "is-active" : ""}>
                Case context <time>00:18–00:20</time>
              </span>
            </div>

            <div
              className="kb-story-concept"
              aria-hidden={stage !== "context"}
              style={{ opacity: 1 - conceptExit }}
            >
              <div className="kb-lunar-scene" style={{ opacity: lunarOpacity }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  className="kb-lunar-backdrop"
                  src="/demo/media/apollo11-earth-horizon.jpg"
                  alt=""
                  aria-hidden="true"
                  style={{
                    transform: `translate3d(${backgroundShiftX}%, ${backgroundShiftY}%, 0) scale(${backgroundScale})`,
                  }}
                />
                <div className="kb-lunar-wash" aria-hidden="true" />
                <div
                  className="kb-lunar-ground-rise"
                  aria-hidden="true"
                  style={{
                    opacity: backgroundGroundRise,
                    transform: `translate3d(0, ${(1 - backgroundGroundRise) * 24}%, 0)`,
                  }}
                />
                <div
                  className="kb-lunar-transition-wash"
                  aria-hidden="true"
                  style={{ opacity: backgroundLighten }}
                />
                <p className="kb-lunar-credit">
                  NASA · Apollo 11 source material
                </p>
              </div>

              <div
                className="kb-cosmos-hero"
                style={{
                  opacity: heroOpacity,
                  transform: `translateY(calc(-50% - ${snapToWiki * 18}px))`,
                }}
              >
                <span>Personal Knowledge Layer</span>
                <h2>
                  From everyday signals
                  <br />
                  to understood Context.
                </h2>
                <div>
                  <small>Local</small>
                  <small>Open-source</small>
                  <small>Private</small>
                </div>
              </div>

              <div
                className="kb-orbit-field"
                aria-label="Unstructured context moving into a Personal LLM Wiki"
                style={{ opacity: orbitOpacity }}
              >
                <span
                  className="kb-orbit-ring kb-orbit-ring--one"
                  aria-hidden="true"
                  style={
                    {
                      "--kb-ring-spin": `${orbitTravel * 126}deg`,
                    } as CSSProperties
                  }
                />
                <span
                  className="kb-orbit-ring kb-orbit-ring--two"
                  aria-hidden="true"
                  style={
                    {
                      "--kb-ring-spin": `${orbitTravel * -104}deg`,
                    } as CSSProperties
                  }
                />
                <span
                  className="kb-orbit-ring kb-orbit-ring--three"
                  aria-hidden="true"
                  style={
                    {
                      "--kb-ring-spin": `${orbitTravel * 158}deg`,
                    } as CSSProperties
                  }
                />

                <div
                  className="kb-cosmos-core"
                  style={{
                    opacity: coreReveal * (1 - snapToWiki * 0.72),
                    transform: `translate(-50%, -50%) scale(${0.84 + coreReveal * 0.16 - snapToWiki * 0.08})`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    className="kb-cosmos-brand"
                    src="/demo/brand/memova-logo.png"
                    alt="Memova"
                  />
                </div>

                {KB_ORBIT_ITEMS.map(item => {
                  const track = KB_ORBIT_TRACKS[item.track];
                  const angle =
                    item.phase + orbitTravel * Math.PI * 2 * track.turns;
                  const orbitCenterX = compact ? 50 : 70;
                  const orbitX = orbitCenterX + Math.cos(angle) * track.radiusX;
                  const orbitY = 46 + Math.sin(angle) * track.radiusY;
                  const targetX = compact
                    ? 50 + (item.target[0] - 50) * 0.78
                    : item.target[0];
                  const targetY = item.target[1];
                  const x = orbitX + (targetX - orbitX) * snapToWiki;
                  const y = orbitY + (targetY - orbitY) * snapToWiki;
                  const cardScale = 1 - snapToWiki * 0.34;

                  return (
                    <article
                      key={item.id}
                      className={`kb-orbit-card kb-orbit-card--${item.type}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotation * (1 - snapToWiki)}deg) scale(${cardScale})`,
                      }}
                    >
                      <OrbitSignalIcon type={item.type} />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.meta}</small>
                      </span>
                    </article>
                  );
                })}

                <article
                  className="kb-cosmos-trace"
                  style={{
                    opacity: traceReveal,
                    transform: `translateY(${14 - traceReveal * 14}px)`,
                  }}
                >
                  <span>Tracing signal</span>
                  <strong>Meeting audio</strong>
                  <p>Intent, commitments, and what should happen next.</p>
                  <small>Creates · Action plan</small>
                </article>
              </div>

              <div
                className="kb-story-grid"
                aria-hidden="true"
                style={{ opacity: wikiReveal * 0.52 }}
              />

              <div
                className="kb-wiki-shell"
                style={{
                  width: `${wikiWidth}px`,
                  height: `${wikiHeight}px`,
                  borderRadius: `${wikiRadius}px`,
                  opacity: wikiReveal,
                }}
              >
                <div
                  className="kb-wiki-shell-content"
                  style={{ opacity: wikiContentOpacity }}
                >
                  <header className="kb-wiki-header">
                    <div>
                      <span>Memova managed root</span>
                      <strong>Personal LLM Wiki</strong>
                    </div>
                    <small>Local · open-source · private</small>
                  </header>

                  <div
                    className="kb-wiki-capture-strip"
                    aria-label="Everyday context inputs"
                  >
                    <span className="kb-wiki-capture-label">Captured from</span>
                    {KB_SOURCE_FRAGMENTS.map((source, index) => {
                      const reveal = easeOutCubic(
                        progressRange(
                          progress,
                          0.17 + index * 0.012,
                          0.25 + index * 0.012
                        )
                      );

                      return (
                        <article
                          key={source.id}
                          style={{
                            opacity: 0.38 + reveal * 0.62,
                            transform: `translateY(${12 - reveal * 12}px)`,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            loading="lazy"
                            decoding="async"
                            src={source.asset}
                            alt=""
                          />
                          <span>
                            <strong>{source.label}</strong>
                            <small>{source.meta}</small>
                          </span>
                        </article>
                      );
                    })}
                    <ArrowDown
                      className="kb-wiki-capture-arrow"
                      aria-hidden="true"
                      strokeWidth={1.6}
                    />
                  </div>

                  <div className="kb-wiki-root" style={{ opacity: rootReveal }}>
                    <span className="kb-wiki-root-icon" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        loading="lazy"
                        decoding="async"
                        src="/demo/icons/memova-book.svg"
                        alt=""
                      />
                    </span>
                    <span>
                      <strong>Structured by Memova</strong>
                      <small>Capture · connect · remember · create</small>
                    </span>
                    <b>One context layer</b>
                  </div>

                  <div
                    className="kb-wiki-tree"
                    role="tree"
                    aria-label="Local LLM Wiki architecture"
                    style={
                      { "--kb-tree-reveal": structureReveal } as CSSProperties
                    }
                  >
                    {KB_WIKI_GROUPS.map((group, groupIndex) => {
                      const nodes = KB_WIKI_FOLDERS.filter(
                        node => node.group === group.id
                      );
                      const groupReveal = easeOutCubic(
                        progressRange(
                          progress,
                          0.19 + groupIndex * 0.018,
                          0.3 + groupIndex * 0.018
                        )
                      );

                      return (
                        <section
                          key={group.id}
                          role="group"
                          aria-label={`${group.number} ${group.label}`}
                          className={`kb-wiki-group kb-wiki-group--${group.id}`}
                          style={{
                            opacity: 0.18 + groupReveal * 0.82,
                            transform: `translateY(${18 - groupReveal * 18}px)`,
                          }}
                        >
                          <header>
                            <span>{group.number}</span>
                            <div>
                              <strong>{group.label}</strong>
                              <small>{group.detail}</small>
                            </div>
                          </header>

                          <div className="kb-wiki-group-nodes">
                            {nodes.map(node => {
                              const index = KB_WIKI_FOLDERS.findIndex(
                                item => item.id === node.id
                              );
                              const reveal = easeOutCubic(
                                progressRange(
                                  progress,
                                  0.19 + index * 0.01,
                                  0.3 + index * 0.01
                                )
                              );
                              const muted =
                                outputReveal > 0.12 &&
                                node.id !== "inbox" &&
                                node.id !== "wiki" &&
                                node.id !== "projects" &&
                                node.id !== "outputs";

                              return (
                                <article
                                  key={node.id}
                                  role="treeitem"
                                  aria-selected="false"
                                  className={`kb-wiki-node kb-wiki-node--${node.id}${muted ? " is-muted" : ""}`}
                                  style={{
                                    opacity: 0.2 + reveal * 0.8,
                                    transform: `translate(${(1 - reveal) * node.offset[0] * 0.28}px, ${(1 - reveal) * node.offset[1] * 0.18}px) scale(${0.92 + reveal * 0.08})`,
                                  }}
                                >
                                  <KnowledgeFolderIcon node={node} />
                                  <span>
                                    <strong>{node.label}</strong>
                                    <small>{node.detail}</small>
                                  </span>
                                  {node.id === "inbox" && <b>Promote</b>}
                                  {node.id === "outputs" && (
                                    <div
                                      className="kb-wiki-output-children"
                                      aria-label="Outputs created from context"
                                      style={{ opacity: outputReveal }}
                                    >
                                      {KB_OUTCOMES.map(
                                        (outcome, outcomeIndex) => {
                                          const childReveal = easeOutCubic(
                                            progressRange(
                                              progress,
                                              0.31 + outcomeIndex * 0.012,
                                              0.385 + outcomeIndex * 0.012
                                            )
                                          );
                                          return (
                                            <em
                                              key={outcome.id}
                                              style={{
                                                opacity: childReveal,
                                                transform: `translateX(${8 - childReveal * 8}px)`,
                                              }}
                                            >
                                              {outcome.label}
                                            </em>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </article>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  <div
                    className="kb-wiki-root-files"
                    role="tree"
                    aria-label="Root knowledge files"
                  >
                    {KB_ROOT_FILES.map((file, index) => {
                      const reveal = easeOutCubic(
                        progressRange(
                          progress,
                          0.25 + index * 0.012,
                          0.34 + index * 0.012
                        )
                      );

                      return (
                        <article
                          key={file.id}
                          role="treeitem"
                          aria-selected="false"
                          style={{
                            opacity: 0.16 + reveal * 0.84,
                            transform: `translateY(${14 - reveal * 14}px)`,
                          }}
                        >
                          <FileText aria-hidden="true" strokeWidth={1.6} />
                          <span>
                            <strong>{file.label}</strong>
                            <small>{file.detail}</small>
                          </span>
                        </article>
                      );
                    })}
                  </div>

                  <div
                    className="kb-wiki-ready"
                    style={{ opacity: outputReveal }}
                  >
                    <span aria-hidden="true" />
                    <strong>LLM Wiki ready</strong>
                    <small>Available to connected agents</small>
                  </div>
                </div>
              </div>

              <div
                className="kb-story-scroll-cue"
                style={{ opacity: 1 - progressRange(progress, 0.025, 0.13) }}
              >
                <span>Scroll to connect</span>
                <DirectionArrow direction="down" />
              </div>
            </div>

            <div
              className="kb-story-video-layer"
              data-testid="chapter-01-demo"
              aria-hidden={stage !== "video"}
              inert={stage !== "video"}
              style={{
                opacity: videoOpacity,
                transform: `translateY(${(1 - videoReveal) * 22 - caseReveal * 12}px)`,
              }}
            >
              <span className="kb-recording-caption kb-recording-caption--left">
                Local-first · User-owned · Private
              </span>
              <span className="kb-recording-caption kb-recording-caption--right">
                Available to connected agents
              </span>
              <RecordingPlayer
                active={stage === "video"}
                focusWeight={videoOpacity}
                label="Knowledge Base setup product recording"
                title="Knowledge Base Setup"
                src="/demo/recordings/chapter-01-knowledge-base-setup.mp4"
                poster="/demo/posters/chapter-01-knowledge-base-setup.png"
                durationLabel="10s product recording"
                timelineCues={KNOWLEDGE_BASE_SETUP_CUES}
                preserveSidecar
              />
            </div>

            <div
              className="kb-story-case-layer"
              data-testid="chapter-01-case"
              aria-hidden={stage !== "case"}
              inert={stage !== "case"}
              style={{
                opacity: caseReveal,
                transform: `translateY(${18 - caseReveal * 18}px)`,
              }}
            >
              <button
                type="button"
                className="kb-story-tail-frame"
                aria-label="Open the Apollo 11 Note example"
                onClick={onOpenCase}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src="/demo/media/kb-apollo-case-entry-ui.png"
                  alt="Memova home showing the Apollo 11 After the Giant Leap sample note"
                />
                <span className="kb-case-image-cta" aria-hidden="true">
                  Open the Apollo 11 Note
                  <DirectionArrow direction="right" />
                </span>
              </button>

              <div className="kb-case-detail-column">
                <figure className="kb-case-crew-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/demo/media/apollo11-official-crew-portrait.jpg"
                    alt="Apollo 11 prime crew: Neil Armstrong, Michael Collins, and Buzz Aldrin"
                  />
                  <figcaption>NASA · Apollo 11 Prime Crew</figcaption>
                </figure>

                <button
                  type="button"
                  className="kb-case-copy-link"
                  aria-label="Open the Apollo 11 Note example"
                  onClick={onOpenCase}
                >
                  <span>Apollo 11 · Case context</span>
                  <strong>Let&apos;s take Apollo 11 as an example.</strong>
                  <small>
                    Continue into the Note
                    <DirectionArrow direction="right" />
                  </small>
                </button>
              </div>

              {footer}
            </div>
          </div>
        </ConceptBeat>
      </section>
    </article>
  );
}

function NoteChapter({ footer }: { footer: ReactNode }) {
  return (
    <article
      className="scripted-chapter note-workflow-chapter"
      data-content-slot="note"
    >
      <ConceptBeat
        label="Chapter 02 · Act · Real UI"
        time="00:20–00:52"
        className="recording-beat note-recording-beat"
        testId="note-recording"
        beatId="02-note-workflow"
        narrationId="02-note-workflow"
      >
        <RecordingPlayer
          label="Note workflow recording"
          title="Note Workflow"
          chapterKicker="Chapter 02 · Note"
          chapterTitle="From Context to action."
          src="/demo/recordings/chapter-02-note-workflow-30s.mp4"
          poster="/demo/posters/chapter-02-note-workflow-30s.png"
          durationLabel="30s product recording"
          timelineCues={NOTE_WORKFLOW_CUES}
        />
      </ConceptBeat>

      <ConceptBeat
        label="Generated from this Note"
        time="00:52–00:58"
        className="html-output-beat note-share-page"
        testId="note-overview-page"
        beatId="02-complete-note"
        narrationId="02-complete-note"
      >
        <div className="html-output-heading">
          <div>
            <span>Generated from this Note</span>
            <h2>The complete Note, ready to explore.</h2>
          </div>
          <div
            className="html-output-actions"
            aria-label="Page action preview"
          >
            <span>Share link</span>
            <span>Encrypt</span>
          </div>
        </div>

        <div className="html-page-browser">
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <strong>memova.page/apollo-11/after-the-giant-leap</strong>
          </div>
          <div
            className="html-page-scroll"
            tabIndex={0}
            aria-label="Scrollable Apollo 11 HTML Page preview"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              src="/demo/media/apollo-html-page.png"
              alt="After the Giant Leap Apollo 11 HTML Page"
            />
          </div>
        </div>

        {footer}
      </ConceptBeat>
    </article>
  );
}

function BookChapter({ footer }: { footer: ReactNode }) {
  return (
    <article className="scripted-chapter" data-content-slot="book">
      <ProjectIngestBeat />

      <ConceptBeat
        label="Chapter 03 · Connect · Real UI"
        time="00:58–01:12"
        className="recording-beat project-recording-beat chapter-ending-recording-beat"
        testId="project-book-recording"
        beatId="03-project-book-ui"
        narrationId="03-project-book-ui"
      >
        <RecordingPlayer
          label="Project Book generation recording"
          title="Project Book Generation"
          src="/demo/recordings/chapter-03-project-book.mp4"
          poster="/demo/posters/chapter-03-project-book.png"
          durationLabel="22s product recording"
          timelineCues={BOOK_WORKFLOW_CUES}
          preserveSidecar
        />
        {footer}
      </ConceptBeat>
    </article>
  );
}

function OutputPlatformResults() {
  return (
    <ConceptBeat
      label="Chapter 04 · Express"
      time="01:20–01:25"
      className="output-convergence-beat output-opening-beat"
      testId="platform-triptych"
      beatId="04-platform-results"
      narrationId="04-platform-results"
    >
      <header className="output-convergence-heading">
        <div>
          <span className="note-status">
            <i />
            Chapter 04 · Express · Output &amp; Share
          </span>
          <h2>
            From knowledge
            <br />
            to expression.
          </h2>
        </div>
        <div className="output-convergence-intro">
          <span>Three Platform Results</span>
          <strong>One Page. Native expressions.</strong>
        </div>
      </header>

      <div className="social-distribution-stage">
        <div className="social-logo-field" aria-hidden="true">
          {SOCIAL_DESTINATIONS.map(destination => {
            const usesColorAsset =
              destination.id === "instagram" || destination.id === "tiktok";

            return (
              <span
                key={destination.id}
                data-social-logo={destination.id}
                className={`social-brand-mark--${destination.id}${"primary" in destination && destination.primary ? " is-primary" : ""}${usesColorAsset ? " is-multicolor" : ""}`}
                style={
                  {
                    "--social-x": `${destination.x}%`,
                    "--social-y": `${destination.y}%`,
                    "--social-scale": destination.scale,
                    "--social-delay": `${destination.delay}s`,
                  } as CSSProperties
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src={`/demo/icons/social/${destination.id}${usesColorAsset ? "-color" : ""}.svg`}
                  alt=""
                />
                <small>{destination.label}</small>
              </span>
            );
          })}
        </div>

        <div className="platform-triptych">
          {PLATFORM_OUTPUTS.map(output => (
            <PlatformPreview key={output.id} output={output} />
          ))}
        </div>
      </div>

      <div className="output-footer">
        <div className="output-statements">
          <span>From Note to post.</span>
          <span>From text to visuals.</span>
          <span>From Project to video.</span>
        </div>
        <div className="output-actions" aria-label="Output action preview">
          <span>Edit</span>
          <span>Iterate</span>
          <span className="is-primary">
            Share
          </span>
        </div>
      </div>
    </ConceptBeat>
  );
}

function OutputShareChapter({ footer }: { footer: ReactNode }) {
  return (
    <article className="scripted-chapter" data-content-slot="output-share">
      <OutputPlatformResults />

      <ConceptBeat
        label="Standalone Note Output · Real UI"
        time="01:25–01:44"
        className="output-single-recording-beat"
        testId="standalone-note-sharing"
        beatId="04-standalone-note-sharing"
        narrationId="04-standalone-note-sharing"
      >
        <div className="output-single-recording-stage">
          <div className="output-recording-context">
            <span>From Standalone Note Output</span>
            <strong>
              X · Text + Link&nbsp;&nbsp; / &nbsp;&nbsp;LinkedIn · Visual
              Carousel
            </strong>
          </div>
          <RecordingPlayer
            title="Standalone Note Sharing"
            label="Standalone Note social sharing recording"
            src="/demo/recordings/chapter-04-standalone-note-sharing.mp4"
            poster="/demo/posters/chapter-04-standalone-note-sharing.png"
            durationLabel="27s X and LinkedIn recording"
            timelineCues={STANDALONE_NOTE_SHARING_CUES}
          />
        </div>
      </ConceptBeat>

      <ConceptBeat
        label="Project HTML Output · Real UI"
        time="01:44–02:05"
        className="output-single-recording-beat chapter-ending-recording-beat"
        testId="project-html-sharing"
        beatId="04-project-html-sharing"
        narrationId="04-project-html-sharing"
      >
        <div className="output-single-recording-stage">
          <div className="output-recording-context">
            <span>From Project HTML Output</span>
            <strong>TikTok · 9:16 Video</strong>
          </div>
          <RecordingPlayer
            title="Project HTML Sharing"
            label="Project HTML TikTok sharing recording"
            src="/demo/recordings/chapter-04-project-html-sharing.mp4"
            poster="/demo/posters/chapter-04-project-html-sharing.png"
            durationLabel="14s TikTok recording"
            timelineCues={PROJECT_HTML_SHARING_CUES}
          />
        </div>
        {footer}
      </ConceptBeat>
    </article>
  );
}

type ContextReturnScene =
  | "page-enter"
  | "book-pages"
  | "provenance"
  | "match-cut";

const CONTEXT_RETURN_SCENES = [
  {
    id: "page-enter",
    number: "01",
    time: "02:05–02:09",
    label: "Page enters Book",
  },
  {
    id: "book-pages",
    number: "02",
    time: "02:09–02:15",
    label: "Pages form a Book",
  },
  {
    id: "provenance",
    number: "03",
    time: "02:15–02:22",
    label: "Reveal provenance",
  },
  { id: "match-cut", number: "04", time: "02:22–02:27", label: "Ask Memova" },
] as const;

const CONTEXT_RETURN_SCENE_PROGRESS: Record<ContextReturnScene, number> = {
  "page-enter": 0.18,
  "book-pages": 0.45,
  provenance: 0.77,
  "match-cut": 1,
};

const RETURN_SOURCE_CONTEXT = [
  {
    id: "note",
    label: "This Note",
    detail: "Landing decisions",
    icon: FileText,
  },
  {
    id: "project",
    label: "This Project",
    detail: "Apollo 11 Archive",
    icon: Folder,
  },
  {
    id: "related",
    label: "Related Pages",
    detail: "3 connected Pages",
    icon: Link2,
  },
] as const;

function AskMemovaSurface({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`ask-memova-surface${compact ? " is-compact" : ""}`}>
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          src="/demo/brand/memova-logo.png"
          alt=""
        />
        <div>
          <strong>Ask Memova</strong>
          <span>Private context active</span>
        </div>
        <Sparkles aria-hidden="true" />
      </header>

      <div
        className="ask-memova-context-deck"
        aria-label="Ask Memova context cards"
      >
        {RETURN_SOURCE_CONTEXT.map(source => {
          const Icon = source.icon;
          return (
            <article key={source.id}>
              <Icon aria-hidden="true" />
              <span>{source.label}</span>
              <small>{source.detail}</small>
            </article>
          );
        })}
      </div>

      <div className="ask-memova-conversation">
        <span>Ask with context</span>
        <strong>What should I carry forward from Apollo 11?</strong>
        <p>
          Use the Page, its Note, Project, and related Pages to explain the
          decision boundary.
        </p>
        <ol>
          <li>
            <b>01</b>
            <span>Make the constraint visible before offering a judgment.</span>
          </li>
          <li>
            <b>02</b>
            <span>
              Keep evidence, interpretation, and uncertainty distinct.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>Let the final decision remain human and reviewable.</span>
          </li>
        </ol>
      </div>

      <div className="ask-memova-composer">
        <span>Ask Memova anything…</span>
        <ArrowUpRight aria-hidden="true" />
      </div>
    </div>
  );
}

function ContextReturnLoop() {
  const [activeScene, setActiveScene] =
    useState<ContextReturnScene>("page-enter");
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const storyProgress = CONTEXT_RETURN_SCENE_PROGRESS[activeScene];
  const sceneIndex = CONTEXT_RETURN_SCENES.findIndex(
    scene => scene.id === activeScene
  );
  const showScene = (index: number) => {
    const nextScene = CONTEXT_RETURN_SCENES[index];
    if (!nextScene) return;

    setActiveScene(nextScene.id);
    setProvenanceOpen(false);
  };
  const pageEntryProgress = easeOutCubic(progressRange(storyProgress, 0, 0.18));
  const pagesProgress = progressRange(storyProgress, 0.18, 0.45);
  const provenanceProgress = progressRange(storyProgress, 0.45, 0.77);
  const matchCutProgress = easeInOutCubic(
    progressRange(storyProgress, 0.77, 1)
  );
  const askRevealProgress = easeOutCubic(
    progressRange(matchCutProgress, 0.3, 1)
  );
  const provenanceAutoOpen =
    activeScene === "provenance" && provenanceProgress >= 0.18;
  const sourceVisible =
    provenanceOpen || provenanceAutoOpen || activeScene === "match-cut";
  const pageLeft =
    60 - pageEntryProgress * 31 + pagesProgress * 10 - provenanceProgress * 22;
  const pageScale =
    1.06 -
    pageEntryProgress * 0.32 -
    pagesProgress * 0.12 +
    provenanceProgress * 0.28;
  const pageInBookOpacity = 1 - progressRange(pagesProgress, 0.08, 0.55);
  const pageReentryOpacity = progressRange(provenanceProgress, 0, 0.12);
  const pageOpacity =
    Math.max(pageInBookOpacity, pageReentryOpacity) * (1 - matchCutProgress);
  const outpostOpacity = 1 - progressRange(storyProgress, 0.12, 0.31);
  const bookOpacity = 1 - matchCutProgress;
  const sourceOpacity = sourceVisible
    ? 1 - progressRange(matchCutProgress, 0.05, 0.3)
    : 0;
  const screenCopy =
    activeScene === "page-enter"
      ? "Page added to The Book"
      : activeScene === "book-pages"
        ? "Pages connect into Books."
        : activeScene === "provenance"
          ? "Every Page becomes context for the next."
          : "A private + public Wikipedia, shaped by your intent and privacy.";
  const screenDetail =
    activeScene === "page-enter"
      ? "The complete Page returns to your private Book. Public posts stay outside."
      : activeScene === "book-pages"
        ? "Cover, text, imagery, timeline, and sources share one spine."
        : activeScene === "provenance"
          ? "Inspect the context behind every generated Page."
          : "The same context becomes a live Ask Memova conversation.";
  const pageCards = [
    {
      id: "cover",
      label: "Page cover",
      icon: BookOpen,
      asset: "/demo/media/chapter-05-return-page-cover-aldrin-flag.jpg",
      alt: "Buzz Aldrin beside the United States flag on the lunar surface",
    },
    {
      id: "fragment",
      label: "Text fragment",
      icon: FileText,
      copy: "At 500 feet, the landing became a decision under constraint.",
    },
    {
      id: "image",
      label: "Image",
      icon: FileImage,
      asset: "/demo/media/chapter-05-return-page-image-mission-control.jpg",
      alt: "Apollo 11 mission control team at their consoles",
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Clock3,
      copy: "102:42 · Descent\n102:45 · Manual control\n102:46 · Contact light",
    },
    {
      id: "sources",
      label: "Source mark",
      icon: Link2,
      copy: "NASA archive · Project sources",
    },
  ] as const;

  return (
    <section
      className="context-return-step-story"
      data-auto-stage={activeScene}
      style={
        {
          "--return-page-entry": pageEntryProgress,
          "--return-pages-progress": pagesProgress,
          "--return-provenance-progress": provenanceProgress,
          "--return-match-cut": askRevealProgress,
          "--return-current-page-left": `${pageLeft}%`,
          "--return-current-page-scale": pageScale,
          "--return-current-page-opacity": pageOpacity,
          "--return-outpost-opacity": outpostOpacity,
          "--return-book-opacity": bookOpacity,
          "--return-source-opacity": sourceOpacity,
          "--return-ask-scale": 0.92 + askRevealProgress * 0.08,
        } as CSSProperties
      }
    >
      <section
        className="chapter-beat concept-beat context-return-loop-beat return-story-beat"
        data-testid="context-return-loop"
        data-story-beat="05-context-return"
      >
        <PageNarrationAnchor segmentId="05-context-return" />
        <div
          className="return-story-shell"
          data-scene={activeScene}
          data-sources-open={sourceVisible ? "" : undefined}
        >
          <header className="return-story-header">
            <div>
              <span>Chapter 05 · Return · 02:05–02:27</span>
              <h2>From every action and expression to new Context.</h2>
            </div>
            <div className="return-scene-status" aria-live="polite">
              <span>{CONTEXT_RETURN_SCENES[sceneIndex].time}</span>
              <strong>{CONTEXT_RETURN_SCENES[sceneIndex].label}</strong>
            </div>
          </header>

          <ol
            className="return-scene-track"
            aria-label="Context return story scenes"
          >
            {CONTEXT_RETURN_SCENES.map((scene, index) => (
              <li
                key={scene.id}
                className={
                  index === sceneIndex
                    ? "is-active"
                    : index < sceneIndex
                      ? "is-complete"
                      : ""
                }
              >
                <button
                  type="button"
                  aria-pressed={index === sceneIndex}
                  aria-controls="context-return-narrative"
                  aria-label={`Show step ${scene.number}: ${scene.label}`}
                  onClick={() => showScene(index)}
                >
                  <b>{scene.number}</b>
                  <span>{scene.label}</span>
                  <time>{scene.time}</time>
                </button>
              </li>
            ))}
          </ol>

          <div className="return-narrative-frame">
            <nav
              className="return-stage-navigation"
              aria-label="Context Return step navigation"
            >
              <button
                type="button"
                className="return-scene-arrow return-scene-arrow--previous"
                data-testid="context-return-previous"
                aria-label={
                  sceneIndex > 0
                    ? `Show previous step: ${CONTEXT_RETURN_SCENES[sceneIndex - 1].label}`
                    : "Previous step"
                }
                aria-controls="context-return-narrative"
                disabled={sceneIndex === 0}
                onClick={() => showScene(sceneIndex - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="return-scene-arrow return-scene-arrow--next"
                data-testid="context-return-next"
                aria-label={
                  sceneIndex < CONTEXT_RETURN_SCENES.length - 1
                    ? `Show next step: ${CONTEXT_RETURN_SCENES[sceneIndex + 1].label}`
                    : "Next step"
                }
                aria-controls="context-return-narrative"
                disabled={sceneIndex === CONTEXT_RETURN_SCENES.length - 1}
                onClick={() => showScene(sceneIndex + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </nav>

            <div
              id="context-return-narrative"
              className="return-narrative-stage"
            >
              <div className="return-stage-grid" aria-hidden="true" />
              <div className="return-stage-glow" aria-hidden="true" />

              <aside
                className="return-platform-outposts"
                aria-label="Platform posts stay outside The Book"
              >
                <span>Public expressions · outside The Book</span>
                <article>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/demo/icons/social/x.svg"
                    alt=""
                  />
                  <div>
                    <strong>X post</strong>
                    <small>Text + source link</small>
                  </div>
                </article>
                <article>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/demo/icons/social/linkedin.svg"
                    alt=""
                  />
                  <div>
                    <strong>LinkedIn</strong>
                    <small>Visual carousel</small>
                  </div>
                </article>
                <small>Posts travel. The complete Page compounds.</small>
              </aside>

              <section
                className="return-book-sequence"
                aria-label="Pages connecting along The Book spine"
              >
                <header className="return-book-sequence-title">
                  <BookOpen aria-hidden="true" />
                  <div>
                    <span>The Book</span>
                    <strong>Apollo 11</strong>
                    <small>42 Context · 5 Pages</small>
                  </div>
                </header>
                <figure
                  className="return-entry-book-visual"
                  aria-hidden={activeScene !== "page-enter"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/demo/media/chapter-05-return-book-light.png"
                    alt="An open Memova Book ready to receive the generated Apollo 11 Page"
                  />
                </figure>
                <div className="return-entry-relationship" aria-hidden="true">
                  <i />
                  <span>Returns as context</span>
                </div>
                <figure
                  className="return-book-assembly-visual"
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/demo/media/chapter-05-return-book-light.png"
                    alt=""
                  />
                </figure>
                <i className="return-shared-spine" aria-hidden="true" />

                <div className="return-book-page-stack">
                  {pageCards.map((page, index) => {
                    const Icon = page.icon;
                    const reveal = progressRange(
                      pagesProgress,
                      index * 0.15,
                      Math.min(1, index * 0.15 + 0.24)
                    );
                    const opacity =
                      reveal * (1 - provenanceProgress * 0.88) * bookOpacity;
                    return (
                      <article
                        key={page.id}
                        className={`return-book-page return-book-page--${page.id}`}
                        style={
                          {
                            "--return-page-card-opacity": opacity,
                            "--return-page-card-lift": `${(1 - reveal) * 26}px`,
                          } as CSSProperties
                        }
                      >
                        <header>
                          <Icon aria-hidden="true" />
                          <span>{page.label}</span>
                        </header>
                        {"asset" in page ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            loading="lazy"
                            decoding="async"
                            src={page.asset}
                            alt={page.alt}
                          />
                        ) : (
                          <p>{page.copy}</p>
                        )}
                      </article>
                    );
                  })}
                </div>

                <article
                  className="return-current-page"
                  aria-label="Current generated Page"
                >
                  <div className="return-current-page-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/demo/media/chapter-05-return-current-page-aldrin-visor.jpg"
                      alt="Buzz Aldrin photographed on the lunar surface for the generated Apollo 11 Page"
                    />
                  </div>
                  <div className="return-current-page-copy">
                    <span>Page 05 · Generated HTML</span>
                    <strong>After the Giant Leap</strong>
                    <p>
                      The landing changed when evidence, constraint, and
                      judgment met.
                    </p>
                    <button
                      type="button"
                      aria-expanded={sourceVisible}
                      aria-controls="return-source-cluster"
                      onClick={() => setProvenanceOpen(current => !current)}
                    >
                      How this Page was made <ArrowUpRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </section>

              <section
                id="return-source-cluster"
                className="return-source-cluster"
                aria-label="Created from"
                aria-hidden={!sourceVisible}
              >
                <span>Created from:</span>
                <div>
                  {RETURN_SOURCE_CONTEXT.map(source => {
                    const Icon = source.icon;
                    return (
                      <article key={source.id}>
                        <Icon aria-hidden="true" />
                        <strong>{source.label}</strong>
                        <small>{source.detail}</small>
                      </article>
                    );
                  })}
                </div>
                <div className="return-context-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </section>

              <section
                className="return-ask-match-cut"
                aria-label="Match cut into Ask Memova"
              >
                <AskMemovaSurface />
                <span>Match cut · Real UI</span>
              </section>
            </div>
          </div>

          <footer className="return-story-footer">
            <div aria-live="polite" key={activeScene}>
              <span>0{sceneIndex + 1} / 04</span>
              <strong>{screenCopy}</strong>
              <p>{screenDetail}</p>
            </div>
            <div className="return-story-progress" aria-hidden="true">
              <i
                style={{
                  width: `${(sceneIndex / (CONTEXT_RETURN_SCENES.length - 1)) * 100}%`,
                }}
              />
              {CONTEXT_RETURN_SCENES.map(scene => (
                <b key={scene.id} />
              ))}
            </div>
          </footer>
        </div>
      </section>
    </section>
  );
}

function AlignmentChapter({ footer }: { footer: ReactNode }) {
  return (
    <article className="scripted-chapter" data-content-slot="alignment">
      <ContextReturnLoop />

      <ConceptBeat
        label="Chapter 05 · Return · Real UI"
        time="02:27–02:52"
        className="recording-beat alignment-recording-beat alignment-match-cut-beat chapter-ending-recording-beat"
        testId="ask-memova-recording"
        beatId="05-ask-memova"
        narrationId="05-ask-memova"
      >
        <RecordingPlayer
          title="Ask Memova & Why This"
          label="Ask Memova and Why this recording"
          src="/demo/recordings/chapter-05-ask-memova-why-this.mp4"
          poster="/demo/posters/chapter-05-ask-memova-why-this.png"
          durationLabel="32s Ask Memova walkthrough"
          timelineCues={ASK_MEMOVA_WHY_THIS_CUES}
          timelineWindowSize={3}
          preserveSidecar
        />
        {footer}
      </ConceptBeat>
    </article>
  );
}

function PageMiniature({
  page,
  isCurrent = false,
}: {
  page: (typeof BOOK_PAGES)[number];
  isCurrent?: boolean;
}) {
  return (
    <article className={`page-miniature${isCurrent ? " is-current" : ""}`}>
      <div className="page-miniature-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={page.image} alt="" />
      </div>
      <div className="page-miniature-copy">
        <span>{page.type}</span>
        <strong>{page.title}</strong>
        <small>Source-linked HTML Page</small>
      </div>
    </article>
  );
}

function GrowingBook({ updated = false }: { updated?: boolean }) {
  return (
    <div
      className={`growing-book${updated ? " is-updated" : ""}`}
      aria-label="Pages connected into a growing Book"
    >
      <div className="book-title">
        <span>The Book</span>
        <strong>Apollo 11 Archive</strong>
        <small>
          {updated ? "4 Pages · Context updated" : "4 connected Pages"}
        </small>
      </div>
      <div className="book-spine-line" aria-hidden="true" />
      <div className="book-pages">
        {BOOK_PAGES.map((page, index) => (
          <PageMiniature
            key={page.id}
            page={page}
            isCurrent={updated ? index === 0 : index === 1}
          />
        ))}
      </div>
    </div>
  );
}

function EndChapter({ footer }: { footer: ReactNode }) {
  return (
    <article className="scripted-chapter" data-content-slot="end">
      <ConceptBeat
        label="Chapter 06 · Compound"
        time="02:52–03:00"
        className="end-beat"
        testId="final-frame"
        beatId="06-end"
        narrationId="06-end"
      >
        <div className="final-frame-layout">
          <div className="final-book-network">
            <GrowingBook updated />
            <div className="final-context-orbits" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="final-copy">
            <h2>From Context to a growing knowledge world.</h2>
            <p>Alignment, for the rest of the world.</p>
          </div>
        </div>
        {footer}
      </ConceptBeat>
    </article>
  );
}

function EmptyChapter({
  page,
  footer,
}: {
  page: (typeof PAGES)[number];
  footer: ReactNode;
}) {
  return (
    <section className="chapter-beat empty-chapter">
      <div className="beat-meta">
        <p>{page.chapter}</p>
        <time>{page.time}</time>
      </div>
      <h2>{page.title}</h2>
      <div
        className={`content-canvas${page.recording ? " content-canvas--recording" : ""}`}
        data-content-slot={page.id}
        aria-label={`${page.title} content area`}
      >
        {page.recording ? (
          <RecordingPlayer label={`${page.title} product recording`} />
        ) : null}
      </div>
      {footer}
    </section>
  );
}

export default function ContinuousDemoStory() {
  const narrationRef = useRef<HTMLAudioElement>(null);
  const activeNarrationIdRef = useRef<NarrationSegment["id"] | null>(null);
  const narrationStateRef = useRef<NarrationPlaybackState>("idle");
  const narrationRequestEpochRef = useRef(0);
  const narrationPlayIntentRef = useRef(false);
  const [activeNarrationId, setActiveNarrationId] = useState<
    NarrationSegment["id"] | null
  >(null);
  const [narrationState, setNarrationState] =
    useState<NarrationPlaybackState>("idle");
  const [narrationTime, setNarrationTime] = useState(0);
  const [narrationDuration, setNarrationDuration] = useState(0);

  const commitNarrationState = useCallback((state: NarrationPlaybackState) => {
    narrationStateRef.current = state;
    setNarrationState(state);
  }, []);

  const scrollToNote = () => {
    document
      .querySelector<HTMLElement>('[data-story-chapter="note"]')
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pauseNarration = useCallback(
    (segmentId?: NarrationSegment["id"]) => {
      if (segmentId && activeNarrationIdRef.current !== segmentId) {
        return;
      }

      narrationRequestEpochRef.current += 1;
      narrationPlayIntentRef.current = false;
      const audio = narrationRef.current;
      audio?.pause();

      if (activeNarrationIdRef.current) {
        commitNarrationState(
          audio && audio.currentTime > 0 ? "paused" : "idle"
        );
      }
    },
    [commitNarrationState]
  );

  const resetNarration = useCallback(
    (segmentId: NarrationSegment["id"]) => {
      if (activeNarrationIdRef.current !== segmentId) return;

      narrationRequestEpochRef.current += 1;
      narrationPlayIntentRef.current = false;
      const audio = narrationRef.current;
      audio?.pause();
      if (audio) {
        try {
          audio.currentTime = 0;
        } catch {
          // A source can be reset before metadata is available.
        }
      }

      activeNarrationIdRef.current = null;
      setActiveNarrationId(null);
      setNarrationTime(0);
      setNarrationDuration(0);
      commitNarrationState("idle");
    },
    [commitNarrationState]
  );

  const toggleNarration = useCallback(
    async (segment: NarrationSegment) => {
      const audio = narrationRef.current;
      if (!audio) return;

      const sameSegment = activeNarrationIdRef.current === segment.id;
      const cancelPendingOrPlaying =
        sameSegment && narrationPlayIntentRef.current;
      const requestEpoch = narrationRequestEpochRef.current + 1;
      narrationRequestEpochRef.current = requestEpoch;

      // Every request starts by stopping the previous media operation.
      audio.pause();
      narrationPlayIntentRef.current = false;

      if (cancelPendingOrPlaying) {
        commitNarrationState(audio.currentTime > 0 ? "paused" : "idle");
        return;
      }

      if (!sameSegment) {
        audio.dataset.narrationId = segment.id;
        audio.src = segment.src;
        try {
          audio.currentTime = 0;
        } catch {
          // The new source may not have metadata yet.
        }
        activeNarrationIdRef.current = segment.id;
        setActiveNarrationId(segment.id);
        setNarrationTime(0);
        setNarrationDuration(segment.duration);
      } else if (
        audio.ended ||
        narrationStateRef.current === "complete" ||
        narrationStateRef.current === "error"
      ) {
        audio.currentTime = 0;
        setNarrationTime(0);
      }

      narrationPlayIntentRef.current = true;
      commitNarrationState("loading");

      await settleNarrationPlayback({
        media: audio,
        isCurrent: () =>
          narrationRequestEpochRef.current === requestEpoch &&
          narrationPlayIntentRef.current &&
          activeNarrationIdRef.current === segment.id,
        onCancelled: () => {
          if (
            activeNarrationIdRef.current === segment.id &&
            !narrationPlayIntentRef.current
          ) {
            audio.pause();
          }
        },
        onPlaying: () => commitNarrationState("playing"),
        onFailure: () => {
          narrationPlayIntentRef.current = false;
          commitNarrationState("error");
        },
      });
    },
    [commitNarrationState]
  );

  useEffect(() => {
    if (!activeNarrationId) return;

    const activeBeat = document.querySelector<HTMLElement>(
      `[data-story-beat="${activeNarrationId}"]`
    );
    const audio = narrationRef.current;
    if (!activeBeat || !audio) {
      pauseNarration(activeNarrationId);
      return;
    }

    const pauseIfBeatLeft = () => {
      const beatBounds = activeBeat.getBoundingClientRect();
      const beatIsCurrent = isNarrationBeatCurrent(
        beatBounds,
        window.innerHeight
      );

      if (!beatIsCurrent && (!audio.paused || narrationPlayIntentRef.current)) {
        pauseNarration(activeNarrationId);
      }
    };
    let animationFrame = 0;
    const scheduleVisibilityCheck = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        pauseIfBeatLeft();
      });
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(() => scheduleVisibilityCheck(), {
            rootMargin: "-20% 0px -20% 0px",
            threshold: 0,
          });

    observer?.observe(activeBeat);
    window.addEventListener("scroll", scheduleVisibilityCheck, {
      passive: true,
    });
    window.addEventListener("resize", scheduleVisibilityCheck);
    scheduleVisibilityCheck();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [activeNarrationId, pauseNarration]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) pauseNarration();
    };
    const pauseOnPageHide = () => pauseNarration();

    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("pagehide", pauseOnPageHide);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("pagehide", pauseOnPageHide);
      narrationRequestEpochRef.current += 1;
      narrationPlayIntentRef.current = false;
      narrationRef.current?.pause();
    };
  }, [pauseNarration]);

  const narrationContextValue = useMemo<NarrationContextValue>(
    () => ({
      activeId: activeNarrationId,
      playbackState: narrationState,
      playbackTime: narrationTime,
      duration: narrationDuration,
      toggleNarration,
      resetNarration,
    }),
    [
      activeNarrationId,
      narrationDuration,
      narrationState,
      narrationTime,
      resetNarration,
      toggleNarration,
    ]
  );

  return (
    <section
      id="product-tour"
      className="framework-shell framework-shell--continuous demo-story-shell"
      aria-labelledby="product-tour-heading"
    >
      <header className="demo-story-intro">
        <span>THE MEMOVA LOOP</span>
        <h2 id="product-tour-heading">
          See how everyday context becomes reusable knowledge.
        </h2>
        <p>
          Follow one continuous product story—from capture and understanding to
          action, expression, and a context layer that keeps compounding.
        </p>
        <div
          className="demo-story-intro-path"
          aria-label="Product story chapters"
        >
          {PAGES.map(page => (
            <span key={page.id}>
              <b>{page.number}</b>
              {page.navTitle}
            </span>
          ))}
        </div>
      </header>

      <audio
        ref={narrationRef}
        preload="none"
        onLoadedMetadata={event => {
          if (
            event.currentTarget.dataset.narrationId !==
            activeNarrationIdRef.current
          ) {
            return;
          }
          setNarrationDuration(event.currentTarget.duration);
          setNarrationTime(event.currentTarget.currentTime);
        }}
        onTimeUpdate={event => {
          if (
            event.currentTarget.dataset.narrationId !==
            activeNarrationIdRef.current
          ) {
            return;
          }
          setNarrationTime(event.currentTarget.currentTime);
        }}
        onPlay={event => {
          if (
            event.currentTarget.dataset.narrationId !==
              activeNarrationIdRef.current ||
            !narrationPlayIntentRef.current
          ) {
            event.currentTarget.pause();
            return;
          }
          commitNarrationState("playing");
        }}
        onPause={event => {
          if (
            event.currentTarget.dataset.narrationId !==
              activeNarrationIdRef.current ||
            event.currentTarget.ended
          ) {
            return;
          }

          if (
            narrationPlayIntentRef.current &&
            narrationStateRef.current === "loading"
          ) {
            return;
          }

          if (!event.currentTarget.paused) return;

          narrationRequestEpochRef.current += 1;
          narrationPlayIntentRef.current = false;
          if (event.currentTarget.currentTime > 0) {
            commitNarrationState("paused");
          } else {
            commitNarrationState("idle");
          }
        }}
        onEnded={event => {
          if (
            event.currentTarget.dataset.narrationId !==
            activeNarrationIdRef.current
          ) {
            return;
          }
          narrationRequestEpochRef.current += 1;
          narrationPlayIntentRef.current = false;
          setNarrationTime(event.currentTarget.duration);
          commitNarrationState("complete");
        }}
        onError={event => {
          if (
            event.currentTarget.dataset.narrationId !==
              activeNarrationIdRef.current ||
            (!narrationPlayIntentRef.current &&
              narrationStateRef.current !== "loading")
          ) {
            return;
          }
          narrationRequestEpochRef.current += 1;
          narrationPlayIntentRef.current = false;
          commitNarrationState("error");
        }}
      />
      <span className="sr-only" aria-live="polite">
        {activeNarrationId
          ? `${NARRATION_SEGMENTS.find(segment => segment.id === activeNarrationId)?.title} narration ${narrationState}`
          : "Chapter narration ready"}
      </span>

      <NarrationContext.Provider value={narrationContextValue}>
        <div className="book-layout">
          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="knowledge-base"
            aria-label="Chapter 01, Knowledge Base"
          >
            <KnowledgeBaseChapter footer={null} onOpenCase={scrollToNote} />
          </section>

          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="note"
            aria-label="Chapter 02, Note"
          >
            <NoteChapter footer={null} />
          </section>

          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="book"
            aria-label="Chapter 03, Book"
          >
            <BookChapter footer={null} />
          </section>

          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="output-share"
            aria-label="Chapter 04, Output and Share"
          >
            <OutputShareChapter footer={null} />
          </section>

          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="alignment"
            aria-label="Chapter 05, Context Return"
          >
            <AlignmentChapter footer={null} />
          </section>

          <section
            className="chapter-scroll demo-story-chapter"
            data-continuous-scroll="true"
            data-story-chapter="end"
            aria-label="Chapter 06, Compound"
          >
            <EndChapter footer={null} />
          </section>
        </div>
      </NarrationContext.Provider>
    </section>
  );
}
