import { useEffect, useRef } from "react";

type LivingBookPageId = "source" | "thinking" | "decision" | "output";

export const livingBookLayouts = {
  desktop: {
    pageWidth: 0.62,
    final: { source: 0.02, thinking: 0.11, decision: 0.2, output: 0.34 },
    sourceStart: 0.19,
    thinkingStart: 0.52,
    thinkingVisible: 0.38,
    thinkingArchive: 0.19,
    decisionStart: 0.58,
    decisionVisible: 0.38,
    outputStart: 0.62,
  },
  compact: {
    pageWidth: 0.78,
    final: { source: 0.02, thinking: 0.08, decision: 0.14, output: 0.2 },
    sourceStart: 0.11,
    thinkingStart: 0.36,
    thinkingVisible: 0.22,
    thinkingArchive: 0.15,
    decisionStart: 0.45,
    decisionVisible: 0.2,
    outputStart: 0.5,
  },
} as const;

const livingBookPages = [
  {
    id: "source",
    number: "01",
    meta: "SOURCE · AUG 04",
    title: "Customer interview #12",
    body: "“I understand the problem, but not the workflow.”",
    footer: "Meeting transcript · 32:14",
    art: {
      src: "/demo/media/living-book/living-book-source-editorial-v1-480.webp",
      srcSet:
        "/demo/media/living-book/living-book-source-editorial-v1-480.webp 480w, /demo/media/living-book/living-book-source-editorial-v1-960.webp 960w",
    },
  },
  {
    id: "thinking",
    number: "02",
    meta: "THINKING · AUG 05",
    title: "What this changes",
    body: "The value is clear. The path to it still asks for too much explanation.",
    footer: "Linked to 4 conversations",
    art: {
      src: "/demo/media/living-book/living-book-thinking-editorial-v1-480.webp",
      srcSet:
        "/demo/media/living-book/living-book-thinking-editorial-v1-480.webp 480w, /demo/media/living-book/living-book-thinking-editorial-v1-960.webp 960w",
    },
  },
  {
    id: "decision",
    number: "03",
    meta: "DECISION · AUG 06",
    title: "Simplify onboarding.",
    body: "Lead with one clear outcome. Move the rest behind the first successful Book.",
    footer: "Decision recorded",
    art: {
      src: "/demo/media/living-book/living-book-decision-editorial-v1-480.webp",
      srcSet:
        "/demo/media/living-book/living-book-decision-editorial-v1-480.webp 480w, /demo/media/living-book/living-book-decision-editorial-v1-960.webp 960w",
    },
  },
] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const smoothstep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

const rangeProgress = (progress: number, start: number, span: number) =>
  smoothstep((progress - start) / span);

export function getLivingBookScrollProgress(
  sceneTop: number,
  sceneHeight: number,
  viewportHeight: number
) {
  const scrollDistance = Math.max(sceneHeight - viewportHeight, 1);
  return clamp(-sceneTop / scrollDistance);
}

function setPageTransform(
  page: HTMLElement,
  canvasWidth: number,
  x: number,
  scale: number,
  opacity: number
) {
  page.style.transform = `translate3d(${(canvasWidth * x).toFixed(2)}px, 0, 0) scale(${scale.toFixed(4)})`;
  page.style.opacity = opacity.toFixed(4);
}

