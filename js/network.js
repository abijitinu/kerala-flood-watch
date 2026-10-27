/*
 * River network built from the OpenStreetMap river lines in data/rivers.js (every named
 * river in Kerala). Each line runs source → mouth. A river whose mouth lies on another
 * river's line is a tributary of it; the junction is the parent's nearest vertex. Anything
 * (a place, a dam, a measuring point) is located as {river, idx}: the river line it sits on
 * and the vertex it is nearest to. From that we know what is upstream or downstream of a
 * place and how far away it is along the water.
 */
(function () {
  const R = window.RIVER_LINES;
  const JOIN_KM = 1.5; // a mouth this close to another river counts as joining it

  const kmBetween = (a, b) => {
    const k = Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180);
    return Math.hypot(a[0] - b[0], (a[1] - b[1]) * k) * 111.2;
  };

  // Cumulative distance from the source at each vertex, and each river's total length.
  const cum = {}, length = {};
  Object.entries(R).forEach(([key, r]) => {
    const c = [0];
    for (let i = 1; i < r.main.length; i++) c.push(c[i - 1] + kmBetween(r.main[i - 1], r.main[i]));
    cum[key] = c;
    length[key] = c[c.length - 1];
  });

  function nearestOn(river, lat, lon) {
    const line = R[river].main;
    let best = 0, bd = Infinity;
    line.forEach((q, i) => { const d = kmBetween(q, [lat, lon]); if (d < bd) { bd = d; best = i; } });
    return { river, idx: best, offKm: bd };
  }

  // Which river each river flows into (if any), found from where its mouth lies.
  const PARENT = {}, junction = {};
  Object.entries(R).forEach(([key, r]) => {
    const mouth = r.main[r.main.length - 1];
    const best = Object.keys(R).filter(k => k !== key).map(k => nearestOn(k, mouth[0], mouth[1]))
      // Joining near the other river's own mouth means they share an estuary, not a tributary.
      .filter(p => p.offKm < JOIN_KM && p.idx < R[p.river].main.length - 2)
      .sort((a, b) => a.offKm - b.offKm)[0];
    if (best) { PARENT[key] = best.river; junction[key] = best.idx; }
  });
  // Break any loops (two rivers each "joining" the other): the shorter one keeps its parent.
  Object.keys(PARENT).forEach(key => {
    const seen = new Set([key]);
    let r = PARENT[key];
    while (r && !seen.has(r)) { seen.add(r); r = PARENT[r]; }
    if (r) { const drop = [...seen].sort((a, b) => length[b] - length[a])[0]; delete PARENT[drop]; delete junction[drop]; }
  });

  const BASIN_OF = river => { let r = river; while (PARENT[r]) r = PARENT[r]; return r; };

  // A coarse outline of Kerala's coast. A river system whose end lies near it reaches the sea
  // (or the backwaters behind it); others end inland on our map: east-flowing rivers leaving
  // Kerala, or rivers whose lower course OpenStreetMap doesn't name.
  const COAST = [[8.18, 77.08], [8.5, 76.93], [8.9, 76.55], [9.3, 76.38], [9.6, 76.3], [10.0, 76.2], [10.5, 76.03], [10.9, 75.88],
    [11.3, 75.75], [11.7, 75.53], [12.1, 75.18], [12.5, 74.95], [12.8, 74.85]];
  const toCoastKm = p => Math.min(...COAST.slice(1).map((b, i) => {
    const a = COAST[i], k = Math.cos(p[0] * Math.PI / 180);
    const ax = a[1] * k, ay = a[0], bx = b[1] * k, by = b[0], px = p[1] * k, py = p[0];
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))) * 111.2;
  }));
  const endsAtSea = river => { const m = R[BASIN_OF(river)].main; return toCoastKm(m[m.length - 1]) < 12; };
  const NAMES = Object.fromEntries(Object.entries(R).map(([k, r]) => [k, r.name.charAt(0).toUpperCase() + r.name.slice(1)]));

  /** Nearest river line to a point (optionally restricted to one river). */
  function locate(lat, lon, river) {
    if (river && R[river]) return nearestOn(river, lat, lon);
    return Object.keys(R).map(k => nearestOn(k, lat, lon)).sort((a, b) => a.offKm - b.offKm)[0];
  }

  /** Distance from a position to the sea (or the lake/river mouth the system ends in), following the water. */
  function seaKm(pos) {
    const own = length[pos.river] - cum[pos.river][pos.idx];
    const parent = PARENT[pos.river];
    return own + (parent ? seaKm({ river: parent, idx: junction[pos.river] }) : 0);
  }

  /** The stretches of river water passes through from `pos` to the sea. */
  function pathToSea(pos) {
    const out = [{ river: pos.river, from: pos.idx }];
    let r = pos.river;
    while (PARENT[r]) { out.push({ river: PARENT[r], from: junction[r] }); r = PARENT[r]; }
    return out;
  }

  /** True when water at `a` later flows past `b`. */
  function flowsPast(a, b) {
    return pathToSea(a).some(seg => seg.river === b.river && b.idx >= seg.from);
  }

  const alongKm = (a, b) => Math.abs(seaKm(a) - seaKm(b));
  const riversIn = basin => Object.keys(R).filter(k => BASIN_OF(k) === basin);

  window.RiverNet = { locate, seaKm, flowsPast, alongKm, pathToSea, riversIn, endsAtSea, PARENT, NAMES, BASIN_OF, length };
})();
