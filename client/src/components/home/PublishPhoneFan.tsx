import { useCallback, useEffect, useRef } from "react";

type PublishPhoneItem = {
  id: string;
  label: string;
  kind: "image" | "video";
  src: string;
  poster?: string;
  width: number;
  height: number;
};

const publishPhoneItems: readonly PublishPhoneItem[] = [
  {
    id: "x",
    label: "X",
    kind: "image",
    src: "/demo/media/publish-phone-fan/x-phone-v2.webp",
    width: 941,
    height: 1672,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    kind: "image",
    src: "/demo/media/publish-phone-fan/linkedin-phone-v2.webp",
    width: 852,
    height: 1846,
  },
  {
    id: "tiktok",
    label: "TikTok",
    kind: "video",
    src: "/demo/media/publish-phone-fan/tiktok-phone-loop-v2.mp4",
    poster: "/demo/media/publish-phone-fan/tiktok-phone-poster-v2.webp",
    width: 540,
    height: 1170,
  },
  {
    id: "snapchat",
    label: "Snapchat",
    kind: "image",
    src: "/demo/media/publish-phone-fan/snapchat-phone-v2.webp",
    width: 864,
    height: 1821,
  },
  {
    id: "youtube",
    label: "YouTube",
    kind: "video",
    src: "/demo/media/publish-phone-fan/youtube-phone-loop-v1.mp4",
    poster: "/demo/media/publish-phone-fan/youtube-phone-poster-v1.webp",
    width: 540,
    height: 960,
  },
] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function getPublishFanScrollProgress(
  sceneTop: number,
  sceneHeight: number,
  viewportHeight: number
) {
  const scrollDistance = Math.max(1, sceneHeight - viewportHeight);

  return clamp(-sceneTop / scrollDistance);
}

const smoothstep = (value: number) => value * value * (3 - 2 * value);

const expandedZIndexes = [2, 4, 8, 5, 3] as const;

