let skipInitialMarketingMotion = false;

export function initializeSeoHandoff(root: ParentNode | null) {
  skipInitialMarketingMotion = Boolean(
    root?.querySelector('[data-seo-snapshot="true"]')
  );
  return skipInitialMarketingMotion;
}

export function shouldSkipInitialMarketingMotion() {
  return skipInitialMarketingMotion;
}
