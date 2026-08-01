import { useEffect } from "react";
import { useLocation } from "wouter";

const SPA_PATHS = new Set([
  "/",
  "/ios",
  "/agent-memory",
  "/how-it-works",
  "/user-cases",
  "/mcp",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/login",
  "/profile",
  "/connected-clients",
  "/settings/connected-clients",
  "/mcp/oauth/consent",
  "/bay-area-agent-demo-2",
  "/404",
]);

function normalizePathname(pathname: string) {
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
}

export function isSpaPath(pathname: string) {
  const normalized = normalizePathname(pathname);
  return SPA_PATHS.has(normalized) || normalized.startsWith("/use-cases/");
}

function scrollAfterNavigation(url: URL) {
  if (!url.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  const targetId = decodeURIComponent(url.hash.slice(1));
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });
  });
}

export default function SpaNavigation() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
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

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !isSpaPath(url.pathname)) {
        return;
      }

      const current = new URL(window.location.href);
      if (
        normalizePathname(url.pathname) ===
          normalizePathname(current.pathname) &&
        url.search === current.search &&
        url.hash
      ) {
        return;
      }

      event.preventDefault();
      const destinationPath = normalizePathname(url.pathname);
      navigate(`${destinationPath}${url.search}${url.hash}`);
      scrollAfterNavigation(url);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [navigate]);

  return null;
}