export default function LivingBookContextStory() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;

    if (!scene || !canvas) return;

    const pageNodes = new Map<
      LivingBookPageId,
      {
        page: HTMLElement;
        body: HTMLElement | null;
        index: HTMLElement | null;
      }
    >();
    canvas
      .querySelectorAll<HTMLElement>("[data-living-book-page]")
      .forEach(page => {
        const id = page.dataset.livingBookPage as LivingBookPageId;
        pageNodes.set(id, {
          page,
          body: page.querySelector<HTMLElement>("[data-living-page-body]"),
          index: page.querySelector<HTMLElement>("[data-living-page-index]"),
        });
      });

    const connectorNodes = Array.from(
      canvas.querySelectorAll<HTMLElement>("[data-living-book-connector]")
    );
    const outputRevealNodes = Array.from(
      canvas.querySelectorAll<HTMLElement>("[data-output-reveal]")
    );
    const statusNode = canvas.querySelector<HTMLElement>(
      "[data-living-book-status]"
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let reducedMotion = reducedMotionQuery.matches;
    let active = true;
    let geometryDirty = true;
    let frame = 0;
    let lastProgress = -1;
    let scrollListening = false;
    let lastCompact: boolean | null = null;
    let lastPhase = "";

    const render = (rawProgress: number, force = false) => {
      const progress = Math.round(clamp(rawProgress) * 10000) / 10000;
      if (!force && !geometryDirty && progress === lastProgress) return;

      const canvasWidth = canvas.clientWidth;
      const compact = canvasWidth < 640;
      const layout = compact
        ? livingBookLayouts.compact
        : livingBookLayouts.desktop;
      if (compact !== lastCompact) {
        canvas.style.setProperty(
          "--living-book-page-width",
          `${layout.pageWidth * 100}%`
        );
        lastCompact = compact;
      }
      const sourceToThinking = rangeProgress(progress, 0.14, 0.2);
      const thinkingToDecision = rangeProgress(progress, 0.36, 0.2);
      const decisionToOutput = rangeProgress(progress, 0.58, 0.2);
      const decisionArchive = rangeProgress(progress, 0.36, 0.14);
      const outputArchive = rangeProgress(progress, 0.58, 0.16);

      const finalPositions = layout.final;
      const sourceStart = layout.sourceStart;
      const thinkingStart = layout.thinkingStart;
      const decisionStart = layout.decisionStart;
      const outputStart = layout.outputStart;

      const sourceX = lerp(
        sourceStart,
        finalPositions.source,
        sourceToThinking
      );
      const thinkingFirstX = lerp(
        thinkingStart,
        layout.thinkingVisible,
        sourceToThinking
      );
      const thinkingSecondX = lerp(
        thinkingFirstX,
        layout.thinkingArchive,
        thinkingToDecision
      );
      const thinkingX = lerp(
        thinkingSecondX,
        finalPositions.thinking,
        decisionToOutput
      );
      const decisionFirstX = lerp(
        decisionStart,
        layout.decisionVisible,
        thinkingToDecision
      );
      const decisionX = lerp(
        decisionFirstX,
        finalPositions.decision,
        decisionToOutput
      );
      const outputX = lerp(
        outputStart,
        finalPositions.output,
        decisionToOutput
      );

      const sourceRefs = pageNodes.get("source");
      const thinkingRefs = pageNodes.get("thinking");
      const decisionRefs = pageNodes.get("decision");
      const outputRefs = pageNodes.get("output");

      if (sourceRefs) {
        setPageTransform(
          sourceRefs.page,
          canvasWidth,
          sourceX,
          lerp(1, compact ? 0.97 : 0.94, decisionToOutput),
          1
        );
        const { body, index } = sourceRefs;
        if (body) {
          const firstFade = lerp(1, 0.38, sourceToThinking);
          body.style.opacity = lerp(firstFade, 0.12, decisionArchive).toFixed(
            4
          );
        }
        if (index) index.style.opacity = decisionArchive.toFixed(4);
      }

      if (thinkingRefs) {
        setPageTransform(
          thinkingRefs.page,
          canvasWidth,
          thinkingX,
          lerp(1, compact ? 0.98 : 0.96, decisionToOutput),
          sourceToThinking
        );
        const { body, index } = thinkingRefs;
        if (body)
          body.style.opacity = lerp(1, 0.14, decisionArchive).toFixed(4);
        if (index) index.style.opacity = decisionArchive.toFixed(4);
      }

      if (decisionRefs) {
        setPageTransform(
          decisionRefs.page,
          canvasWidth,
          decisionX,
          lerp(1, compact ? 0.99 : 0.98, decisionToOutput),
          thinkingToDecision
        );
        const { body, index } = decisionRefs;
        if (body) body.style.opacity = lerp(1, 0.18, outputArchive).toFixed(4);
        if (index) index.style.opacity = outputArchive.toFixed(4);
      }

      if (outputRefs) {
        setPageTransform(
          outputRefs.page,
          canvasWidth,
          outputX,
          1,
          decisionToOutput
        );
      }

      outputRevealNodes.forEach(node => {
        const start = Number(node.dataset.outputReveal ?? 0.74);
        const span = Number(node.dataset.outputRevealSpan ?? 0.12);
        const localProgress = rangeProgress(progress, start, span);
        node.style.opacity = localProgress.toFixed(4);
        node.style.transform = `translate3d(0, ${(1 - localProgress) * 10}px, 0)`;
      });

      connectorNodes.forEach((connector, index) => {
        const localProgress = rangeProgress(
          progress,
          0.6 + index * 0.035,
          0.16
        );
        connector.style.opacity = (localProgress * 0.82).toFixed(4);
        connector.style.transform = `scaleX(${localProgress.toFixed(4)})`;
      });

      if (statusNode) {
        const statusProgress = rangeProgress(progress, 0.8, 0.06);
        statusNode.style.opacity = statusProgress.toFixed(4);
        statusNode.style.transform = `translate3d(-50%, ${(1 - statusProgress) * 8}px, 0)`;
      }

      scene.style.setProperty("--living-book-progress", progress.toString());
      const phase =
        progress < 0.14
          ? "source"
          : progress < 0.36
            ? "thinking"
            : progress < 0.58
              ? "decision"
              : progress < 0.86
                ? "output"
                : "complete";
      if (phase !== lastPhase) {
        scene.dataset.livingBookPhase = phase;
        lastPhase = phase;
      }
      lastProgress = progress;
      geometryDirty = false;
    };

    const isShortLandscape = () =>
      window.innerHeight <= 499 && window.innerWidth > window.innerHeight;

    const renderFromScroll = (force = false) => {
      const rect = scene.getBoundingClientRect();
      const progress =
        reducedMotion || isShortLandscape()
          ? 1
          : getLivingBookScrollProgress(
              rect.top,
              rect.height,
              window.innerHeight
            );
      render(progress, force);
    };

    const scheduleRender = (force = false) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (active || force || reducedMotion) renderFromScroll(force);
      });
    };

    const onScroll = () => {
      if (!active || reducedMotion || isShortLandscape()) return;
      scheduleRender();
    };
    const syncScrollListener = () => {
      const staticLayout = reducedMotion || isShortLandscape();
      if (!staticLayout && !scrollListening) {
        window.addEventListener("scroll", onScroll, { passive: true });
        scrollListening = true;
      } else if (staticLayout && scrollListening) {
        window.removeEventListener("scroll", onScroll);
        scrollListening = false;
      }
    };
    const onResize = () => {
      geometryDirty = true;
      syncScrollListener();
      scheduleRender(true);
    };
    const onMotionPreferenceChange = (
      event: MediaQueryListEvent | MediaQueryList
    ) => {
      reducedMotion = event.matches;
      geometryDirty = true;
      syncScrollListener();
      scheduleRender(true);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) {
          scheduleRender(true);
        } else {
          const rect = scene.getBoundingClientRect();
          render(rect.bottom <= 0 ? 1 : 0, true);
        }
      },
      { rootMargin: "20% 0px 20% 0px", threshold: 0 }
    );
    const resizeObserver = new ResizeObserver(() => onResize());

    intersectionObserver.observe(scene);
    resizeObserver.observe(canvas);
    syncScrollListener();
    window.addEventListener("resize", onResize, { passive: true });
    reducedMotionQuery.addEventListener("change", onMotionPreferenceChange);
    renderFromScroll(true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      if (scrollListening) window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      reducedMotionQuery.removeEventListener(
        "change",
        onMotionPreferenceChange
      );
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="home-v2-living-book-archive"
      data-living-book-archive
      data-living-book-phase="source"
    >
      <div className="home-v2-living-book-sticky">
        <div
          ref={canvasRef}
          className="home-v2-living-book-canvas"
          aria-label="A Living Book keeps sources, thinking, decisions, and new outputs connected"
        >
          <header className="home-v2-living-book-meta" aria-hidden="true">
            <span>AI Product Launch Book</span>
            <strong>One evolving context</strong>
          </header>

          <ol className="home-v2-living-book-pages">
            {livingBookPages.map(page => (
              <li
                className={`home-v2-living-book-page home-v2-living-book-page-${page.id}`}
                data-living-book-page={page.id}
                key={page.id}
              >
                <span
                  className="home-v2-living-book-page-index"
                  data-living-page-index
                  aria-hidden="true"
                >
                  {page.meta.split(" · ")[0]}
                </span>
                <div
                  className="home-v2-living-book-page-body"
                  data-living-page-body
                >
                  <header>
                    <span>{page.meta}</span>
                    <strong>{page.number}</strong>
                  </header>
                  <div
                    className="home-v2-living-book-page-main"
                    data-living-book-visual-panel={page.id}
                  >
                    <figure
                      className={`home-v2-living-book-page-art home-v2-living-book-page-art-${page.id}`}
                      data-living-book-art={page.id}
                    >
                      <img
                        src={page.art.src}
                        srcSet={page.art.srcSet}
                        sizes="(min-width: 900px) 24vw, (min-width: 640px) 31vw, 68vw"
                        alt=""
                        width="960"
                        height="640"
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                    <div className="home-v2-living-book-page-copy">
                      <h3>{page.title}</h3>
                      <p>{page.body}</p>
                    </div>
                  </div>
                  <footer>{page.footer}</footer>
                </div>
              </li>
            ))}

            <li
              className="home-v2-living-book-page home-v2-living-book-page-output"
              data-living-book-page="output"
            >
              <div className="home-v2-living-book-page-body home-v2-living-book-output-body">
                <header>
                  <span>MEMOVA PAGE · AUG 10</span>
                  <strong>04</strong>
                </header>
                <div
                  className="home-v2-living-book-output-main"
                  data-living-book-visual-panel="output"
                >
                  <figure
                    className="home-v2-living-book-page-art home-v2-living-book-page-art-output"
                    data-living-book-art="output"
                    data-output-reveal="0.66"
                    data-output-reveal-span="0.12"
                  >
                    <img
                      src="/demo/media/living-book/living-book-output-editorial-v1-480.webp"
                      srcSet="/demo/media/living-book/living-book-output-editorial-v1-480.webp 480w, /demo/media/living-book/living-book-output-editorial-v1-960.webp 960w"
                      sizes="(min-width: 900px) 24vw, (min-width: 640px) 31vw, 68vw"
                      alt=""
                      width="960"
                      height="640"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <div className="home-v2-living-book-output-copy">
                    <div
                      className="home-v2-living-book-output-title"
                      data-output-reveal="0.7"
                      data-output-reveal-span="0.1"
                    >
                      <small>PUBLIC-FACING PAGE</small>
                      <h3>Building in Public: AI Product Launch</h3>
                    </div>
                    <div
                      className="home-v2-living-book-output-summary"
                      data-output-reveal="0.74"
                      data-output-reveal-span="0.1"
                    >
                      <span>SUMMARY</span>
                      <p>
                        Customer conversations, product decisions, and founder
                        notes became a launch story ready to review.
                      </p>
                    </div>
                    <div
                      className="home-v2-living-book-output-statuses"
                      data-output-reveal="0.77"
                      data-output-reveal-span="0.09"
                    >
                      <span>31 sources connected</span>
                      <span>Review required</span>
                    </div>
                  </div>
                </div>
                <footer
                  data-output-reveal="0.79"
                  data-output-reveal-span="0.07"
                >
                  Built from the context already inside this Book
                </footer>
              </div>
            </li>
          </ol>

          <div className="home-v2-living-book-connectors" aria-hidden="true">
            <span data-living-book-connector="source" />
            <span data-living-book-connector="thinking" />
            <span data-living-book-connector="decision" />
          </div>

          <div className="home-v2-living-book-progress" aria-hidden="true">
            <span>Source</span>
            <span>Thinking</span>
            <span>Decision</span>
            <span>New Page</span>
          </div>

          <p className="home-v2-living-book-status" data-living-book-status>
            The new Page still knows why each decision was made.
          </p>
        </div>
      </div>
    </div>
  );
}
