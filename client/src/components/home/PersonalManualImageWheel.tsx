import { Pause, Play } from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type PersonalManualWheelItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  objectPosition?: string;
};

type PersonalManualImageWheelProps = {
  items: readonly PersonalManualWheelItem[];
};

const FULL_CIRCLE = Math.PI * 2;
const DESKTOP_SPEED = 12;
const MOBILE_SPEED = 7;

export default function PersonalManualImageWheel({
  items,
}: PersonalManualImageWheelProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const renderRef = useRef<() => void>(() => undefined);
  const startRef = useRef<() => void>(() => undefined);
  const rotationRef = useRef(-24);
  const momentumRef = useRef(0);
  const scrollBoostRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerRef = useRef({ id: -1, x: 0, at: 0 });
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const visibleRef = useRef(true);
  const geometryRef = useRef({
    radiusX: 264,
    radiusY: 74.25,
    compact: false,
  });
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || items.length === 0) return;

    const updateGeometry = () => {
      const { width, height } = stage.getBoundingClientRect();
      const compact = width < 640;
      geometryRef.current = {
        radiusX: Math.min(264, Math.max(compact ? 104 : 158, width * 0.37)),
        radiusY: Math.min(78, Math.max(compact ? 44 : 58, height * 0.17)),
        compact,
      };
      renderRef.current();
    };

    const render = () => {
      const { radiusX, radiusY } = geometryRef.current;
      const rotationRadians = (rotationRef.current * Math.PI) / 180;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const phase = (index / items.length) * FULL_CIRCLE + rotationRadians;
        const depth = (Math.sin(phase) + 1) / 2;
        const scale = 0.72 + 0.28 * depth;
        const rotateY = -52 * Math.cos(phase);
        const x = Math.cos(phase) * radiusX * (0.74 + 0.26 * depth);
        const y = Math.sin(phase) * radiusY * (0.88 + 0.12 * depth);
        const blur = reducedMotionRef.current ? 0 : 1.5 * (1 - depth);
        const shadowY = 12 + 28 * depth;

        card.style.transform = `translate3d(calc(-50% + ${x.toFixed(
          2
        )}px), calc(-50% + ${y.toFixed(
          2
        )}px), 0) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.filter = `blur(${blur.toFixed(2)}px)`;
        card.style.zIndex = `${Math.round(1000 * depth)}`;
        card.style.boxShadow = `0 ${shadowY.toFixed(1)}px ${(
          shadowY * 1.6
        ).toFixed(1)}px rgba(20, 40, 75, ${(0.1 + 0.12 * depth).toFixed(3)})`;
        card.dataset.front = depth > 0.84 ? "true" : "false";
      });
    };

    renderRef.current = render;

    const stop = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastFrameRef.current = null;
    };

    const tick = (timestamp: number) => {
      frameRef.current = null;
      if (!visibleRef.current || reducedMotionRef.current) {
        lastFrameRef.current = null;
        return;
      }

      const previous = lastFrameRef.current ?? timestamp;
      const deltaSeconds = Math.min((timestamp - previous) / 1000, 0.05);
      lastFrameRef.current = timestamp;
      const autoSpeed = geometryRef.current.compact
        ? MOBILE_SPEED
        : DESKTOP_SPEED;

      if (!pausedRef.current && !draggingRef.current) {
        rotationRef.current +=
          (autoSpeed + scrollBoostRef.current) * deltaSeconds;
      }

      if (!draggingRef.current && Math.abs(momentumRef.current) > 0.002) {
        rotationRef.current += momentumRef.current;
        momentumRef.current *= 0.96;
      }

      scrollBoostRef.current *= 0.9;
      render();
      if (
        pausedRef.current &&
        !draggingRef.current &&
        Math.abs(momentumRef.current) <= 0.002 &&
        scrollBoostRef.current <= 0.02
      ) {
        lastFrameRef.current = null;
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (
        frameRef.current === null &&
        visibleRef.current &&
        !reducedMotionRef.current
      ) {
        lastFrameRef.current = null;
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    startRef.current = start;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      setReducedMotion(motionQuery.matches);
      momentumRef.current = 0;
      scrollBoostRef.current = 0;
      if (motionQuery.matches) {
        stop();
        render();
      } else {
        start();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      entries => {
        visibleRef.current = entries[0]?.isIntersecting ?? false;
        if (visibleRef.current) start();
        else stop();
      },
      { threshold: 0.08 }
    );
    const resizeObserver = new ResizeObserver(updateGeometry);

    const handleScroll = () => {
      const nextScroll = window.scrollY;
      const delta = Math.abs(nextScroll - lastScrollRef.current);
      lastScrollRef.current = nextScroll;
      if (
        visibleRef.current &&
        !pausedRef.current &&
        !reducedMotionRef.current &&
        !geometryRef.current.compact
      ) {
        scrollBoostRef.current = Math.min(
          40,
          scrollBoostRef.current + delta * 0.4
        );
        start();
      }
    };

    lastScrollRef.current = window.scrollY;
    intersectionObserver.observe(stage);
    resizeObserver.observe(stage);
    window.addEventListener("scroll", handleScroll, { passive: true });
    motionQuery.addEventListener("change", applyMotionPreference);
    updateGeometry();
    applyMotionPreference();
    start();

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      motionQuery.removeEventListener("change", applyMotionPreference);
      renderRef.current = () => undefined;
      startRef.current = () => undefined;
    };
  }, [items.length]);

  const togglePaused = () => {
    if (reducedMotion) return;
    setPaused(current => {
      const next = !current;
      pausedRef.current = next;
      if (next) {
        scrollBoostRef.current = 0;
        momentumRef.current = 0;
      } else {
        startRef.current();
      }
      return next;
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.button !== 0) return;
    draggingRef.current = true;
    momentumRef.current = 0;
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      at: performance.now(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
    startRef.current();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerRef.current.id !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const deltaX = event.clientX - pointerRef.current.x;
    const deltaTime = Math.max(1, now - pointerRef.current.at);
    rotationRef.current += deltaX * 0.28;
    momentumRef.current = deltaX * 0.03 * Math.min(1.25, 16 / deltaTime);
    pointerRef.current = { id: event.pointerId, x: event.clientX, at: now };
    renderRef.current();
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== event.pointerId) return;
    draggingRef.current = false;
    pointerRef.current.id = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    delete event.currentTarget.dataset.dragging;
    startRef.current();
  };

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      rotationRef.current += event.key === "ArrowRight" ? 45 : -45;
      momentumRef.current = 0;
      renderRef.current();
    },
    []
  );

  return (
    <div className="home-v2-manual-wheel-shell">
      <div className="home-v2-manual-wheel-toolbar">
        <div>
          <span>Illustrative Personal Manual</span>
          <strong>Marilyn Monroe · public archive</strong>
        </div>
        <button
          type="button"
          onClick={togglePaused}
          disabled={reducedMotion}
          hidden={reducedMotion}
          aria-label={
            reducedMotion
              ? "Motion reduced by system preference"
              : paused
                ? "Play image orbit"
                : "Pause image orbit"
          }
        >
          {paused || reducedMotion ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        ref={stageRef}
        className="home-v2-manual-wheel"
        tabIndex={0}
        role="group"
        aria-label="Eight public archive images orbiting as chapters of an illustrative Personal Manual. Drag, swipe, or use the arrow keys to rotate."
        data-reduced-motion={reducedMotion ? "true" : "false"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onKeyDown={handleKeyDown}
      >
        <div className="home-v2-manual-wheel-track" role="list">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={node => {
                cardRefs.current[index] = node;
              }}
              className="home-v2-manual-wheel-card"
              role="listitem"
              aria-label={`${item.label}. ${item.alt}`}
              data-wheel-card={item.id}
            >
              <img
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                draggable="false"
                style={{ objectPosition: item.objectPosition ?? "50% 50%" }}
              />
            </div>
          ))}
        </div>
        <span className="home-v2-manual-wheel-hint" aria-hidden="true">
          <span className="home-v2-manual-wheel-hint-desktop">
            Drag the archive · Scroll to add momentum
          </span>
          <span className="home-v2-manual-wheel-hint-mobile">
            Swipe or drag to rotate
          </span>
        </span>
      </div>
    </div>
  );
}
