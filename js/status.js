/*
 * Dam readings. Every dam with a known position (data/dams.js) is listed; today's official
 * KSEB and Irrigation tables (data/bulletin.js, written by scripts/fetch_dams.py) fill in
 * the readings. A dam missing from the tables is marked as such, never given made-up numbers.
 * Official river gauge readings (CWC) are not connected, so towns use the river forecast.
 */
(function () {
  const L = window.DAM_LOCATIONS || {};
  const titleCase = s => s.replace(/-irrigation$/, "").replace(/(^|[\s-])\w/g, c => c.toUpperCase());
  const tidy = name => name.replace(/\s*\((Barrage|Regulator)\)/i, " $1");

  // Name and kind for every known dam, from the latest table (or the archive) where possible.
  function damBase(live) {
    const hist = window.DAM_HISTORY || {};
    const fromHistory = id => { for (const day of Object.keys(hist).sort().reverse()) if (hist[day].dams[id] && hist[day].dams[id].name) return hist[day].dams[id]; return null; };
    return Object.keys(L).map(id => {
      const src = (live && live.dams && live.dams[id]) || fromHistory(id) || {};
      const name = tidy(src.name || L[id].name || titleCase(id));
      return { id, name, river: L[id].river || null, kind: src.kind || (/barrage|regulator|spillway/i.test(name) ? "barrage" : "dam"), district: src.district || null };
    });
  }

  window.BULLETIN = { isSample: false, gaugesLive: false, asOf: null, dams: [], gauges: {}, sources: {} };
  window.DAM_BASE = damBase(null);

  /** Apply the latest official tables. Called at load and on every refresh. */
  window.applyLiveBulletin = function (live) {
    const B = window.BULLETIN;
    window.DAM_BASE = damBase(live);
    const dams = (live && live.dams) || {};
    B.asOf = (live && live.asOf) || null;
    B.fetchedAt = live && live.fetchedAt;
    B.sources = (live && live.sources) || {};
    B.dams = window.DAM_BASE.map(d => {
      const l = dams[d.id];
      if (l) return Object.assign({}, l, d, { asOf: l.asOf || live.asOf, stale: !!(l.asOf && live.asOf && l.asOf !== live.asOf) });
      return Object.assign({}, d, { level: null, levelM: null, frl: null, storagePct: null, release: null, alert: "none", missing: true, asOf: null,
        gates: d.id === "mullaperiyar" ? "Not in Kerala's daily dam table (run by Tamil Nadu)" : "Not in today's official dam table" });
    });
    return !!live;
  };
  window.applyLiveBulletin(window.LIVE_BULLETIN);
})();
