import { useEffect, useRef } from "react";

import Navbar from "@/components/Navbar";
import CompactUseCasesPreview from "@/components/book-preview/CompactUseCasesPreview";
import ContinuousDemoStory from "@/components/demo-story/ContinuousDemoStory";
import CTASection from "@/components/sections/CTASection";
import HeroSection from "@/components/sections/HeroSection";
import PrivacySection from "@/components/sections/PrivacySection";

const WAITLIST_HASH = "#waitlist";
const WAITLIST_SCROLL_DELAYS = [120, 500, 1000, 1800, 2600] as const;
const WAITLIST_SMOOTH_SETTLE_DELAYS = [900, 1800] as const;

function getWaitlistScrollTarget() {
  return (
    document.getElementById("early-access-email") ??
    document.getElementById("waitlist")
  );
}

export default function Home() {
  const productTourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pendingTimeouts = new Set<number>();
    let pendingFrame: number | null = null;

    const clearPendingScrolls = () => {
      if (pendingFrame !== null) {
        window.cancelAnimationFrame(pendingFrame);
        pendingFrame = null;
      }
      pendingTimeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
      pendingTimeouts.clear();
    };

    const scrollToWaitlist = (behavior: ScrollBehavior) => {
      if (window.location.hash !== WAITLIST_HASH) return;

      const target = getWaitlistScrollTarget();
      if (!target) return;

      if (behavior === "auto") {
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        target.scrollIntoView({ behavior: "auto", block: "center" });
        root.style.scrollBehavior = previousScrollBehavior;
        return;
      }

      target.scrollIntoView({ behavior, block: "center" });
    };

    const scheduleWaitlistScroll = (event?: Event) => {
      clearPendingScrolls();
      if (window.location.hash !== WAITLIST_HASH) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const shouldScrollSmoothly =
        event?.type === "hashchange" && !prefersReducedMotion;

      pendingFrame = window.requestAnimationFrame(() => {
        scrollToWaitlist(shouldScrollSmoothly ? "smooth" : "auto");
      });

      const settleDelays = shouldScrollSmoothly
        ? WAITLIST_SMOOTH_SETTLE_DELAYS
        : WAITLIST_SCROLL_DELAYS;

      settleDelays.forEach(delay => {
        const timeoutId = window.setTimeout(() => {
          pendingTimeouts.delete(timeoutId);
          scrollToWaitlist("auto");
        }, delay);
        pendingTimeouts.add(timeoutId);
      });
    };

    const stopWaitlistSettlingForUserIntent = () => {
      if (window.location.hash === WAITLIST_HASH) clearPendingScrolls();
    };

    const stopWaitlistSettlingForKeyboard = (event: KeyboardEvent) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "End",
          "Home",
          "PageDown",
          "PageUp",
          " ",
        ].includes(event.key)
      ) {
        stopWaitlistSettlingForUserIntent();
      }
    };

    scheduleWaitlistScroll();
    window.addEventListener("hashchange", scheduleWaitlistScroll);
    window.addEventListener("load", scheduleWaitlistScroll);
    window.addEventListener("wheel", stopWaitlistSettlingForUserIntent, {
      passive: true,
    });
    window.addEventListener("touchstart", stopWaitlistSettlingForUserIntent, {
      passive: true,
    });
    window.addEventListener(
      "pointerdown",
      stopWaitlistSettlingForUserIntent
    );
    window.addEventListener("keydown", stopWaitlistSettlingForKeyboard);

    return () => {
      clearPendingScrolls();
      window.removeEventListener("hashchange", scheduleWaitlistScroll);
      window.removeEventListener("load", scheduleWaitlistScroll);
      window.removeEventListener("wheel", stopWaitlistSettlingForUserIntent);
      window.removeEventListener(
        "touchstart",
        stopWaitlistSettlingForUserIntent
      );
      window.removeEventListener(
        "pointerdown",
        stopWaitlistSettlingForUserIntent
      );
      window.removeEventListener("keydown", stopWaitlistSettlingForKeyboard);
    };
  }, []);

  const scrollToProductTour = () => {
    productTourRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="memova-home-theme min-h-screen overflow-x-clip bg-[var(--memova-canvas)]">
      <Navbar />
      <main>
        <HeroSection onSeeWorkflow={scrollToProductTour} />
        <div ref={productTourRef}>
          <ContinuousDemoStory />
        </div>
        <CompactUseCasesPreview />
        <PrivacySection />
        <CTASection />
      </main>
    </div>
  );
}
