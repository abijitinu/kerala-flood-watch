(function () {
  const B = window.BULLETIN, Live = window.Live, I = window.Illus, Net = window.RiverNet;
  // Every sentence shown is written in English and passed through T (js/i18n.js) for Malayalam.
  const T = window.I18N.t, loc = () => window.I18N.locale;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n, d = 1) => n == null || isNaN(n) ? "—" : Number(n).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

  /* ================= Plain-language vocabulary ================= */

  // Internal severity keys → the four words residents see.
  const SEVERITY = { unknown: 0, low: 0, normal: 0, elevated: 1, warning: 2, danger: 3 };
  const PLAIN_BY_SEV = ["safe", "alert", "ready", "danger"];
  const toPlain = k => k === "unknown" ? "unknown" : PLAIN_BY_SEV[SEVERITY[k]];
  const PLAIN = {
    // IMD's colour-coded warning levels: Green (No warning), Yellow (Be updated),
    // Orange (Be prepared), Red (Take action). Kerala's official alerts use the same scale.
    safe:    { word: "No warning",  colour: "Green",  line: "The river is at its usual level for this time of year. No action needed." },
    alert:   { word: "Be updated",  colour: "Yellow", line: "More water than usual. Keep following the news and official updates." },
    ready:   { word: "Be prepared", colour: "Orange", line: "The water is high. Keep your emergency bag ready and know where you would go." },
    danger:  { word: "Take action", colour: "Red",    line: "Water may enter homes near the river. Move to safety when officials tell you to." },
    unknown: { word: "Not sure",  line: "We couldn't get a reading for this date. Please follow official news." }
  };
  const TODO = {
    safe:    [["📻", "No action needed. Keep an eye on the news when it rains heavily."], ["🎒", "It's a good time to check your emergency bag."]],
    alert:   [["📻", "Watch the news and listen for announcements."], ["🎒", "Keep papers, medicines and phone charger in a waterproof bag."], ["🚗", "Move valuables and vehicles to higher ground."]],
    ready:   [["🎒", "Pack your emergency bag now."], ["👵", "Move old people, children and animals to a safer place early."], ["🗺️", "Find out where your nearest relief camp is."], ["🚫", "Do not walk or drive through flowing water."]],
    danger:  [["🏃", "Move to higher ground or a relief camp now if told to, or if water is coming in."], ["🔌", "Switch off electricity at the main switch before leaving."], ["📞", "Call 112 for rescue. Don't wait for water to rise."]],
    unknown: [["📻", "Follow announcements from the District Collector."], ["📞", "Call 1077 to ask your district control room."]]
  };
  // Forecast flow is a rough computer estimate, so it counts one step lower than a measured level.
  const MODEL_DAMP = { warning: "elevated", danger: "warning" };
  const modelKey = k => MODEL_DAMP[k] || k;

  function amountWords(ratio) {
    if (!(ratio > 0)) return "No reading";
    if (ratio < 0.75) return "Less water than usual";
    if (ratio < 1.25) return "About the usual amount of water"; // same 1.25× cut-off as Live.classifyFlow
    if (ratio < 1.75) return "A little more water than usual";
    if (ratio < 2.5) return "About twice the usual water";
    if (ratio < 3.5) return "About three times the usual water";
    return "Many times more water than usual";
  }
  function rainWords(mm, tense) {
    const verb = { past: ["fell", "rain fell"], today: ["today", "rain today"], future: ["expected", "rain expected"] }[tense];
    if (mm == null) return { icon: "·", text: "No rain data" };
    if (mm >= 115.6) return { icon: "⛈️", text: "Very heavy " + verb[1], level: 3 };
    if (mm >= 64.5) return { icon: "⛈️", text: "Heavy " + verb[1], level: 3 };
    if (mm >= 15.6) return { icon: "🌧️", text: "Steady " + verb[1], level: 2 };
    if (mm >= 2.5) return { icon: "🌦️", text: "Light showers " + (tense === "past" ? "fell" : verb[0]), level: 1 };
    return { icon: "☀️", text: tense === "future" ? "Little or no rain expected" : "Little or no rain", level: 0 };
  }
  function groundWords(e) {
    if (e <= 2) return "Very low land, almost at sea level. Water gathers here first and drains slowly.";
    if (e <= 10) return "Low-lying land near the river. It can flood when the river rises.";
    if (e <= 40) return "Slightly raised land, but nearby streams can still overflow.";
    return "Higher ground. River floods are less likely to reach here.";
  }
  function fillWords(pct) {
    if (pct == null) return null;
    if (pct >= 97) return "Full";
    if (pct >= 85) return "Almost full";
    if (pct >= 60) return "More than half full";
    if (pct >= 35) return "About half full";
    return "Low";
  }
  const gatesOpen = d => /\bopen(ed)?\b/i.test(d.gates || "") && !/\bclosed?\b/i.test(d.gates || "");
  function releaseWords(d) {
    if (d.missing) return d.gates || "No reading";
    // Tamil Nadu runs Mullaperiyar; no official report gives the water it draws each day.
    if (d.id === "mullaperiyar") return "Run by Tamil Nadu. No official daily figure for the water sent to Tamil Nadu";
    if (/overflow/i.test(d.gates)) return "Full and spilling over the top";
    if (d.id === "thottappally") return d.release ? "Gates open: sending flood water to the sea" : "Gates closed";
    if (d.id === "thanneermukkom") return /open/i.test(d.gates) ? "Gates open: water flows freely to the sea" : "Gates closed";
    if (!d.release) return gatesOpen(d) ? "Gates open: the river flows straight through" : "Gates closed: holding water, not letting any out";
    if (d.release < 50) return "Letting out a small amount of water";
    if (d.release < 300) return "Letting out a fair amount of water";
    return "Letting out a lot of water";
  }
  const DAM_ABOUT = {
    mullaperiyar: "Old dam high in the hills, run by Tamil Nadu.",
    idukki: "Kerala's biggest dam.",
    lowerperiyar: "A small dam below Idukki.",
    idamalayar: "Big dam on a side river that joins the Periyar.",
    bhoothathankettu: "Low gates across the Periyar.",
    pamba: "Dam near where the Pamba begins.",
    kakki: "Big dam on the Kakki river.",
    moozhiyar: "Small dam below the Sabarigiri power station.",
    maniyar: "Low gates on the Kakkad river.",
    thottappally: "Gates that send Kuttanad's flood water to the sea.",
    thanneermukkom: "Gates in Vembanad Lake."
  };

  /* ================= Dates ================= */
  const TODAY = Live.isoDate(new Date());
  const addDays = (iso, n) => { const [y, m, d] = iso.split("-").map(Number); return Live.isoDate(new Date(y, m - 1, d + n)); };
  const DATES = []; for (let i = -Live.PAST_DAYS; i <= Live.AHEAD_DAYS; i++) DATES.push(addDays(TODAY, i));
  const tenseOf = d => d < TODAY ? "past" : d > TODAY ? "future" : "today";
  const dateObj = d => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd); };
  const longDate = d => dateObj(d).toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
  const shortDate = d => dateObj(d).toLocaleDateString(loc(), { day: "numeric", month: "short" });
  const daysBetween = (a, b) => Math.round((dateObj(b) - dateObj(a)) / 864e5);
  const dateKicker = d => T({ past: "{date} · recorded", today: "Today · {date}", future: "{date} · forecast" }[tenseOf(d)], { date: longDate(d) });

  /* ================= Timestamps and technical details ================= */
  // A reading with only a date (no time) shows just the date.
  const timeText = iso => !iso ? "—" : iso.length === 10 ? shortDate(iso)
    : new Date(iso).toLocaleString(loc(), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
  // Mullaperiyar's level against the 142 ft the Supreme Court allows, from the CEA's daily report.
  const levelLine = d => d.permitted != null && d.level != null
    ? T("Water level {level} ft, permitted up to {max} ft. Same day last year: {ly} ft.", { level: fmt(d.level, 1), max: fmt(d.permitted, 0), ly: fmt(d.lastYear, 1) }) : "";
  const ownSource = d => d.source === "CEA" && d.asOf ? stamp("CEA report", d.asOf, false) : "";
  const stamp = (label, iso, stale) => iso
    ? "<span class='stamp" + (stale ? " stale" : "") + "'><svg viewBox='0 0 16 16' aria-hidden='true'><circle cx='8' cy='8' r='6.5'/><path d='M8 4.5V8l2.5 1.5'/></svg>" +
      (stale ? T("Last available · ") : "") + esc(T(label)) + " · " + timeText(iso) + "</span>"
    : "";
  const badge = (plain, text) => "<span class='badge " + plain + "'>" + esc(text || T(PLAIN[plain].word)) + "</span>";
  const EYE = "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'/><circle cx='12' cy='12' r='3'/><path class='slash' d='M4 4l16 16'/></svg>";
  const techButton = what => "<button type='button' class='tech-toggle' aria-expanded='false' title='" + esc(T("Show the numbers")) + "' aria-label='" + esc(T("Show the numbers for {what}", { what: T(what) })) + "'>" + EYE + "</button>";
  const techPanel = inner => "<div class='tech' hidden><div class='tech-head'><span>" + T("The numbers") + "</span></div>" + inner + "</div>";
  const techRows = rows => "<dl class='tech-grid'>" + rows.filter(Boolean).map(([k, v]) => "<dt>" + esc(T(k)) + "</dt><dd>" + v + "</dd>").join("") + "</dl>";
  // Organic Maps (free, offline, OpenStreetMap-based) opens these links in its app, or shows its
  // download page when the app isn't installed. Format: https://omaps.app/api
  const organicLink = places => "https://omaps.app/map?v=1&" + places.filter(p => p && p.lat != null)
    .map(p => "ll=" + (+p.lat).toFixed(5) + "," + (+p.lon).toFixed(5) + "&n=" + encodeURIComponent(p.name)).join("&");
  const organicButton = (places, label) => "<a class='om-link' href='" + esc(organicLink(places)) + "' target='_blank' rel='noopener'>" +
    "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z'/><circle cx='12' cy='9.5' r='2.5'/></svg>" + esc(label || T("Open in Organic Maps")) + "</a>";
  const head = (title, what) => "<div class='w-head'><div class='w-title'>" + T(title) + "</div>" + (what ? techButton(what) : "") + "</div>";

  document.addEventListener("click", e => {
    const b = e.target.closest(".tech-toggle");
    if (!b) return;
    const panel = b.closest(".w, [data-tech-scope]").querySelector(".tech");
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    panel.hidden = !open;
  });

  /* ================= River-flow points (data/sites.js) ================= */
  // Points every ~20 km along every river in Kerala. Flow is fetched only for the points that
  // matter to the chosen place (its river system, upstream and downstream, nearest first),
  // which keeps each place within the free forecast service's rate limits.
  const ALL_SITES = window.FLOW_SITES || [];
  const MAX_SITES = 12;
  const siteById = Object.fromEntries(ALL_SITES.map(p => [p.id, p]));
  const sitePos = Object.fromEntries(ALL_SITES.map(p => [p.id, Net.locate(p.lat, p.lon, p.river)]));
  const siteName = id => siteById[id].town;
  // Names as shown: Malayalam (from OpenStreetMap) in Malayalam mode where known.
  const townLabel = id => window.I18N.place(siteName(id)), RN = key => window.I18N.river(key);
  // Dams on the river network. Thottappally and Thanneermukkom are where the Pamba system's water
  // leaves for the sea. A dam more than a few km from any mapped river line (its own river isn't
  // named in OpenStreetMap) is kept off the network and only listed as a dam nearby.
  const DAM_SNAP_KM = 3, NEARBY_DAM_KM = 25;
  const damPos = Object.fromEntries(Object.entries(window.DAM_LOCATIONS || {}).map(([id, d]) =>
    [id, d.outlet ? { river: "pamba", idx: window.RIVER_LINES.pamba.main.length - 1 } : d.river ? Net.locate(d.lat, d.lon, d.river) : null])
    .filter(([, pos]) => pos && !(pos.offKm > DAM_SNAP_KM)));

  /* ================= River data (live forecast, with offline fallback) ================= */
  // If a fresh forecast can't be fetched, the last one this browser saw for that river system
  // is used instead, and every place that shows it says when it is from.
  const FLOW_KEY = "kfw:flows:";
  let flowsMeta = { at: null, stale: false };
  const modelById = {};
  function remember(basin, byId, at) {
    try {
      const index = JSON.parse(localStorage.getItem(FLOW_KEY + "index") || "[]").filter(b => b !== basin);
      index.unshift(basin);
      index.slice(6).forEach(b => localStorage.removeItem(FLOW_KEY + b)); // keep the 6 most recent river systems
      localStorage.setItem(FLOW_KEY + "index", JSON.stringify(index.slice(0, 6)));
      localStorage.setItem(FLOW_KEY + basin, JSON.stringify({ at, byId }));
    } catch (e) { /* storage unavailable or full */ }
  }
  function loadFlows(ids, basin) {
    return Live.dischargeMany(ids.map(id => ({ lat: siteById[id].lat, lon: siteById[id].lon })))
      .then(list => {
        const byId = Object.fromEntries(ids.map((id, i) => [id, list[i]]));
        flowsMeta = { at: new Date().toISOString(), stale: false };
        remember(basin, byId, flowsMeta.at);
        return byId;
      })
      .catch(err => {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(FLOW_KEY + basin)); } catch (e) { /* storage unavailable */ }
        if (saved && saved.byId) { flowsMeta = { at: saved.at, stale: true }; return saved.byId; }
        if (ids.every(id => modelById[id])) { flowsMeta.stale = true; return modelById; }
        throw err;
      })
      .then(byId => { Object.assign(modelById, byId); return byId; });
  }
  let flows = null;

  /* ================= Dam readings for a date ================= */
  // Dams are only published for today. Past dates use the daily archive kept by
  // scripts/fetch_dams.py; future dates show the latest official reading.
  function damsOn(date) {
    if (date >= TODAY || B.isSample) return { dams: B.dams, note: date > TODAY ? "Latest official reading (dams are not forecast)" : null, asOf: B.asOf };
    const hist = window.DAM_HISTORY || {};
    const day = Object.keys(hist).filter(d => d <= date).sort().pop();
    const base = window.DAM_BASE;
    const none = gates => ({ level: null, levelM: null, storagePct: null, release: null, alert: "none", gates, missing: true, asOf: null });
    if (!day || daysBetween(day, date) > 7) return { dams: base.map(d => Object.assign({}, d, none("No saved reading for this date"))), note: "No official dam reading was saved for this date", asOf: null };
    const h = hist[day];
    return {
      dams: base.map(d => h.dams[d.id] ? Object.assign({}, d, h.dams[d.id], { grossMcm: undefined, stale: day !== date }) : Object.assign({}, d, none("Not in that day's official table"))),
      note: day === date ? null : T("Nearest saved reading: {date}", { date: shortDate(day) }), asOf: h.asOf
    };
  }

  /* ================= Status of a point / the place on a date ================= */
  function siteOn(id, date) {
    const r = modelById[id];
    if (!r) return { plain: "unknown", key: "unknown", fo: null };
    const fo = Live.flowOn(r, date);
    const key = modelKey(fo.cls.key);
    return { plain: toPlain(key), key, fo };
  }

  // State for the chosen place.
  const S = { place: null, pos: null, basin: null, district: null, sites: [], near: null, up: [], down: [], date: TODAY, rain: null, elev: null, zoomed: false };

  function rainOn(date) {
    if (!S.rain) return null;
    const k = S.rain.times.indexOf(date);
    return k < 0 ? null : S.rain.mm[k];
  }

  /** Overall status at the place: the river near it, rain that day, and dam warnings upstream. */
  function placeOn(date) {
    const near = siteOn(S.near, date);
    const signals = [near.key];
    const mm = rainOn(date);
    if (mm >= 115.6) signals.push("warning"); else if (mm >= 64.5) signals.push("elevated");
    const dams = damsOn(date).dams;
    S.up.filter(x => x.type === "dam").forEach(x => {
      const d = dams.find(y => y.id === x.id);
      if (d && d.alert === "orange") signals.push("elevated");
      if (d && d.alert === "red") signals.push("warning");
    });
    const official = S.district ? alertsOn(S.district, date)[0] || null : null; // most severe first
    if (official) signals.push(LEVEL_KEY[official.level]);
    if (!near.fo || near.fo.value == null) return official ? { plain: LEVEL_PLAIN[official.level], near, official, fromOfficial: true } : { plain: "unknown", near };
    const plain = PLAIN_BY_SEV[Math.max(...signals.map(k => SEVERITY[k] || 0))];
    return { plain, near, official, fromOfficial: !!official && LEVEL_PLAIN[official.level] === plain };
  }

  /* ================= Official alerts (data/alerts.js, from SACHET) ================= */
  // IMD and KSDMA alerts for Kerala, fetched every 15 minutes by scripts/fetch_alerts.py.
  // An official alert for the place's district outranks our own estimate.
  const DIST = window.DISTRICTS || {};
  const RANK = { red: 3, orange: 2, yellow: 1, blue: 0.5, green: 0 };
  const LEVEL_PLAIN = { red: "danger", orange: "ready", yellow: "alert", green: "safe" };
  const LEVEL_KEY = { red: "danger", orange: "warning", yellow: "elevated", green: "normal" };
  const distName = k => DIST[k] ? (window.I18N.lang === "ml" ? DIST[k].ml : DIST[k].name) : "";
  const activeAlerts = () => ((window.OFFICIAL_ALERTS || {}).alerts || []).filter(a => new Date(a.expires) > Date.now() && a.level !== "green");
  // Alerts covering a district on a date (validity in IST, as the alerts are written).
  const alertsOn = (district, date) => activeAlerts().filter(a =>
    (a.statewide || a.districts.includes(district)) && (a.from || "").slice(0, 10) <= date && date <= a.expires.slice(0, 10));
  const hq = k => ({ lat: DIST[k].hq[0], lon: DIST[k].hq[1] });
  const nearestDistrict = (lat, lon) => Object.keys(DIST).sort((a, b) => Live.distanceKm({ lat, lon }, hq(a)) - Live.distanceKm({ lat, lon }, hq(b)))[0];
  // The place's district from OpenStreetMap; the nearest district headquarters if that fails.
  async function districtOf(place) {
    const key = "kfw:district:" + place.lat.toFixed(3) + "," + place.lon.toFixed(3);
    try { const c = sessionStorage.getItem(key); if (c && DIST[c]) return c; } catch (e) { /* storage unavailable */ }
    let found = null;
    try {
      const r = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat=" + place.lat + "&lon=" + place.lon).then(res => res.json());
      const name = ((r.address || {}).state_district || "").toLowerCase();
      found = name && Object.keys(DIST).find(k => DIST[k].aka.some(a => name.includes(a.toLowerCase())));
    } catch (e) { /* offline or rate-limited */ }
    found = found || nearestDistrict(place.lat, place.lon);
    try { sessionStorage.setItem(key, found); } catch (e) { /* storage unavailable */ }
    return found;
  }

  /* ================= Choosing a place ================= */
  function setupPlace(place) {
    S.place = place;
    S.district = nearestDistrict(place.lat, place.lon); // refined from OpenStreetMap in openPlace
    S.pos = Net.locate(place.lat, place.lon);
    S.basin = Net.BASIN_OF(S.pos.river);
    const along = id => Net.alongKm(sitePos[id], S.pos);
    const straight = id => Live.distanceKm(place, siteById[id]);
    // Points the water passes before or after the place, nearest first; if the river system has
    // none (a very small river), the nearest points anywhere.
    const linked = ALL_SITES.map(p => p.id).filter(id => Net.flowsPast(sitePos[id], S.pos) || Net.flowsPast(S.pos, sitePos[id])).sort((a, b) => along(a) - along(b));
    // One point per town name, the nearest, so the lists don't repeat a name.
    const towns = new Set();
    S.sites = (linked.length ? linked : ALL_SITES.map(p => p.id).sort((a, b) => straight(a) - straight(b)))
      .filter(id => !towns.has(siteName(id)) && towns.add(siteName(id))).slice(0, MAX_SITES);
    // The measuring point that best describes the river here: same river, nearest along the water;
    // otherwise the nearest one downstream, otherwise the nearest one.
    const sameRiver = S.sites.filter(id => sitePos[id].river === S.pos.river);
    const downstream = S.sites.filter(id => Net.flowsPast(S.pos, sitePos[id]));
    S.near = sameRiver.length ? sameRiver.sort((a, b) => along(a) - along(b))[0]
      : downstream.length ? downstream.sort((a, b) => along(a) - along(b))[0] : S.sites.slice().sort((a, b) => straight(a) - straight(b))[0];
    const item = (type, id, pos) => ({ type, id, km: Net.alongKm(pos, S.pos) });
    const all = [
      ...Object.keys(damPos).map(id => item("dam", id, damPos[id])),
      ...S.sites.filter(id => id !== S.near).map(id => item("site", id, sitePos[id]))
    ];
    S.up = all.filter(x => Net.flowsPast(x.type === "dam" ? damPos[x.id] : sitePos[x.id], S.pos)).sort((a, b) => a.km - b.km);
    S.down = all.filter(x => Net.flowsPast(S.pos, x.type === "dam" ? damPos[x.id] : sitePos[x.id])).sort((a, b) => a.km - b.km);
    // Dams close by that aren't on the river network, by straight distance.
    S.nearDams = Object.entries(window.DAM_LOCATIONS || {}).filter(([id]) => !damPos[id])
      .map(([id, d]) => ({ type: "dam", id, km: Live.distanceKm(place, d), away: true }))
      .filter(x => x.km <= NEARBY_DAM_KM).sort((a, b) => a.km - b.km);
    S.zoomed = false;
  }

  async function openPlace(place, date) {
    setupPlace(place);
    S.date = DATES.includes(date) ? date : TODAY;
    S.rain = null; S.elev = null;
    showState("dash");
    renderHead();
    renderCalendar();
    ["#wStatus", "#wTodo", "#wUp", "#wDown", "#wFlow", "#wRain"].forEach(s => { $(s).innerHTML = "<div class='skeleton' style='height:120px'></div>"; });
    writeHash();
    flows = loadFlows(S.sites, S.basin);
    renderOfficial();
    const [, rain, elev, district] = await Promise.allSettled([flows, Live.rainfall(place.lat, place.lon), Live.elevation(place.lat, place.lon), districtOf(place)]);
    if (S.place !== place) return; // a different place was chosen meanwhile
    if (district.status === "fulfilled") S.district = district.value;
    S.rain = rain.status === "fulfilled" ? rain.value : null;
    S.elev = elev.status === "fulfilled" ? elev.value : null;
    renderAll();
  }

  function selectDate(date) {
    if (!DATES.includes(date) || !S.place) return;
    S.date = date;
    writeHash();
    renderAll();
  }

  /* ================= Rendering ================= */
  function renderAll() {
    if (!S.sites.some(id => modelById[id])) { $("#wStatus").innerHTML = "<p class='error'>" + T("River data isn't available right now. Please try Refresh in a moment.") + "</p>"; return; }
    renderHead();
    renderCalendar();
    renderOfficial();
    renderStatus();
    renderMapWidget();
    renderTodo();
    renderUpDown();
    renderFlowChart();
    renderRain();
    renderNote();
  }

  function renderHead() {
    const p = S.place, river = RN(S.pos.river);
    $("#dhName").textContent = window.I18N.place(p.name);
    $("#dhKicker").textContent = S.pos.offKm > 20
      ? T("About {km} km from the nearest river we follow ({river})", { km: Math.round(S.pos.offKm), river })
      : T(S.pos.offKm < 2 ? "On the {river} river" : "Near the {river} river", { river }) + (Net.endsAtSea(S.pos.river) ? T(" · about {km} km from the sea", { km: Math.round(Net.seaKm(S.pos)) }) : "");
    const omPlaces = [{ lat: p.lat, lon: p.lon, name: p.name }].concat([...S.up, ...S.down].map(x => x.type === "dam"
      ? { lat: window.DAM_LOCATIONS[x.id].lat, lon: window.DAM_LOCATIONS[x.id].lon, name: T("{name} dam", { name: (window.DAM_BASE.find(d => d.id === x.id) || {}).name }) }
      : { lat: siteById[x.id].lat, lon: siteById[x.id].lon, name: siteName(x.id) }));
    $("#omBtn").outerHTML = organicButton(omPlaces, "Organic Maps").replace("<a ", "<a id='omBtn' title='" + esc(T("Open your place, and the dams and towns up and down the river, in the free offline Organic Maps app")) + "' ");
    $("#dataTime").textContent = flowsMeta.at ? T("Updated {time} IST", { time: new Date(flowsMeta.at).toLocaleTimeString(loc(), { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) }) : "";
  }

  function renderCalendar() {
    const strip = $("#calStrip");
    strip.innerHTML = DATES.map(d => {
      const t = tenseOf(d), o = dateObj(d);
      const st = Object.keys(modelById).length && S.near ? placeOn(d).plain : "unknown";
      return "<button type='button' class='cal-day " + t + (d === S.date ? " on" : "") + "' data-date='" + d + "' aria-pressed='" + (d === S.date) + "' aria-label='" + esc(longDate(d) + (t === "future" ? T(", forecast") : "")) + "'>" +
        "<span class='cd-wd'>" + (t === "today" ? T("Today") : o.toLocaleDateString(loc(), { weekday: "short" })) + "</span>" +
        "<span class='cd-n'>" + o.getDate() + "</span>" +
        "<span class='cd-m'>" + (o.getDate() === 1 || d === DATES[0] || t === "today" ? o.toLocaleDateString(loc(), { month: "short" }) : "&nbsp;") + "</span>" +
        "<span class='cd-dot " + st + "' aria-hidden='true'></span></button>";
    }).join("");
    // Centre the chosen day in the strip (positions measured on screen, as the strip isn't the offset parent).
    const on = strip.querySelector(".on");
    if (on) {
      const sr = strip.getBoundingClientRect(), or = on.getBoundingClientRect();
      strip.scrollLeft += or.left - sr.left - (sr.width - or.width) / 2;
    }
    const input = $("#calInput");
    input.min = DATES[0]; input.max = DATES[DATES.length - 1]; input.value = S.date;
  }

  function renderStatus() {
    const st = placeOn(S.date), near = st.near, fo = near.fo, p = PLAIN[st.plain];
    const prev = siteOn(S.near, addDays(S.date, -1)).fo;
    const change = fo && prev && prev.value != null && fo.value != null
      ? T(fo.value > prev.value * 1.08 ? "▲ Rising since the day before" : fo.value < prev.value * 0.92 ? "▼ Going down since the day before" : "▬ About the same as the day before") : "";
    const along = Math.round(Net.alongKm(sitePos[S.near], S.pos));
    $("#wStatus").innerHTML = head("Water near you", "the water near you") +
      "<div class='ws-date'>" + esc(dateKicker(S.date)) + "</div>" +
      "<div class='ws-main'>" + I.meter(st.plain) + "<div>" + (p.colour ? "<div class='ws-colour " + st.plain + "'>" + T(p.colour) + "</div>" : "") + "<div class='ws-word " + st.plain + "'>" + T(p.word) + "</div><p class='ws-line'>" + esc(T(p.line)) + "</p></div></div>" +
      "<p class='ws-basis" + (st.fromOfficial ? " official" : "") + "'>" + esc(st.fromOfficial
        ? T("Based on the official alert for {district} district.", { district: distName(S.district) })
        : T("Our estimate from river and rain data. Not an official warning.")) + "</p>" +
      (fo && fo.ratio ? "<div class='ws-amount'><div class='ws-glass'>" + I.glasses(fo.ratio) + "</div><div>" + T("<b>{amount}</b> for this time of year.", { amount: esc(T(amountWords(fo.ratio))) }) +
        (change ? "<div class='trend " + (change[0] === "▲" ? "rising" : change[0] === "▼" ? "falling" : "") + "'>" + change + "</div>" : "") + "</div></div>" : "") +
      "<p class='ws-where'>" + T(along <= 1 ? "Measured on the {river} near <b>{town}</b>."
        : Net.flowsPast(sitePos[S.near], S.pos) ? "Measured on the {river} near <b>{town}</b>, about {km} km upstream of you along the river."
        : "Measured on the {river} near <b>{town}</b>, about {km} km downstream of you along the river.",
        { river: esc(RN(sitePos[S.near].river)), town: esc(townLabel(S.near)), km: along }) + "</p>" +
      (S.elev != null ? "<p class='ws-ground'>" + T("Your land: about {m} m above the sea.", { m: fmt(S.elev, 0) }) + " " + esc(T(groundWords(S.elev))) + "</p>" : "") +
      "<div class='stamps'>" + stamp(tenseOf(S.date) === "future" ? "Forecast" : "Model data", flowsMeta.at, flowsMeta.stale) + "</div>" +
      techPanel(fo ? techRows([
        ["Date", esc(S.date) + (fo.forecast ? T(" (forecast)") : "")],
        ["River flow", fmt(fo.value, 1) + " m³/s"],
        ["Usual for this date", fmt(fo.clim.median, 1) + " m³/s <span class='muted'>" + T("(median, ±15 days, {n} yrs)", { n: Live.CLIM_YEARS }) + "</span>"],
        ["Usual range (p10–p90)", fmt(fo.clim.p10, 1) + " – " + fmt(fo.clim.p90, 1) + " m³/s"],
        ["Compared with usual", fmt(fo.ratio * 100, 0) + "%"],
        ["Model class", esc(T(fo.cls.label)) + " <span class='muted'>" + esc(T("→ counted as {word}", { word: T(PLAIN[toPlain(modelKey(fo.cls.key))].word) })) + "</span>"],
        ["Rain that day", rainOn(S.date) != null ? fmt(rainOn(S.date), 1) + " mm" : "—"],
        ["Measuring point", esc(siteById[S.near].name) + " <span class='muted'>(" + fmt(modelById[S.near].gridLat, 3) + ", " + fmt(modelById[S.near].gridLon, 3) + ")</span>"],
        ["Your place", fmt(S.place.lat, 4) + ", " + fmt(S.place.lon, 4) + " <span class='muted'>" + T("({km} km from the river line)", { km: fmt(S.pos.offKm, 1) }) + "</span>"]
      ]) : "<p>" + T("No data.") + "</p>");
  }

  function renderTodo() {
    const st = placeOn(S.date).plain;
    $("#wTodo").innerHTML = head("What to do") +
      (tenseOf(S.date) === "past" ? "<p class='w-note'>" + esc(T("This is how it was on {date}. For today's advice, choose Today.", { date: shortDate(S.date) })) + "</p>" : "") +
      "<ul class='todo-list'>" + TODO[st].map(t => "<li><span aria-hidden='true'>" + t[0] + "</span>" + esc(T(t[1])) + "</li>").join("") + "</ul>";
  }

  function upDownItem(x, dir, dams) {
    const dist = x.away ? T("{n} km away", { n: Math.max(1, Math.round(x.km)) }) : x.km < 1 ? T("close by") : T("{n} km " + dir, { n: Math.round(x.km) });
    if (x.type === "dam") {
      const d = dams.find(y => y.id === x.id);
      const open = (d.release || 0) > 0 || gatesOpen(d);
      return "<li class='ud-item dam'><span class='ud-icon map-dam alert-" + (d.alert || "none") + (d.missing ? " missing" : "") + "' aria-hidden='true'></span>" +
        "<div class='ud-body'><div class='ud-top'><b>" + esc(d.name) + "</b><span class='ud-dist'>" + dist + "</span></div>" +
        (d.storagePct != null ? "<div class='ud-fill'><span class='ds-bar'><i style='width:" + d.storagePct + "%'></i></span><span>" + d.storagePct + "% · " + esc(T(fillWords(d.storagePct))) + "</span></div>" : "") +
        (levelLine(d) ? "<div class='ud-line'>" + esc(levelLine(d)) + "</div>" : "") +
        "<div class='ud-line" + (open ? " open" : "") + "'>" + esc(T(releaseWords(d))) + "</div>" +
        (ownSource(d) ? "<div class='stamps'>" + ownSource(d) + "</div>" : "") +
        (d.alert && d.alert !== "none" ? "<span class='badge dam-" + d.alert + "'>" + T(cap(d.alert) + " alert") + "</span>" : "") +
        "</div></li>";
    }
    const s = siteOn(x.id, S.date);
    return "<li class='ud-item site'><span class='ud-icon dot " + s.plain + "' aria-hidden='true'></span>" +
      "<div class='ud-body'><div class='ud-top'><b>" + esc(townLabel(x.id)) + "</b><span class='ud-dist'>" + dist + "</span></div>" +
      "<div class='ud-line'>" + badge(s.plain) + " " + esc(T(s.fo && s.fo.ratio ? amountWords(s.fo.ratio) : "No reading")) + "</div></div></li>";
  }

  function upDownTech(items, dams) {
    return techRows(items.map(x => {
      if (x.type === "dam") {
        const d = dams.find(y => y.id === x.id);
        if (d.source === "CEA" && !d.missing) return [d.name, fmt(d.level, 2) + " ft (" + fmt(d.levelM, 2) + " m) / FRL " + fmt(d.frl, 0) + " ft · permitted " + fmt(d.permitted, 0) + " ft · live storage " + fmt(d.storageMcm, 1) + " of " + fmt(d.capacityMcm, 1) + " MCM · CEA, " + timeText(d.asOf)];
        return [d.name, d.missing ? "—" : fmt(d.level, 2) + " " + d.unit + (d.frl != null ? " / FRL " + fmt(d.frl, 2) : "") + " · " + T("release") + " " + fmt(d.release || 0, 1) + " m³/s"];
      }
      const s = siteOn(x.id, S.date);
      return [siteName(x.id), s.fo ? fmt(s.fo.value, 0) + " m³/s · " + T("{n}% of usual", { n: fmt(s.fo.ratio * 100, 0) }) : "—"];
    }));
  }

  function renderUpDown() {
    const dd = damsOn(S.date), dams = dd.dams;
    const stamps = "<div class='stamps'>" + (dd.asOf ? stamp(dd.note || "Official dam table", dd.asOf, !!dd.note) : "<span class='stamp stale'>" + esc(T(dd.note || "No dam data")) + "</span>") + "</div>";
    const riverName = RN(S.pos.river);
    $("#wUp").innerHTML = head("Upstream · where your water comes from", "upstream") +
      (S.up.length ? "<ul class='ud-list'>" + S.up.map(x => upDownItem(x, "upstream", dams)).join("") + "</ul>"
        : "<p class='w-note'>" + (S.pos.idx < 0.3 * (window.RIVER_LINES[S.pos.river].main.length - 1)
          ? T("Nothing upstream is measured: you are near where the {river} begins.", { river: esc(riverName) })
          : T("No dam or measuring point upstream on the {river}. It is a small river; heavy rain nearby matters most here.", { river: esc(riverName) })) + "</p>") +
      (S.nearDams.length ? "<p class='w-sub'>" + T("Other dams nearby") + "</p><ul class='ud-list'>" + S.nearDams.map(x => upDownItem(x, "", dams)).join("") + "</ul>" +
        "<p class='w-note'>" + T("Their river isn't on our map, so we can't say whether their water reaches you.") + "</p>" : "") +
      (S.up.concat(S.nearDams).some(x => x.type === "dam") ? stamps : "") + techPanel(upDownTech(S.up.concat(S.nearDams), dams));
    const seaKm = Math.round(Net.seaKm(S.pos));
    $("#wDown").innerHTML = head("Downstream · where it goes next", "downstream") +
      (S.down.length ? "<ul class='ud-list'>" + S.down.map(x => upDownItem(x, "downstream", dams)).join("") + "</ul>" : "") +
      "<p class='w-note'>" + (!Net.endsAtSea(S.pos.river)
        ? (seaKm > 1 ? T("Our map follows the river about {km} km further. Beyond that it leaves Kerala, or OpenStreetMap doesn't name its lower course.", { km: seaKm }) : T("This is where our map of the river ends: it leaves Kerala here, or OpenStreetMap doesn't name its lower course."))
        : T("The water reaches {dest} about {km} km downstream.", { km: seaKm, dest: T(S.basin === "pamba" ? "Vembanad Lake and then the sea" : S.basin === "periyar" ? "the sea near Kochi" : "the sea or the backwaters") })) + "</p>" +
      (S.down.some(x => x.type === "dam") ? stamps : "") + techPanel(upDownTech(S.down, dams));
  }

  function renderFlowChart() {
    const r = modelById[S.near];
    const w = 640, h = 150, pad = 6, n = DATES.length;
    const pts = DATES.map(d => Live.flowOn(r, d));
    const max = Math.max(...pts.map(p => Math.max(p.value || 0, p.clim.p90 || 0))) * 1.12 || 1;
    const x = i => pad + (i / (n - 1)) * (w - 2 * pad), y = v => h - 24 - (v / max) * (h - 34);
    const band = pts.map((p, i) => x(i) + "," + y(p.clim.p90)).join(" ") + " " + pts.map((p, i) => x(i) + "," + y(p.clim.p10)).reverse().join(" ");
    const ti = DATES.indexOf(TODAY), si = DATES.indexOf(S.date);
    const line = (from, to) => pts.slice(from, to + 1).map((p, k) => p.value == null ? "" : (k ? "L" : "M") + x(from + k).toFixed(1) + "," + y(p.value).toFixed(1)).join("");
    const cls = Live.flowOn(r, S.date);
    $("#wFlow").innerHTML = head("River water · past month and next week", "the river water chart") +
      "<svg class='flow-chart' viewBox='0 0 " + w + " " + h + "' role='img' aria-label='" + esc(T("River water near you over the past 30 days and the next 7 days. Tap a day to choose it.")) + "'>" +
        "<polygon class='fc-band' points='" + band + "'/>" +
        "<path class='fc-med' d='" + pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(p.clim.median).toFixed(1)).join("") + "'/>" +
        "<rect class='fc-future' x='" + x(ti) + "' y='0' width='" + (w - pad - x(ti)) + "' height='" + (h - 24) + "'/>" +
        "<path class='fc-line' d='" + line(0, ti) + "'/><path class='fc-line fc' d='" + line(ti, n - 1) + "'/>" +
        "<line class='fc-today' x1='" + x(ti) + "' x2='" + x(ti) + "' y1='0' y2='" + (h - 24) + "'/>" +
        "<line class='fc-sel' x1='" + x(si) + "' x2='" + x(si) + "' y1='0' y2='" + (h - 24) + "'/>" +
        (cls.value != null ? "<circle class='fc-dot' cx='" + x(si) + "' cy='" + y(cls.value) + "' r='5'/>" : "") +
        "<text x='" + pad + "' y='" + (h - 6) + "'>" + T("30 days ago") + "</text><text x='" + x(ti) + "' y='" + (h - 6) + "' text-anchor='middle'>" + T("Today") + "</text><text x='" + (w - pad) + "' y='" + (h - 6) + "' text-anchor='end'>" + T("+7 days") + "</text>" +
        DATES.map((d, i) => "<rect class='fc-hit' data-date='" + d + "' x='" + (x(i) - (w - 2 * pad) / (n - 1) / 2) + "' y='0' width='" + ((w - 2 * pad) / (n - 1)) + "' height='" + h + "'><title>" + esc(longDate(d)) + "</title></rect>").join("") +
      "</svg>" +
      "<p class='w-note'>" + T("The grey band is the usual amount for the time of year. Solid line: recorded. Dashed: forecast. Tap a day to see it.") + "</p>" +
      techPanel(techRows(DATES.filter((d, i) => i % 3 === 0 || d === S.date).map(d => { const p = Live.flowOn(r, d); return [d, T("{v} m³/s (usual {u})", { v: fmt(p.value, 0), u: fmt(p.clim.median, 0) })]; })));
  }

  function renderRain() {
    if (!S.rain) { $("#wRain").innerHTML = head("Rain") + "<p class='w-note'>" + T("Rain data isn't available right now.") + "</p>"; return; }
    const mm = rainOn(S.date), words = rainWords(mm, tenseOf(S.date));
    const vals = DATES.map(rainOn), max = Math.max(20, ...vals.filter(v => v != null));
    $("#wRain").innerHTML = head("Rain at your place", "rain") +
      "<div class='wr-main'><span class='wr-icon' aria-hidden='true'>" + words.icon + "</span><div><b>" + esc(T(words.text)) + "</b><div class='muted small'>" + esc(longDate(S.date)) + "</div></div></div>" +
      "<div class='rain-strip' role='img' aria-label='" + esc(T("Daily rain over the past month and next week")) + "'>" + DATES.map((d, i) => {
        const v = vals[i];
        return "<button type='button' class='rs-bar " + tenseOf(d) + (d === S.date ? " on" : "") + "' data-date='" + d + "' title='" + esc(shortDate(d)) + ": " + (v == null ? T("no data") : fmt(v, 1) + " mm") + "'>" +
          "<i style='height:" + (v == null ? 0 : Math.max(2, v / max * 100)) + "%'></i></button>";
      }).join("") + "</div>" +
      "<div class='rs-axis'><span>" + T("30 days ago") + "</span><span>" + T("Today") + "</span><span>+7</span></div>" +
      techPanel(techRows([[shortDate(S.date), mm != null ? fmt(mm, 1) + " mm" : "—"], ["Heavy rain (IMD)", T("≥ {n} mm a day", { n: "64.5" })], ["Very heavy (IMD)", T("≥ {n} mm a day", { n: "115.6" })]]));
  }

  /* ================= Official alerts box ================= */
  function renderOfficial() {
    const box = $("#official"), d = DIST[S.district];
    if (!d) { box.innerHTML = ""; return; }
    const list = S.date >= TODAY ? alertsOn(S.district, S.date) : [];
    const ml = window.I18N.lang === "ml", district = esc(distName(S.district));
    const fetched = (window.OFFICIAL_ALERTS || {}).fetchedAt;
    box.className = "official" + (list.length ? " lvl-" + list[0].level : "");
    // Titles and links stay in English (with the English district name); messages are translated.
    const districtEn = esc(d.name);
    box.innerHTML = "<div class='of-head'><span class='w-title'>" + T("Official alerts · {district} district", { district: districtEn }) + "</span>" +
        (fetched ? stamp("Checked", fetched, Date.now() - new Date(fetched) > 3 * 3600e3) : "") + "</div>" +
      (list.length
        ? "<ul class='of-list'>" + list.map(a => "<li class='of-item lvl-" + a.level + "'><span class='of-tag'>" + T(cap(a.level)) + "</span>" +
            "<div><b>" + esc(ml ? a.ml : a.en) + "</b><div class='of-meta'>" + esc(T("{source} · until {time}", { source: a.source, time: timeText(a.expires) })) + "</div></div></li>").join("") + "</ul>"
        : "<p class='of-none'>" + (S.date < TODAY ? T("Official alerts aren't kept for past dates.") : T("No official alert for {district} district right now.", { district })) + "</p>") +
      "<div class='of-links'><a href='" + esc(d.web) + "' target='_blank' rel='noopener'>" + T("District Collector, {district}", { district: districtEn }) + " ↗</a>" +
        "<a href='https://sachet.ndma.gov.in' target='_blank' rel='noopener'>" + T("All alerts on SACHET") + " ↗</a>" +
        "<a href='https://sdma.kerala.gov.in' target='_blank' rel='noopener'>KSDMA ↗</a></div>";
  }

  /* ================= Suggestions: places under an official alert ================= */
  // After "Use where I am now", the home page lists only places with an alert in force,
  // most severe first: districts under an IMD/KSDMA alert and dams under a KSEB/Irrigation alert.
  function renderSuggestions() {
    const items = [], seen = {};
    activeAlerts().forEach(a => (a.statewide ? Object.keys(DIST) : a.districts).forEach(k => {
      if (seen[k] != null && seen[k] >= RANK[a.level]) return;
      seen[k] = RANK[a.level];
    }));
    Object.entries(seen).forEach(([k, rank]) => {
      const level = Object.keys(RANK).find(l => RANK[l] === rank);
      items.push({ rank, level, name: DIST[k].name, lat: DIST[k].hq[0], lon: DIST[k].hq[1],
        label: T("{name} · {colour} alert", { name: distName(k), colour: T(cap(level)) }) });
    });
    B.dams.filter(d => ["red", "orange", "blue"].includes(d.alert) && window.DAM_LOCATIONS[d.id]).forEach(d => items.push({
      rank: RANK[d.alert], level: d.alert, name: T("{name} dam", { name: d.name }), lat: window.DAM_LOCATIONS[d.id].lat, lon: window.DAM_LOCATIONS[d.id].lon,
      label: T("{name} dam · {colour} alert", { name: d.name, colour: T(cap(d.alert)) }) }));
    items.sort((a, b) => b.rank - a.rank);
    $("#quickPlaces").innerHTML = items.length
      ? items.slice(0, 8).map(x => "<button type='button' class='chip chip-alert lvl-" + x.level + "' data-lat='" + x.lat + "' data-lon='" + x.lon + "' data-name='" + esc(x.name) + "'><i aria-hidden='true'></i>" + esc(x.label) + "</button>").join("")
      : "<span class='quick-none'>" + T("No official alerts in Kerala right now") + "</span>";
  }

  /* ================= Map widget ================= */
  // The map colours only the points loaded for this place; other rivers are drawn plain.
  const loadedPoints = () => Object.fromEntries(S.sites.filter(id => modelById[id]).map(id => [id, { lat: siteById[id].lat, lon: siteById[id].lon, river: siteById[id].river }]));
  function pointPopup(id, title) {
    const s = siteOn(id, S.date);
    return "<div class='pop'><div class='pop-top'><b>" + esc(title || townLabel(id)) + "</b>" + badge(s.plain) + "</div>" +
      "<p>" + esc(s.fo && s.fo.ratio ? T("{amount} for this time of year.", { amount: T(amountWords(s.fo.ratio)) }) : T("No reading.")) + "</p>" +
      "<p class='muted small'>" + esc(dateKicker(S.date)) + "</p>" + organicButton([{ lat: siteById[id].lat, lon: siteById[id].lon, name: siteName(id) }]) + "</div>";
  }
  function damPopup(d) {
    return "<div class='pop'><div class='pop-top'><b>" + esc(d.name) + "</b>" + (d.alert && d.alert !== "none" ? "<span class='badge dam-" + d.alert + "'>" + T(cap(d.alert) + " alert") + "</span>" : "") + "</div>" +
      (d.storagePct != null ? "<p><b>" + d.storagePct + "%</b> · " + esc(T(fillWords(d.storagePct))) + "</p>" : "") +
      (levelLine(d) ? "<p>" + esc(levelLine(d)) + "</p>" : "") + (ownSource(d) ? "<div class='stamps'>" + ownSource(d) + "</div>" : "") +
      "<p>" + esc(T(releaseWords(d))) + ".</p><p class='muted small'>" + esc(DAM_ABOUT[d.id] ? T(DAM_ABOUT[d.id]) : d.district ? T("{kind} in {district} district.", { kind: T(cap(d.kind)), district: d.district }) : "") + "</p>" +
      organicButton([{ lat: window.DAM_LOCATIONS[d.id].lat, lon: window.DAM_LOCATIONS[d.id].lon, name: T("{name} dam", { name: d.name }) }]) + "</div>";
  }
  function renderMapWidget() {
    const dams = damsOn(S.date).dams, status = placeOn(S.date).plain;
    window.FloodMap.render($("#riverMap"), {
      points: loadedPoints(), dams,
      towns: S.sites.filter(id => modelById[id]).map(id => ({ id, lat: siteById[id].lat, lon: siteById[id].lon, town: townLabel(id) })),
      flowOf: id => { const s = siteOn(id, S.date); return s.fo && s.fo.value || 0; },
      statusOf: id => siteOn(id, S.date).plain,
      damPopup, pointPopup: id => pointPopup(id),
      riverPopup: (river, id) => pointPopup(id, T("{river} near {town}", { river: RN(river), town: townLabel(id) })),
      focusBasin: Net.BASIN_OF(S.pos.river)
    });
    window.FloodMap.showPlace(S.place, status, !S.zoomed);
    S.zoomed = true;
  }

  function renderNote() {
    $("#dashNote").innerHTML = T("Dam levels come from the official KSEB and Irrigation tables published by {ksdma}; past dates show the table saved that day. River water is from a computer model (Open-Meteo / GloFAS): recorded for past days, forecast for the next 7. Official river gauge readings aren't connected yet.",
      { ksdma: "<a href='https://sdma.kerala.gov.in/dam-water-level/' target='_blank' rel='noopener'>KSDMA</a>" });
  }

  /* ================= Page states and links ================= */
  function showState(state) {
    document.body.classList.toggle("is-home", state === "home");
    document.body.classList.toggle("is-dash", state === "dash");
    $("#dash").hidden = state !== "dash";
    $("#guide").hidden = state !== "guide";
    if (state !== "home") $("main").scrollIntoView({ block: "start" });
  }
  function writeHash() {
    const p = S.place;
    const h = "#place=" + encodeURIComponent(p.name) + "&lat=" + p.lat.toFixed(4) + "&lon=" + p.lon.toFixed(4) + (S.date !== TODAY ? "&date=" + S.date : "");
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function route() {
    const h = location.hash.slice(1);
    if (h === "guide") return showState("guide");
    const q = new URLSearchParams(h);
    if (q.get("place") && q.get("lat")) {
      const place = { name: q.get("place"), lat: +q.get("lat"), lon: +q.get("lon") };
      if (!S.place || S.place.name !== place.name) return openPlace(place, q.get("date"));
      return selectDate(q.get("date") || TODAY);
    }
    showState("home");
  }
  addEventListener("hashchange", route);
  $("#homeLink").addEventListener("click", e => { e.preventDefault(); history.pushState(null, "", location.pathname); S.place = null; showState("home"); $("#riskInput").focus(); });

  /* ================= Search ================= */
  $("#placeList").innerHTML = (window.KERALA_PLACES || []).map(p => "<option value='" + esc(p[0]) + "'>").join("");
  renderSuggestions();
  $("#collectorLinks").innerHTML = Object.keys(DIST).map(k => "<a href='" + esc(DIST[k].web) + "' target='_blank' rel='noopener' data-district='" + k + "'>" + esc(distName(k)) + "</a>").join("");

  function choose(place) {
    history.pushState(null, "", "#place=" + encodeURIComponent(place.name) + "&lat=" + place.lat.toFixed(4) + "&lon=" + place.lon.toFixed(4));
    openPlace(place, TODAY);
  }
  async function searchText(text) {
    const btn = $("#riskForm .primary");
    btn.disabled = true;
    try {
      const place = await Live.geocode(text);
      if (!place) alertMsg(T("We couldn't find “{text}”. Try the name of a nearby town.", { text }));
      else choose(place);
    } catch (e) {
      alertMsg(T("Something went wrong. Please check your internet and try again."));
    } finally { btn.disabled = false; }
  }
  function alertMsg(text) {
    let el = $("#searchMsg");
    if (!el) { el = document.createElement("p"); el.id = "searchMsg"; el.className = "search-msg"; el.setAttribute("role", "alert"); $(".hero-body").appendChild(el); }
    el.textContent = text;
  }
  $("#riskForm").addEventListener("submit", e => { e.preventDefault(); searchText($("#riskInput").value.trim()); });
  $("#quickPlaces").addEventListener("click", e => { const b = e.target.closest("[data-lat]"); if (b) choose({ name: b.dataset.name, lat: +b.dataset.lat, lon: +b.dataset.lon }); });
  $("#geoBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return alertMsg(T("Your phone or browser can't share location. Please type your town name."));
    navigator.geolocation.getCurrentPosition(
      pos => choose({ name: T("Your location"), lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4) }),
      () => alertMsg(T("We couldn't get your location. Please type your town name instead.")),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });

  /* ================= Calendar and date controls ================= */
  $("#dash").addEventListener("click", e => {
    const t = e.target.closest("[data-date]");
    if (t && !t.closest(".leaflet-container")) return selectDate(t.dataset.date);
    const step = e.target.closest("[data-step]");
    if (step) return selectDate(addDays(S.date, +step.dataset.step));
  });
  $("#calToday").addEventListener("click", () => selectDate(TODAY));
  $("#calInput").addEventListener("change", e => selectDate(e.target.value));
  document.addEventListener("keydown", e => {
    if ($("#dash").hidden || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (e.key === "ArrowLeft" && e.target.closest(".cal")) selectDate(addDays(S.date, -1));
    if (e.key === "ArrowRight" && e.target.closest(".cal")) selectDate(addDays(S.date, 1));
  });

  $("#shareBtn").addEventListener("click", async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: "Kerala Flood Watch: " + S.place.name, url });
      else { await navigator.clipboard.writeText(url); $("#shareBtn").textContent = T("Link copied"); setTimeout(() => { $("#shareBtn").textContent = T("Share"); }, 1800); }
    } catch (e) { /* cancelled */ }
  });

  /* ================= Refresh ================= */
  function reloadScript(src) {
    return new Promise(resolve => {
      const sc = document.createElement("script");
      sc.src = src + "?t=" + Date.now();
      sc.onload = () => { sc.remove(); resolve(true); };
      sc.onerror = () => { sc.remove(); resolve(false); };
      document.head.appendChild(sc);
    });
  }
  $("#refreshBtn").addEventListener("click", async () => {
    const btn = $("#refreshBtn");
    if (btn.disabled || !S.place) return;
    btn.disabled = true; btn.classList.add("spinning");
    $("#dataTime").textContent = T("Refreshing…");
    Live.clearCache();
    await Promise.all([reloadScript(window.LIVE_DATA + "bulletin.js"), reloadScript(window.LIVE_DATA + "history.js"), reloadScript(window.LIVE_DATA + "alerts.js")]);
    window.applyLiveBulletin(window.LIVE_BULLETIN);
    renderSuggestions();
    flows = loadFlows(S.sites, S.basin);
    const [, rain] = await Promise.allSettled([flows, Live.rainfall(S.place.lat, S.place.lon)]);
    if (rain.status === "fulfilled") S.rain = rain.value;
    renderAll();
    btn.disabled = false; btn.classList.remove("spinning");
  });

  // Switching language redraws the open dashboard in place (same place, same date).
  window.I18N.onChange(() => {
    renderSuggestions();
    $$("#collectorLinks [data-district]").forEach(a => { a.textContent = distName(a.dataset.district); });
    if (S.place && !$("#dash").hidden && S.sites.some(id => modelById[id])) renderAll();
    const msg = $("#searchMsg"); if (msg) msg.remove();
  });
  window.I18N.applyStatic();

  route();
})();
