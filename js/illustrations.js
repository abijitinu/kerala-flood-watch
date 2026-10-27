/*
 * Small SVG pictures that turn readings into things people already know: two glasses
 * of water (usual vs now) and a danger meter. Each returns an SVG string.
 */
(function () {
  let uid = 0;
  const id = p => p + (++uid);

  // A gentle repeating wave across [x0, x1] at height y; the path is twice as
  // wide so the CSS animation can slide it sideways seamlessly.
  function wavePath(x0, x1, y, bottom, amp = 4, len = 40) {
    let d = "M" + (x0 - len * 2) + "," + y;
    for (let x = x0 - len * 2; x < x1 + len * 2; x += len) d += " q" + len / 4 + "," + -amp + " " + len / 2 + ",0 t" + len / 2 + ",0";
    return d + " V" + bottom + " H" + (x0 - len * 2) + " Z";
  }
  // --len lets the CSS slide each wave by exactly one wavelength, so the loop is seamless.
  const wave = (cls, x0, x1, y, bottom, amp, len) =>
    "<path class='" + cls + " wave-move' style='--len:" + len + "px' d='" + wavePath(x0, x1, y, bottom, amp, len) + "'/>";

  /** Two glasses: how much water usually flows vs today. */
  const T = s => window.I18N ? window.I18N.t(s) : s;
  function glasses(ratio) {
    const usual = 0.38, today = Math.max(0.06, usual * ratio), spill = today > 1;
    const glass = (x, f, label, cls) => {
      const gTop = 14, gBot = 92, h = gBot - gTop, wy = gBot - Math.min(f, 1) * h;
      const c = id("glass");
      return "<clipPath id='" + c + "'><path d='M" + (x + 4) + " " + gTop + " L" + (x + 10) + " " + gBot + " H" + (x + 50) + " L" + (x + 56) + " " + gTop + "Z'/></clipPath>" +
        "<g clip-path='url(#" + c + ")'><g class='rise' style='--from:" + (gBot - wy) + "px'>" + wave("water " + cls, x, x + 60, wy, gBot + 2, 2.5, 18) + "</g></g>" +
        "<path class='glass' d='M" + (x + 4) + " " + gTop + " L" + (x + 10) + " " + gBot + " H" + (x + 50) + " L" + (x + 56) + " " + gTop + "'/>" +
        "<text x='" + (x + 30) + "' y='108' text-anchor='middle'>" + label + "</text>";
    };
    return "<svg class='glasses' viewBox='0 0 170 114' role='img' aria-label='" + T("Usual amount of water compared with today") + "'>" +
      glass(8, usual, T("Usual"), "") + glass(100, today, T("Today"), "today") +
      (spill ? "<g class='spill'><path d='M154 18 q8 6 6 22' /><circle class='drip' cx='160' cy='44' r='3'/><circle class='drip d2' cx='104' cy='40' r='2.5'/></g>" : "") +
    "</svg>";
  }

  /** A semicircle danger meter with four zones and a needle. */
  const ZONES = ["safe", "alert", "ready", "danger"];
  function meter(status, size = "") {
    const i = Math.max(0, ZONES.indexOf(status));
    const cx = 80, cy = 80, r = 62;
    const arc = (a0, a1) => {
      const p = a => [cx + r * Math.cos(Math.PI * (1 - a)), cy - r * Math.sin(Math.PI * (1 - a))];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return "M" + x0.toFixed(1) + " " + y0.toFixed(1) + " A" + r + " " + r + " 0 0 1 " + x1.toFixed(1) + " " + y1.toFixed(1);
    };
    const angle = -90 + (i + 0.5) * 45;
    return "<svg class='meter " + size + "' viewBox='0 0 160 96' role='img' aria-label='" + T("Danger meter") + ": " + T({ safe: "No warning", alert: "Be updated", ready: "Be prepared", danger: "Take action" }[status] || "Not sure") + "'>" +
      ZONES.map((z, k) => "<path class='zone " + z + (k === i ? " on" : "") + "' d='" + arc(k / 4 + 0.01, (k + 1) / 4 - 0.01) + "'/>").join("") +
      "<g class='needle' style='--angle:" + angle + "deg'><path d='M" + (cx - 4) + " " + cy + " L" + cx + " " + (cy - r + 12) + " L" + (cx + 4) + " " + cy + "Z'/></g>" +
      "<circle class='hub' cx='" + cx + "' cy='" + cy + "' r='7'/>" +
    "</svg>";
  }

  window.Illus = { glasses, meter };
})();
