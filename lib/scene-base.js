/* Shared instrument vocabulary for every p5 scene.
   One visual grammar: near-black ground, faint grid + ticks, corner brackets,
   additive bloom on accents only, radial vignette, mono readouts.
   Exposes window.GOL (tokens) and window.SB (helpers). No randomness here. */
(function (global) {
  "use strict";

  // Graph of Life dark-mode tokens. Color carries meaning.
  const GOL = {
    bg: "#06141F", // canvas ground, deeper than Abyss for cinematic black
    bgPanel: "#0B2030",
    navy: "#0E2A47",
    abyss: "#08203A",
    hairline: "#15293A",
    grid: "#102234",
    text: "#EAF2F2",
    muted: "#8FA3AD",
    faint: "#5C6E78",
    teal: "#1AA89B", // connection / edges / high-centrality hubs
    tealBright: "#2BD4C4",
    green: "#3AD6A3", // living capital / data signal / producers
    coral: "#E8694D", // risk / fragility / keystone at risk / apex
    amber: "#F2A24E", // caution / medium tier
    purple: "#A78BFA", // connectors (categorical, scarce by design)
    sand: "#E9E1CC",
    // class -> color (matches the Anatomy of the Web instrument)
    cls: {
      hub: "#1AA89B",
      producer: "#3AD6A3",
      connector: "#A78BFA",
      apex: "#E8694D",
      background: "#586B77",
    },
  };

  // ---- math / easing -------------------------------------------------------
  function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  // map t into a [a,b] sub-window, return 0..1 clamped
  function win01(t, a, b) {
    if (b === a) return t >= b ? 1 : 0;
    return clamp((t - a) / (b - a), 0, 1);
  }
  function smoothstep(x) {
    x = clamp(x, 0, 1);
    return x * x * (3 - 2 * x);
  }
  function easeOut(x) {
    return 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  }
  function easeInOut(x) {
    x = clamp(x, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // ---- color ---------------------------------------------------------------
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }
  function lerpRgb(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t)),
    ];
  }
  // green -> amber -> coral ramp by integrity 0..100 (higher = sounder)
  function integrityColor(score) {
    const s = clamp(score, 0, 100) / 100;
    if (s < 0.5) return lerpRgb(GOL.coral, GOL.amber, s / 0.5);
    return lerpRgb(GOL.amber, GOL.green, (s - 0.5) / 0.5);
  }

  // ---- number formatting (tabular, mono) -----------------------------------
  function fmt(n, dp) {
    if (dp == null) dp = 0;
    return Number(n).toFixed(dp);
  }

  // ---- shared draw helpers (all take the p5 instance) ----------------------
  // additive bloom: a few stacked translucent discs. Use on accents only.
  function glow(p, x, y, r, hex, alpha) {
    const c = hexToRgb(hex);
    p.push();
    p.noStroke();
    p.drawingContext.globalCompositeOperation = "lighter";
    const layers = 3;
    for (let i = layers; i >= 1; i--) {
      const rr = r * (i / layers) * 2.1;
      p.fill(c[0], c[1], c[2], (alpha == null ? 90 : alpha) * (0.32 / i));
      p.circle(x, y, rr * 2);
    }
    p.drawingContext.globalCompositeOperation = "source-over";
    p.pop();
  }

  // faint instrument grid with edge ticks
  function instrumentGrid(p, w, h, opts) {
    opts = opts || {};
    const step = opts.step || 64;
    const col = hexToRgb(opts.color || GOL.grid);
    const a = opts.alpha == null ? 38 : opts.alpha;
    p.push();
    p.stroke(col[0], col[1], col[2], a);
    p.strokeWeight(1);
    for (let x = step; x < w; x += step) p.line(x, 0, x, h);
    for (let y = step; y < h; y += step) p.line(0, y, w, y);
    // edge ticks
    p.stroke(col[0], col[1], col[2], a * 2.2);
    const tick = 7;
    for (let x = step; x < w; x += step) {
      p.line(x, 0, x, tick);
      p.line(x, h, x, h - tick);
    }
    for (let y = step; y < h; y += step) {
      p.line(0, y, tick, y);
      p.line(w, y, w - tick, y);
    }
    p.pop();
  }

  // corner brackets framing the stage like a viewfinder
  function cornerBrackets(p, w, h, opts) {
    opts = opts || {};
    const m = opts.margin || 22;
    const len = opts.len || 26;
    const col = hexToRgb(opts.color || GOL.teal);
    const a = opts.alpha == null ? 120 : opts.alpha;
    p.push();
    p.noFill();
    p.stroke(col[0], col[1], col[2], a);
    p.strokeWeight(1.4);
    // TL
    p.line(m, m, m + len, m);
    p.line(m, m, m, m + len);
    // TR
    p.line(w - m, m, w - m - len, m);
    p.line(w - m, m, w - m, m + len);
    // BL
    p.line(m, h - m, m + len, h - m);
    p.line(m, h - m, m, h - m - len);
    // BR
    p.line(w - m, h - m, w - m - len, h - m);
    p.line(w - m, h - m, w - m, h - m - len);
    p.pop();
  }

  // radial vignette darkening toward edges (drawn last)
  function vignette(p, w, h, strength) {
    const ctx = p.drawingContext;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.75;
    const g = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    const s = strength == null ? 0.85 : strength;
    g.addColorStop(0, "rgba(6,20,31,0)");
    g.addColorStop(1, "rgba(4,12,20," + s + ")");
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // small-caps mono label
  function label(p, txt, x, y, opts) {
    opts = opts || {};
    const col = hexToRgb(opts.color || GOL.muted);
    p.push();
    p.noStroke();
    p.fill(col[0], col[1], col[2], opts.alpha == null ? 200 : opts.alpha);
    p.textFont("IBM Plex Mono");
    p.textSize(opts.size || 11);
    p.textAlign(opts.align || p.LEFT, opts.valign || p.BASELINE);
    p.text(txt, x, y);
    p.pop();
  }

  // fill the ground
  function ground(p, w, h) {
    const c = hexToRgb(GOL.bg);
    p.background(c[0], c[1], c[2]);
  }

  global.GOL = GOL;
  global.SB = {
    clamp: clamp,
    lerp: lerp,
    win01: win01,
    smoothstep: smoothstep,
    easeOut: easeOut,
    easeInOut: easeInOut,
    hexToRgb: hexToRgb,
    lerpRgb: lerpRgb,
    integrityColor: integrityColor,
    fmt: fmt,
    glow: glow,
    instrumentGrid: instrumentGrid,
    cornerBrackets: cornerBrackets,
    vignette: vignette,
    label: label,
    ground: ground,
  };
})(window);
