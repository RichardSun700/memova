import { useEffect, useRef } from "react";

import "@/styles/action-ecosystem-band.css";

type ActionConnectorStatus = "connected" | "planned";

type ActionConnector = {
  id: string;
  name: string;
  src: string;
  status: ActionConnectorStatus;
};

const ACTION_CONNECTOR_COPIES = 5;
const ACTION_CONNECTOR_SPEED = 30;
const ACTION_CONNECTOR_MIN_SCALE = 0.59;

const actionConnectors: readonly ActionConnector[] = [
  {
    id: "gmail",
    name: "Gmail",
    src: "/demo/icons/actions/gmail.svg",
    status: "planned",
  },
  {
    id: "outlook",
    name: "Outlook",
    src: "/demo/icons/actions/outlook.svg",
    status: "planned",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    src: "/demo/icons/actions/google-calendar.svg",
    status: "planned",
  },
  {
    id: "x",
    name: "X",
    src: "/demo/icons/social/x.svg",
    status: "planned",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    src: "/demo/icons/social/linkedin.svg",
    status: "planned",
  },
  {
    id: "instagram",
    name: "Instagram",
    src: "/demo/icons/social/instagram-color.svg",
    status: "planned",
  },
  {
    id: "tiktok",
    name: "TikTok",
    src: "/demo/icons/social/tiktok-color.svg",
    status: "planned",
  },
  {
    id: "youtube",
    name: "YouTube",
    src: "/demo/icons/social/youtube.svg",
    status: "planned",
  },
  {
    id: "slack",
    name: "Slack",
    src: "/demo/icons/actions/slack.svg",
    status: "planned",
  },
  {
    id: "notion",
    name: "Notion",
    src: "/demo/icons/actions/notion.svg",
    status: "planned",
  },
  {
    id: "github",
    name: "GitHub",
    src: "/demo/icons/actions/github.svg",
    status: "planned",
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    src: "/demo/icons/actions/openai.svg",
    status: "connected",
  },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getActionCardScale(normalizedDistance: number) {
  const distance = clamp(normalizedDistance, 0, 1);
  return (
    ACTION_CONNECTOR_MIN_SCALE +
    (1 - ACTION_CONNECTOR_MIN_SCALE) * Math.cos((distance * Math.PI) / 2)
  );
}

function ActionConnectorMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const shells = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-action-card-shell]")
    );
    const cards = shells.map(shell =>
      shell.querySelector<HTMLElement>("[data-action-card]")
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let animationFrame = 0;
    let cycleWidth = 0;
    let position = 0;
    let previousTime = 0;
    let isVisible = false;
    let isPointerDown = false;
    let isDocumentVisible = !document.hidden;

    const renderGeometry = () => {
      if (!shells.length || cards.some(card => !card)) return;

      if (reducedMotionQuery.matches) {
        cards.forEach(card => {
          if (!card) return;
          card.style.scale = "1";
          card.style.translate = "0 0";
        });
        return;
      }

      const viewportCenter = viewport.clientWidth / 2;
      const distanceBase = Math.max(window.innerWidth / 2, 1);
      const naturalCenters = shells.map(
        shell => shell.offsetLeft + shell.offsetWidth / 2
      );
      const scales = naturalCenters.map(center => {
        const visibleCenter = center - viewport.scrollLeft;
        return getActionCardScale(
          Math.abs(visibleCenter - viewportCenter) / distanceBase
        );
      });

      const desiredCenters = [naturalCenters[0]];
      for (let index = 1; index < naturalCenters.length; index += 1) {
        const previousCard = cards[index - 1];
        const currentCard = cards[index];
        const previousWidth = previousCard?.offsetWidth ?? 0;
        const currentWidth = currentCard?.offsetWidth ?? previousWidth;
        const outerSpacing = Math.max(
          0,
          shells[index].offsetWidth - currentWidth
        );
        const visualDistance =
          (previousWidth * scales[index - 1] + currentWidth * scales[index]) /
            2 +
          outerSpacing;
        desiredCenters.push(desiredCenters[index - 1] + visualDistance);
      }

      const rawTranslations = desiredCenters.map(
        (center, index) => center - naturalCenters[index]
      );
      const centerInTrack = viewport.scrollLeft + viewportCenter;
      let anchorTranslation = rawTranslations[0] ?? 0;

      for (let index = 0; index < naturalCenters.length - 1; index += 1) {
        const left = naturalCenters[index];
        const right = naturalCenters[index + 1];
        if (centerInTrack < left || centerInTrack > right) continue;
        const localProgress = clamp(
          (centerInTrack - left) / Math.max(right - left, Number.EPSILON),
          0,
          1
        );
        anchorTranslation =
          rawTranslations[index] +
          (rawTranslations[index + 1] - rawTranslations[index]) * localProgress;
        break;
      }

      cards.forEach((card, index) => {
        if (!card) return;
        card.style.scale = scales[index].toFixed(4);
        card.style.translate = `${(rawTranslations[index] - anchorTranslation).toFixed(2)}px 0`;
      });
    };

    const normalizePosition = () => {
      if (!cycleWidth) return;
      while (position >= cycleWidth * 3) position -= cycleWidth;
      while (position < cycleWidth) position += cycleWidth;
    };

    const measure = () => {
      const repeatedCard = shells[actionConnectors.length];
      cycleWidth = repeatedCard
        ? repeatedCard.offsetLeft - shells[0].offsetLeft
        : viewport.scrollWidth / ACTION_CONNECTOR_COPIES;
      if (!cycleWidth) return;

      if (!position) {
        position = reducedMotionQuery.matches
          ? cycleWidth * 2 +
            Math.max((cycleWidth - viewport.clientWidth) / 2, 0)
          : cycleWidth * 2;
      }
      normalizePosition();
      viewport.scrollLeft = position;
      renderGeometry();
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const tick = (time: number) => {
      animationFrame = 0;
      if (
        reducedMotionQuery.matches ||
        !isVisible ||
        isPointerDown ||
        !isDocumentVisible
      ) {
        previousTime = 0;
        return;
      }

      if (!previousTime) previousTime = time;
      const elapsed = Math.min(Math.max((time - previousTime) / 1000, 0), 0.1);
      previousTime = time;
      position += ACTION_CONNECTOR_SPEED * elapsed;
      normalizePosition();
      viewport.scrollLeft = position;
      renderGeometry();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (
        animationFrame ||
        reducedMotionQuery.matches ||
        !isVisible ||
        isPointerDown ||
        !isDocumentVisible
      ) {
        return;
      }
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      position = viewport.scrollLeft;
      normalizePosition();
      renderGeometry();
    };

    const handlePointerDown = () => {
      isPointerDown = true;
      stopAnimation();
    };

    const handlePointerUp = () => {
      isPointerDown = false;
      position = viewport.scrollLeft;
      startAnimation();
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) startAnimation();
      else stopAnimation();
    };

    const handleReducedMotionChange = () => {
      stopAnimation();
      position = 0;
      measure();
      startAnimation();
    };

    const intersectionObserver = new IntersectionObserver(
      entries => {
        isVisible = entries.some(entry => entry.isIntersecting);
        if (isVisible) startAnimation();
        else stopAnimation();
      },
      { threshold: 0.1 }
    );
    const resizeObserver = new ResizeObserver(measure);

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    intersectionObserver.observe(viewport);
    resizeObserver.observe(viewport);
    measure();

    return () => {
      stopAnimation();
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="home-v2-action-marquee"
      role="list"
      aria-label="Connected and planned Memova destinations"
      data-action-marquee="true"
    >
      <div className="home-v2-action-marquee-track">
        {Array.from({ length: ACTION_CONNECTOR_COPIES }, (_, copyIndex) =>
          actionConnectors.map(connector => {
            const isPrimaryCopy = copyIndex === 0;
            return (
              <article
                key={`${copyIndex}-${connector.id}`}
                className="home-v2-action-card-shell"
                role={isPrimaryCopy ? "listitem" : undefined}
                aria-hidden={isPrimaryCopy ? undefined : true}
                data-action-card-shell="true"
                data-action-connector={connector.id}
                data-action-connector-primary={
                  isPrimaryCopy ? connector.id : undefined
                }
                data-connector-status={connector.status}
              >
                <div className="home-v2-action-card" data-action-card="true">
                  <img
                    src={connector.src}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  {isPrimaryCopy ? (
                    <span className="sr-only">
                      {connector.name} · {connector.status}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ActionEcosystemBand() {
  return (
    <section
      id="connected-actions"
      className="home-v2-section home-v2-action-ecosystem"
      aria-labelledby="home-v2-action-ecosystem-heading"
    >
      <div className="home-v2-container home-v2-action-ecosystem-copy">
        <div>
          <p className="home-v2-eyebrow">From context to action</p>
          <h2 id="home-v2-action-ecosystem-heading">
            One connection. Many ways to move.
          </h2>
        </div>
        <div className="home-v2-action-ecosystem-detail">
          <p>
            Connect once. When you want to act, turn context you have already
            reviewed into an email draft, a calendar event, or an X- and
            LinkedIn-ready post—without starting over.
          </p>
          <p>
            Memova prepares the action; you approve the final send. The moving
            strip includes current connection paths and planned destinations,
            with availability varying by service and permission.
          </p>
        </div>
      </div>

      <ActionConnectorMarquee />
    </section>
  );
}
