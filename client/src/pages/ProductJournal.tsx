import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { navigate } from "wouter/use-browser-location";

import ContinuousDemoStory from "@/components/demo-story/ContinuousDemoStory";
import { wasProductJournalOpenedInApp } from "@/navigation/productJournalNavigation";

export default function ProductJournal() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const closeJournal = useCallback(() => {
    if (wasProductJournalOpenedInApp(window.history.state)) {
      window.history.back();
      return;
    }

    navigate("/", { replace: true });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, []);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.isComposing ||
        document.fullscreenElement
      ) {
        return;
      }

      event.preventDefault();
      closeJournal();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeJournal]);

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#f8faff]"
      data-product-journal="page"
    >
      <button
        type="button"
        onClick={closeJournal}
        aria-label="Close Product Journal and return to the Memova homepage"
        className="fixed right-3 top-3 z-[1000] inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200/90 bg-white/92 px-4 text-sm font-semibold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.14)] backdrop-blur-xl transition hover:border-slate-300 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:right-5 sm:top-5"
      >
        <X aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        <span>Close</span>
      </button>

      <main aria-labelledby="product-journal-heading">
        <h1
          ref={headingRef}
          id="product-journal-heading"
          tabIndex={-1}
          className="sr-only focus:outline-none"
        >
          Memova Product Journal
        </h1>
        <ContinuousDemoStory />
      </main>
    </div>
  );
}