export default function PublishPhoneFan() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const phoneRefs = useRef<Array<HTMLElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const lastRenderedProgressRef = useRef(-1);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const syncVideoPlayback = useCallback(() => {
    const shouldPlay =
      visibleRef.current &&
      !reducedMotionRef.current &&
      document.visibilityState !== "hidden";

    videoRefs.current.forEach(video => {
      if (!video) return;
      video.muted = true;
      if (shouldPlay) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, []);

  const renderProgress = useCallback(
    (nextProgress: number, forceGeometryUpdate = false) => {
      const stage = stageRef.current;
      if (!stage) return;

      const progress = clamp(nextProgress);
      if (
        !forceGeometryUpdate &&
        Math.abs(progress - lastRenderedProgressRef.current) < 0.0005
      ) {
        return;
      }

      const { width, height } = stage.getBoundingClientRect();
      const compact = width < 540;
      const referencePhone = phoneRefs.current[2];
      const phoneWidth = referencePhone?.offsetWidth ?? 0;
      const phoneHeight = referencePhone?.offsetHeight ?? 0;
      const outerRotation = compact ? 7 : 11;
      const outerScale = compact ? 0.9 : 0.88;
      const outerRotationRadians = (outerRotation * Math.PI) / 180;
      const outerHalfWidth =
        (phoneWidth * Math.cos(outerRotationRadians) +
          phoneHeight * Math.sin(outerRotationRadians)) *
        outerScale *
        0.5;
      const horizontalSafeArea = compact ? 5 : 10;
      const maximumHorizontalRange = Math.max(
        0,
        width / 2 - outerHalfWidth - horizontalSafeArea
      );
      const horizontalRange = Math.min(
        compact ? width * 0.27 : width * 0.335,
        maximumHorizontalRange
      );
      const xPositions = [
        -horizontalRange,
        -horizontalRange * 0.5,
        0,
        horizontalRange * 0.5,
        horizontalRange,
      ];
      const yPositions = compact
        ? [height * 0.01, height * 0.02, 0, height * 0.02, height * 0.01]
        : [height * 0.005, height * 0.018, 0, height * 0.018, height * 0.005];
      const rotations = compact ? [-7, -3.5, 0, 3.5, 7] : [-11, -5, 0, 5, 11];
      const targetScales = compact
        ? [0.9, 0.95, 1, 0.95, 0.9]
        : [0.88, 0.95, 1, 0.95, 0.88];
      const startX = [-12, -6, 0, 6, 12];
      const startY = [14, 8, 0, 8, 14];
      const startRotation = [-4, -2, 0, 2, 4];
      const labelOpacity = smoothstep(clamp((progress - 0.86) / 0.14));

      progressRef.current = progress;
      lastRenderedProgressRef.current = progress;
      stage.style.setProperty("--publish-fan-progress", progress.toFixed(4));
      stage.dataset.publishFanProgress = progress.toFixed(4);

      phoneRefs.current.forEach((phone, index) => {
        if (!phone) return;
        const delay = index * 0.055;
        const localProgress = smoothstep(
          clamp((progress - delay) / Math.max(0.001, 1 - delay))
        );
        const x =
          startX[index] + (xPositions[index] - startX[index]) * localProgress;
        const y =
          startY[index] + (yPositions[index] - startY[index]) * localProgress;
        const rotation =
          startRotation[index] +
          (rotations[index] - startRotation[index]) * localProgress;
        const initialScale = index === 2 ? 0.92 : 0.78;
        const initialOpacity = index === 2 ? 1 : 0.3;
        const scale =
          initialScale + (targetScales[index] - initialScale) * localProgress;
        const opacity = initialOpacity + (1 - initialOpacity) * localProgress;
        const blur = Math.max(0, 1.25 * (1 - localProgress));

        phone.style.transform = `translate3d(calc(-50% + ${x.toFixed(
          2
        )}px), calc(-50% + ${y.toFixed(2)}px), 0) rotate(${rotation.toFixed(
          2
        )}deg) scale(${scale.toFixed(4)})`;
        phone.style.opacity = opacity.toFixed(3);
        phone.style.filter = `saturate(${(0.68 + localProgress * 0.32).toFixed(
          3
        )}) blur(${blur.toFixed(2)}px)`;
        phone.style.setProperty(
          "--publish-label-opacity",
          labelOpacity.toFixed(3)
        );
        phone.style.setProperty(
          "--publish-label-counter-rotation",
          `${(-rotation).toFixed(2)}deg`
        );
        phone.style.zIndex = String(expandedZIndexes[index]);
      });
    },
    []
  );

  const queueScrollUpdate = useCallback(() => {
    if (scrollFrameRef.current !== null) return;

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;

      if (reducedMotionRef.current) {
        renderProgress(1);
        return;
      }

      const root = rootRef.current;
      const scene = root?.closest<HTMLElement>("[data-publish-scroll-scene]");
      if (!scene) return;

      const sceneRect = scene.getBoundingClientRect();

      renderProgress(
        getPublishFanScrollProgress(
          sceneRect.top,
          sceneRect.height,
          window.innerHeight
        )
      );
    });
  }, [renderProgress]);

  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        if (scrollFrameRef.current !== null) {
          window.cancelAnimationFrame(scrollFrameRef.current);
          scrollFrameRef.current = null;
        }
        renderProgress(1, true);
      } else {
        lastRenderedProgressRef.current = -1;
        queueScrollUpdate();
      }
      syncVideoPlayback();
    };

    const resizeObserver = new ResizeObserver(() => {
      renderProgress(progressRef.current, true);
      queueScrollUpdate();
    });
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(
      entries => {
        visibleRef.current = entries[0]?.isIntersecting ?? false;
        syncVideoPlayback();
      },
      { threshold: 0.22 }
    );
    intersectionObserver.observe(root);

    const handleVisibilityChange = () => syncVideoPlayback();
    window.addEventListener("scroll", queueScrollUpdate, { passive: true });
    window.addEventListener("resize", queueScrollUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    mediaQuery.addEventListener("change", applyMotionPreference);
    applyMotionPreference();
    queueScrollUpdate();

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", queueScrollUpdate);
      window.removeEventListener("resize", queueScrollUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener("change", applyMotionPreference);
      videoRefs.current.forEach(video => video?.pause());
    };
  }, [queueScrollUpdate, renderProgress, syncVideoPlayback]);

  return (
    <div
      ref={rootRef}
      className="home-v2-publish-fan"
      data-scroll-driven="true"
    >
      <div
        ref={stageRef}
        className="home-v2-publish-fan-stage"
        data-publish-fan-progress="0.0000"
        role="group"
        aria-label="Five social output previews expand into view as you scroll."
      >
        <div className="home-v2-publish-phone-list" role="list">
          {publishPhoneItems.map((item, index) => (
            <article
              key={item.id}
              ref={node => {
                phoneRefs.current[index] = node;
              }}
              className={`home-v2-publish-phone home-v2-publish-phone-${item.id}`}
              role="listitem"
              aria-label={`${item.label} output preview`}
              data-publish-phone={item.id}
              data-publish-video={item.kind === "video" || undefined}
            >
              <div className="home-v2-publish-phone-media">
                {item.kind === "video" ? (
                  <video
                    ref={node => {
                      videoRefs.current[index] = node;
                    }}
                    src={item.src}
                    poster={item.poster}
                    width={item.width}
                    height={item.height}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {item.id === "tiktok" ? (
                  <div className="home-v2-publish-tiktok-ui" aria-hidden="true">
                    <span className="home-v2-publish-tiktok-topline">
                      Following <strong>For You</strong>
                    </span>
                    <span className="home-v2-publish-tiktok-actions">
                      <i>♡</i>
                      <i>•••</i>
                    </span>
                    <span className="home-v2-publish-tiktok-caption">
                      <strong>@memova · Apollo 11</strong>
                      <small>Landing-site flyover · NASA / GSFC</small>
                    </span>
                  </div>
                ) : null}
              </div>
              <span className="home-v2-publish-phone-label" aria-hidden="true">
                {item.label}
              </span>
            </article>
          ))}
        </div>
        <div className="home-v2-publish-mobile-labels" aria-hidden="true">
          {publishPhoneItems.map(item => (
            <span key={item.id}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
