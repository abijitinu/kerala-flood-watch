/*
 * Map widget (Leaflet): water only, on plain paper, with no base map underneath. Lakes,
 * lagoons, river banks and reservoirs are the real OpenStreetMap water areas
 * (data/water.js); rivers are black ribbons from data/rivers.js, thicker the more water
 * they carry, with white dashes drifting downstream. A stretch gets a coloured edge only
 * when its status is above "Safe", so a calm day stays black and white. The chosen place
 * is the one magenta accent.
 */
(function () {
  const GRID_STEP = 0.1; // degrees between the cross-hair marks
  const BOUNDS = [[8.15, 74.85], [12.8, 77.45]]; // all of Kerala
  const RIVER_NAMES = window.RiverNet.NAMES;

  let map, waterLayer, gridLayer, layers, placeLayer, legend;

  const dist2 = (a, b) => (a[0] - b[0]) ** 2 + ((a[1] - b[1]) * Math.cos(a[0] * Math.PI / 180)) ** 2;
  function nearestIndex(line, p) {
    let best = 0, bd = Infinity;
    line.forEach((q, i) => { const d = dist2(q, p); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  // Thicker line for more water; square root so big and small rivers both stay readable.
  const widthFor = q => Math.max(2.5, Math.min(11, 2 + Math.sqrt(Math.max(0, q)) * 0.4));

  function init(el) {
    map = L.map(el, { scrollWheelZoom: false, minZoom: 7, maxZoom: 15 });
    map.fitBounds(BOUNDS);
    map.attributionControl.addAttribution('Rivers and water &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    // Water areas and the grid never change, so they are drawn once.
    waterLayer = L.layerGroup((window.WATER_AREAS || []).map(rings =>
      L.polygon(rings, { className: "map-water", interactive: false, smoothFactor: 0.5 }))).addTo(map);
    gridLayer = L.polyline(gridMarks(), { className: "map-grid", interactive: false, weight: 1 }).addTo(map);
    // Other named dams in OpenStreetMap (no official daily reading): small hollow squares.
    const otherIcon = L.divIcon({ className: "", html: "<span class='map-dam other'></span>", iconSize: [9, 9], iconAnchor: [4, 4] });
    L.layerGroup((window.OTHER_DAMS || []).map(([name, lat, lon]) => L.marker([lat, lon], { icon: otherIcon, title: name, keyboard: false })
      .bindTooltip(name + " · no official reading", { direction: "top", offset: [0, -6], className: "map-tip" }))).addTo(map);
    layers = L.layerGroup().addTo(map);
    placeLayer = L.layerGroup().addTo(map);
    // Scroll-zoom only after the person clicks the map, so the page still scrolls normally.
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());
  }

  // Small "+" marks on a regular grid, like a surveyor's sheet. One path for all of them.
  function gridMarks() {
    const out = [], d = 0.0035;
    for (let lat = Math.ceil(BOUNDS[0][0] / GRID_STEP) * GRID_STEP; lat <= BOUNDS[1][0]; lat += GRID_STEP)
      for (let lon = Math.ceil(BOUNDS[0][1] / GRID_STEP) * GRID_STEP; lon <= BOUNDS[1][1]; lon += GRID_STEP) {
        out.push([[lat - d, lon], [lat + d, lon]], [[lat, lon - d], [lat, lon + d]]);
      }
    return out;
  }

  /**
   * Draw rivers, dams and towns. ctx: points (id -> {lat, lon}), flowOf(id), statusOf(id),
   * dams[], damPopup(d), pointPopup(id), riverPopup(river, id), towns[], focusBasin.
   */
  function render(el, ctx) {
    if (!window.L) { el.innerHTML = "<p class='error'>The map couldn't load. Please check your internet connection.</p>"; return; }
    if (!map) init(el);
    map.invalidateSize();
    layers.clearLayers();
    const R = window.RIVER_LINES;
    const sitesOn = river => Object.keys(ctx.points).filter(id => ctx.points[id].river === river);

    Object.entries(R).forEach(([key, r]) => {
      // Rivers of the other basin are drawn faintly so the place's own river system stands out.
      const faded = ctx.focusBasin && window.RiverNet.BASIN_OF(key) !== ctx.focusBasin ? " faded" : "";
      r.extra.forEach(line => L.polyline(line, { className: "map-river minor" + faded, weight: 1.6, interactive: false }).addTo(layers));
      const line = r.main, ids = sitesOn(key);
      if (!ids.length) {
        L.polyline(line, { className: "map-river minor" + faded, weight: 2, interactive: false }).addTo(layers);
      } else {
        // Each vertex belongs to the nearest measuring point along the line.
        const order = ids.map(id => [id, nearestIndex(line, [ctx.points[id].lat, ctx.points[id].lon])]).sort((a, b) => a[1] - b[1]);
        const cuts = [0];
        for (let i = 1; i < order.length; i++) cuts.push(Math.round((order[i - 1][1] + order[i][1]) / 2));
        cuts.push(line.length - 1);
        order.forEach(([id], i) => {
          const seg = line.slice(cuts[i], cuts[i + 1] + 1);
          if (seg.length < 2) return;
          const w = widthFor(ctx.flowOf(id)), st = ctx.statusOf(id);
          if (st !== "safe" && st !== "unknown" && !faded) L.polyline(seg, { className: "map-edge st-" + st, weight: w + 4, interactive: false }).addTo(layers);
          L.polyline(seg, { className: "map-river" + faded, weight: w }).addTo(layers)
            .bindPopup(ctx.riverPopup(key, id), { className: "map-popup" });
          L.polyline(seg, { className: "map-flow" + faded, weight: Math.max(1.5, w * 0.25), interactive: false }).addTo(layers);
        });
      }
      // Name the larger rivers, and every river of the place's own system.
      if (r.km < 40 && (faded || !ctx.focusBasin)) return;
      const mid = line[Math.floor(line.length * 0.4)];
      L.tooltip({ permanent: true, direction: "center", className: "map-label river-label" + faded, interactive: false })
        .setLatLng(mid).setContent(RIVER_NAMES[key]).addTo(layers);
    });

    [["Vembanad Lake", [9.62, 76.37]], ["Ashtamudi Lake", [8.98, 76.58]], ["Arabian Sea", [10.6, 75.6]]].forEach(([name, ll]) =>
      L.tooltip({ permanent: true, direction: "center", className: "map-label water-label", interactive: false }).setLatLng(ll).setContent(name).addTo(layers));

    ctx.dams.forEach(d => {
      const loc = window.DAM_LOCATIONS[d.id];
      if (!loc) return;
      let ll = [loc.lat, loc.lon];
      if (!loc.outlet && R[loc.river]) {
        const line = R[loc.river].main, i = nearestIndex(line, ll);
        if (Math.sqrt(dist2(line[i], ll)) * 111 < 3) ll = line[i];
      }
      const icon = L.divIcon({ className: "", html: "<span class='map-dam alert-" + (d.alert || "none") + (d.missing ? " missing" : "") + "'></span>", iconSize: [14, 14], iconAnchor: [7, 7] });
      L.marker(ll, { icon, title: d.name, keyboard: true }).addTo(layers)
        .bindTooltip(d.name, { direction: "top", offset: [0, -8], className: "map-tip" })
        .bindPopup(ctx.damPopup(d), { className: "map-popup" });
    });

    ctx.towns.forEach(t => {
      L.circleMarker([t.lat, t.lon], { radius: 6, className: "map-town st-" + ctx.statusOf(t.id), weight: 2 }).addTo(layers)
        .bindTooltip(t.town, { direction: "right", offset: [8, 0], className: "map-town-label" })
        .bindPopup(ctx.pointPopup(t.id), { className: "map-popup" });
    });

    if (!legend) {
      legend = L.control({ position: "bottomleft" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("details", "map-legend");
        // Open on wide screens; a small "Map key" button on phones so it doesn't cover the map.
        if (window.innerWidth > 560) div.open = true;
        L.DomEvent.disableClickPropagation(div);
        div.innerHTML = "<summary>Map key</summary>" +
          "<div class='ml-row'><i class='ml-water'></i>Water · thicker river = more water</div>" +
          "<div class='ml-row'><i class='ml-edge st-alert'></i>Be alert</div><div class='ml-row'><i class='ml-edge st-ready'></i>Get ready</div><div class='ml-row'><i class='ml-edge st-danger'></i>Danger</div>" +
          "<div class='ml-row'><span class='map-dam alert-none'></span>Dam</div><div class='ml-row'><span class='ml-town'></span>Measuring point</div>" +
          "<div class='ml-row'><span class='ml-you'></span>Your place</div>";
        return div;
      };
      legend.addTo(map);
    }
  }

  /** Mark the chosen place; zoom to it only when asked (a new place, not a new date). */
  function showPlace(place, status, zoom) {
    if (!map) return;
    map.closePopup();
    placeLayer.clearLayers();
    L.circleMarker([place.lat, place.lon], { radius: 9, className: "map-you st-" + status, weight: 3 }).addTo(placeLayer)
      .bindTooltip(place.name, { permanent: true, direction: "top", offset: [0, -10], className: "map-you-label" });
    if (zoom) map.setView([place.lat, place.lon], 10, { animate: false });
  }

  function fitAll() { if (map) map.fitBounds(BOUNDS, { padding: [10, 10] }); }

  window.FloodMap = { render, showPlace, fitAll };
})();
