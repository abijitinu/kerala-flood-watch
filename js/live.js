/*
 * Live data from Open-Meteo (free, keyless, CORS-enabled):
 *  - Flood API: GloFAS modelled river discharge: the last 30 days, a 7-day forecast, and the same
 *    season in the previous years (to know what is "usual" on any of those dates)
 *  - Forecast API: daily rainfall, 30 days back and 7 days ahead
 *  - Elevation API: ground elevation (Copernicus DEM, 90 m)
 * Plus OpenStreetMap Nominatim for addresses not in the local gazetteer.
 */
(function () {
  const cache = new Map();

  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Cached per session; retries on 429 because Open-Meteo's free tier is rate limited.
  async function getJSON(url) {
    if (cache.has(url)) return cache.get(url);
    const p = (async () => {
      try { const hit = sessionStorage.getItem(url); if (hit) return JSON.parse(hit); } catch (e) { /* storage unavailable */ }
      for (let attempt = 0; ; attempt++) {
        const r = await fetch(url);
        if (r.status === 429 && attempt < 3) { await wait(2000 * (attempt + 1)); continue; }
        if (!r.ok) throw new Error("HTTP " + r.status + " from " + new URL(url).host);
        const data = await r.json();
        try { sessionStorage.setItem(url, JSON.stringify(data)); } catch (e) { /* quota or unavailable */ }
        return data;
      }
    })();
    cache.set(url, p);
    p.catch(() => cache.delete(url));
    return p;
  }

  function quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  const CLIM_YEARS = 5;
  const PAST_DAYS = 30, AHEAD_DAYS = 7, CLIM_WINDOW = 15;
  const doyOf = d => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
  const parseDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

  function floodURL(points, start, end) {
    return "https://flood-api.open-meteo.com/v1/flood?latitude=" + points.map(p => p.lat).join(",") +
      "&longitude=" + points.map(p => p.lon).join(",") +
      "&daily=river_discharge&start_date=" + isoDate(start) + "&end_date=" + isoDate(end);
  }
  const asList = d => Array.isArray(d) ? d : [d];

  /**
   * River flow for each point over the last 30 days and the 7-day forecast, plus samples
   * from the same season in earlier years so any of those dates can be compared with what
   * is usual for that time of year. Many points share one request per window, which keeps
   * us inside Open-Meteo's free rate limit.
   */
  async function dischargeMany(points) {
    const today = new Date();
    const shift = (d, days, years = 0) => { const x = new Date(d); x.setFullYear(x.getFullYear() - years); x.setDate(x.getDate() + days); return x; };

    const current = asList(await getJSON(floodURL(points, shift(today, -PAST_DAYS), shift(today, AHEAD_DAYS))));
    // [day-of-year, flow] pairs from earlier years, wide enough to cover ±15 days around every date we show.
    const samples = points.map(() => []);
    for (let y = 1; y <= CLIM_YEARS; y++) {
      const past = asList(await getJSON(floodURL(points, shift(today, -PAST_DAYS - CLIM_WINDOW, y), shift(today, AHEAD_DAYS + CLIM_WINDOW, y))));
      past.forEach((loc, i) => loc.daily.time.forEach((t, k) => {
        const v = loc.daily.river_discharge[k];
        if (v != null) samples[i].push([doyOf(parseDay(t)), v]);
      }));
    }

    return current.map((data, i) => {
      const t = data.daily.time, v = data.daily.river_discharge;
      let idx = t.indexOf(isoDate(today));
      if (idx < 0) idx = PAST_DAYS;
      const r = { gridLat: data.latitude, gridLon: data.longitude, recent: { times: t, values: v, todayOffset: idx }, climSamples: samples[i] };
      const clim = climFor(r, t[idx]);
      const ahead = v.slice(idx).map(x => x == null ? -Infinity : x);
      const peak = Math.max(...ahead);
      return Object.assign(r, {
        today: v[idx], peak, peakDate: t[idx + ahead.indexOf(peak)], clim,
        ratio: v[idx] / clim.median, peakRatio: peak / clim.median
      });
    });
  }

  /** What is usual for this point around a given date (same ±15 days in earlier years). */
  function climFor(r, dateStr) {
    const target = doyOf(parseDay(dateStr));
    const s = r.climSamples.filter(([d]) => { const diff = Math.abs(d - target); return Math.min(diff, 365 - diff) <= CLIM_WINDOW; })
      .map(x => x[1]).sort((a, b) => a - b);
    return { p10: quantile(s, 0.1), median: quantile(s, 0.5), p90: quantile(s, 0.9), max: s[s.length - 1], n: s.length };
  }

  /** Flow on a given date and how it compares with usual for that date. */
  function flowOn(r, dateStr) {
    const k = r.recent.times.indexOf(dateStr);
    const value = k < 0 ? null : r.recent.values[k];
    const clim = climFor(r, dateStr);
    return { value, clim, ratio: value != null ? value / clim.median : null, forecast: k > r.recent.todayOffset, cls: classifyFlow(value, clim) };
  }

  const discharge = (lat, lon) => dischargeMany([{ lat, lon }]).then(r => r[0]);

  function classifyFlow(value, clim) {
    if (!(clim.median > 0) || value == null) return { key: "unknown", label: "No data" };
    if (value >= clim.max) return { key: "danger", label: "Above 10-year seasonal max" };
    if (value >= clim.p90) return { key: "warning", label: "Much higher than normal" };
    if (value >= clim.median * 1.25) return { key: "elevated", label: "Higher than normal" };
    if (value <= clim.median * 0.75) return { key: "low", label: "Lower than normal" };
    return { key: "normal", label: "Near normal" };
  }

  async function rainfall(lat, lon) {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
      "&daily=precipitation_sum&past_days=" + PAST_DAYS + "&forecast_days=" + (AHEAD_DAYS + 1) + "&timezone=Asia%2FKolkata";
    const d = await getJSON(url);
    return { times: d.daily.time, mm: d.daily.precipitation_sum };
  }

  async function elevation(lat, lon) {
    const d = await getJSON("https://api.open-meteo.com/v1/elevation?latitude=" + lat + "&longitude=" + lon);
    return d.elevation[0];
  }

  /** Resolve free text to coordinates: "lat, lon", then the local gazetteer, then Nominatim. */
  async function geocode(query) {
    const q = query.trim();
    const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) return { name: "Coordinates " + (+m[1]).toFixed(4) + ", " + (+m[2]).toFixed(4), lat: +m[1], lon: +m[2], source: "coordinates" };
    const lower = q.toLowerCase();
    const asPlace = p => ({ name: p[0], lat: p[1], lon: p[2], source: "gazetteer" });
    // Kerala's cities, towns and villages (data/places.js); a city or town wins over a village of the same name.
    const places = (window.KERALA_PLACES || []).slice().sort((a, b) => "ctv".indexOf(a[3]) - "ctv".indexOf(b[3]));
    const exact = places.find(p => lower === p[0].toLowerCase());
    if (exact) return asPlace(exact);
    // Partial matches ("Kakkanad, Kochi") are only a fallback so a precise address wins.
    const partial = places.filter(p => p[0].length > 3).find(p => new RegExp("\\b" + p[0].toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(lower));
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in" +
      "&viewbox=74.8,12.9,77.5,8.2&bounded=1&q=" + encodeURIComponent(q);
    let res = [];
    try { res = await getJSON(url); } catch (e) { if (!partial) throw e; }
    if (res.length) return { name: q, lat: +res[0].lat, lon: +res[0].lon, source: "OpenStreetMap" };
    return partial ? asPlace(partial) : null;
  }

  function distanceKm(a, b) {
    const R = 6371, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /** Forget cached responses so the next calls fetch fresh data (used by the refresh button). */
  function clearCache() {
    cache.clear();
    try { Object.keys(sessionStorage).filter(k => k.startsWith("https://")).forEach(k => sessionStorage.removeItem(k)); } catch (e) { /* storage unavailable */ }
  }

  window.Live = { clearCache, discharge, dischargeMany, classifyFlow, climFor, flowOn, rainfall, elevation, geocode, distanceKm, isoDate, PAST_DAYS, AHEAD_DAYS };
})();
