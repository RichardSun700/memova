// Keep this bootstrap free of static import/export syntax. Some legacy pages
// load it as a classic deferred script while the main app loads it as a module.
const MEASUREMENT_ID = "G-9YJQ994J98";
const STORAGE_KEY = "memova.analytics.consent.v1";
const PROTECTED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HU", "IS", "IE", "IT", "LI", "LV", "LT", "LU", "MT", "NL",
  "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

const root = typeof window === "undefined" ? undefined : window;
let lastPageView = "";

function gtag() {
  if (!root) return;
  root.dataLayer = root.dataLayer || [];
  root.dataLayer.push(arguments);
}

function readChoice() {
  try {
    const choice = root?.localStorage.getItem(STORAGE_KEY);
    return choice === "granted" || choice === "denied" ? choice : null;
  } catch {
    return null;
  }
}

function persistChoice(choice) {
  try {
    root?.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Analytics preferences remain session-only when storage is unavailable.
  }
}

function updateConsent(choice) {
  persistChoice(choice);
  gtag("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  root?.dispatchEvent(new CustomEvent("memova:analytics-consent", { detail: choice }));
}

function trackEvent(name, parameters = {}) {
  if (!name || typeof name !== "string") return;
  gtag("event", name, parameters);
}

function trackPageView() {
  if (!root) return;
  const key = `${root.location.pathname}${root.location.search}${root.location.hash}`;
  if (key === lastPageView) return;
  lastPageView = key;
  trackEvent("page_view", {
    page_title: document.title,
    page_location: root.location.href,
    page_path: key,
  });
}

function addGoogleTag() {
  if (!root || document.querySelector(`script[data-memova-ga4="${MEASUREMENT_ID}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.memovaGa4 = MEASUREMENT_ID;
  document.head.appendChild(script);
}

function installChoiceSurface() {
  if (!root || document.getElementById("memova-analytics-choices")) return;

  const style = document.createElement("style");
  style.textContent = `
    #memova-analytics-choices{position:fixed;inset:auto 16px 16px 16px;z-index:2147483646;display:none;max-width:620px;margin:auto;padding:18px;border:1px solid #dcebf6;border-radius:18px;background:#fff;color:#0f2b3c;box-shadow:0 18px 50px rgba(15,43,60,.16);font:14px/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #memova-analytics-choices strong{display:block;margin-bottom:5px;font-size:15px}
    #memova-analytics-choices p{margin:0;color:#526b7d}
    #memova-analytics-choices a{color:#1f69d5}
    #memova-analytics-choices .memova-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
    #memova-analytics-choices button,#memova-analytics-manage{min-height:40px;padding:9px 15px;border:1px solid #cbdcec;border-radius:999px;background:#fff;color:#0f2b3c;font:700 12px/1 Inter,ui-sans-serif,sans-serif;cursor:pointer}
    #memova-analytics-choices button[data-choice="granted"]{border-color:#0f2b3c;background:#0f2b3c;color:#fff}
    #memova-analytics-manage{position:fixed;right:14px;bottom:14px;z-index:2147483645;display:none;min-height:34px;padding:7px 12px;background:rgba(255,255,255,.94);box-shadow:0 8px 24px rgba(15,43,60,.1)}
    @media(max-width:520px){#memova-analytics-choices{inset:auto 10px 10px 10px;padding:16px}#memova-analytics-choices .memova-actions{flex-direction:column}#memova-analytics-choices button{width:100%}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement("section");
  panel.id = "memova-analytics-choices";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Analytics privacy choices");
  panel.innerHTML = `
    <strong>Analytics privacy choices</strong>
    <p>Memova uses Google Analytics to understand which pages and iOS early-access steps are useful. You can allow or reject analytics and change your choice later. <a href="/privacy">Privacy details</a>.</p>
    <div class="memova-actions">
      <button type="button" data-choice="denied">Reject analytics</button>
      <button type="button" data-choice="granted">Allow analytics</button>
    </div>
  `;

  const manage = document.createElement("button");
  manage.id = "memova-analytics-manage";
  manage.type = "button";
  manage.textContent = "Privacy choices";

  const showPanel = () => {
    panel.style.display = "block";
    manage.style.display = "none";
  };
  const hidePanel = () => {
    panel.style.display = "none";
    manage.style.display = "block";
  };

  panel.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-choice]") : null;
    const choice = button?.getAttribute("data-choice");
    if (choice !== "granted" && choice !== "denied") return;
    updateConsent(choice);
    hidePanel();
  });
  manage.addEventListener("click", showPanel);
  document.body.append(panel, manage);

  if (readChoice()) hidePanel();
  else showPanel();
}

function installClickTracking() {
  document.addEventListener("click", (event) => {
    const element = event.target instanceof Element
      ? event.target.closest("[data-analytics-event]")
      : null;
    const name = element?.getAttribute("data-analytics-event");
    if (!name) return;
    trackEvent(name, {
      link_url: element instanceof HTMLAnchorElement ? element.href : undefined,
      link_text: element.textContent?.trim().slice(0, 120),
    });
  });
}

function install() {
  if (!root) return;
  const isEmbeddedPreview = root.self !== root.top
    && new URLSearchParams(root.location.search).get("embed") === "1";
  if (isEmbeddedPreview) return;
  root.dataLayer = root.dataLayer || [];
  root.gtag = gtag;

  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    region: PROTECTED_REGIONS,
    wait_for_update: 500,
  });

  const savedChoice = readChoice();
  if (savedChoice) updateConsent(savedChoice);

  addGoogleTag();
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  root.memovaAnalytics = { trackEvent, trackPageView, updateConsent };

  const ready = () => {
    installChoiceSurface();
    installClickTracking();
    const spaScript = document.querySelector('script[data-spa="true"][src^="/analytics/ga4-consent.js"]');
    if (!spaScript) trackPageView();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
}

install();
