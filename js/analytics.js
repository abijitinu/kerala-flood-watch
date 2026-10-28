/*
 * Usage analytics (Google Analytics 4, through the site's Firebase project).
 *
 * Privacy: Google's consent mode starts with all storage denied, so until a visitor taps
 * "Allow", no analytics cookies are set and Google receives only cookieless, anonymous pings.
 * Ads storage is always denied. We never send a visitor's position: places are reported by
 * district only. The choice is remembered in the browser.
 *
 * Events: place_view, alert_chip, language, refresh, share, date_change, outbound (official links).
 */
(function () {
  const MEASUREMENT_ID = "G-7E8QQ6LG4R"; // from Firebase → Project settings → Integrations → Google Analytics
  const KEY = "kfw:analytics";
  const T = s => (window.I18N ? window.I18N.t(s) : s);
  let choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const ready = !!MEASUREMENT_ID && !/localhost|127\.0\.0\.1/.test(location.hostname);

  if (ready) {
    gtag("consent", "default", { analytics_storage: choice === "yes" ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, { send_page_view: true });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(s);
  }

  /** Record an event (does nothing when analytics isn't set up, e.g. on localhost). */
  function track(name, params) { if (ready) gtag("event", name, params || {}); }

  function decide(value) {
    choice = value;
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage unavailable */ }
    if (ready) gtag("consent", "update", { analytics_storage: value === "yes" ? "granted" : "denied" });
    const bar = document.getElementById("consent");
    if (bar) bar.remove();
  }

  function banner() {
    if (!ready || choice) return;
    const bar = document.createElement("div");
    bar.id = "consent";
    bar.className = "consent";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Privacy");
    const draw = () => {
      bar.innerHTML = "<p>" + T("We count visits anonymously to improve this site. We never record where you are.") + "</p>" +
        "<div class='consent-actions'><button type='button' data-consent='no'>No thanks</button><button type='button' data-consent='yes' class='on'>Allow</button></div>";
    };
    draw();
    if (window.I18N) window.I18N.onChange(draw);
    bar.addEventListener("click", e => { const b = e.target.closest("[data-consent]"); if (b) decide(b.dataset.consent); });
    document.body.appendChild(bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", banner); else banner();

  // Clicks on official sources (District Collector, SACHET, KSDMA, IMD…) and Organic Maps.
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='http']");
    if (a && !a.href.startsWith(location.origin)) track("outbound", { host: new URL(a.href).hostname });
  });

  window.Analytics = { track };
})();
