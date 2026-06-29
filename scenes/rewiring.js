/* Rewiring: the system changing shape over time, on the same hierarchical food
   web used in the reconstruction. Species are stacked by trophic level. A
   persistent backbone holds in teal while transient interactions are gained
   (green) and later lost (coral). A timeline below tracks each rewiring event as
   a playhead sweeps it. The motion illustrates the temporal mechanism the engine
   measures; the validation number (a near-exact reproduction across 658 windows)
   is real and sits in the copy card. */
(function () {
  var GUILD = {
    "Producer": "#4CAF50", "Herbivore": "#8BC34A", "Granivore": "#CDDC39",
    "Omnivore": "#FFC107", "Insectivore": "#FF9800", "Carnivore": "#F44336",
    "Apex Predator": "#9C27B0", "Decomposer": "#795548", "Detritivore": "#607D8B",
    "Biocrust": "#009688",
  };
  var BANDS = [
    { lo: 0.5, hi: 1.5, label: "Producers", tint: [76, 175, 80] },
    { lo: 1.5, hi: 2.5, label: "Primary", tint: [255, 193, 7] },
    { lo: 2.5, hi: 3.5, label: "Secondary", tint: [255, 152, 0] },
    { lo: 3.5, hi: 5.0, label: "Apex", tint: [232, 105, 77] },
  ];

  (window.SCENES = window.SCENES || {})["rewiring"] = function (holder, ctx) {
    var net = ctx.data.network;
    var st = { t: 0, nodes: [], persist: [], dyn: [], events: [], topY: 0, botY: 0 };
    var rng = ctx.prng;
    var LOOP = 1 / (15 * 60);
    var DYN_COUNT = 64;

    function tlToY(tl) {
      var f = SB.clamp((tl - 1.0) / (4.2 - 1.0), 0, 1);
      return st.botY - f * (st.botY - st.topY);
    }

    function layout(p) {
      st.w = p.width; st.h = p.height;
      if (!net) return;
      st.kmax = net.meta.k_max;
      st.topY = p.height * 0.12; st.botY = p.height * 0.80;
      var marginX = p.width * 0.06, plotW = p.width * 0.88;

      // trophic bands (same construction as the reconstruction scene)
      var bandMap = {};
      net.nodes.forEach(function (n) {
        var bk = Math.round(n.trophic_level * 2.5) / 2.5;
        (bandMap[bk] = bandMap[bk] || []).push(n);
      });
      Object.keys(bandMap).forEach(function (bk) {
        bandMap[bk].sort(function (a, b) { return (b.degree - a.degree) || (a.id < b.id ? -1 : 1); });
      });
      var posOf = {};
      Object.keys(bandMap).forEach(function (bk) {
        var peers = bandMap[bk], m = peers.length, y = tlToY(parseFloat(bk));
        peers.forEach(function (n, idx) {
          var fx = m === 1 ? 0.5 : (0.06 + 0.88 * (idx / (m - 1)));
          posOf[n.id] = { x: marginX + fx * plotW, y: y + rng.jitter(p.height * 0.006) };
        });
      });
      st.nodes = net.nodes.map(function (n) {
        var pp = posOf[n.id];
        return { x: pp.x, y: pp.y, col: GUILD[n.guild] || "#9aa7ad", sz: 2.6 + Math.sqrt(n.degree) * 0.92, core: n.coreness >= st.kmax };
      });

      // partition edges: persistent backbone vs transient (timed gain/loss)
      var idx = net.edges.map(function (e, i) { return i; });
      idx.sort(function () { return rng.next() - 0.5; });
      var dynSet = {};
      for (var i = 0; i < Math.min(DYN_COUNT, idx.length); i++) dynSet[idx[i]] = true;
      st.persist = []; st.dyn = []; st.events = [];
      net.edges.forEach(function (e, i) {
        if (dynSet[i]) {
          var t0 = rng.range(0, 0.72), t1 = Math.min(1, t0 + rng.range(0.16, 0.55));
          var d = { s: e.s, t: e.t, t0: t0, t1: t1 };
          st.dyn.push(d);
          st.events.push({ time: t0, type: "gain" });
          st.events.push({ time: t1, type: "loss" });
        } else {
          st.persist.push({ s: e.s, t: e.t });
        }
      });
      st.events.sort(function (a, b) { return a.time - b.time; });
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      if (!st.nodes.length) { SB.label(p, "loading", 24, p.height - 24); return; }
      var reveal = SB.smoothstep(SB.win01(st.t, 0, 0.3));
      var phase = ctx.reduced ? 0.5 : (p.frameCount * LOOP) % 1.0;
      var teal = SB.hexToRgb(GOL.teal), coral = SB.hexToRgb(GOL.coral), green = SB.hexToRgb(GOL.green), gold = [184, 134, 11];

      // trophic band backgrounds
      BANDS.forEach(function (b) {
        var yHi = tlToY(Math.min(b.hi, 4.2)), yLo = tlToY(b.lo);
        p.noStroke(); p.fill(b.tint[0], b.tint[1], b.tint[2], 10);
        p.rect(0, yHi, p.width, yLo - yHi);
        SB.label(p, b.label.toUpperCase(), 22, (yHi + yLo) / 2, { color: GOL.muted, size: 9.5, valign: p.CENTER });
      });
      SB.instrumentGrid(p, p.width, p.height, { step: 84, alpha: 10 });

      // persistent backbone
      p.strokeWeight(0.8);
      p.stroke(teal[0], teal[1], teal[2], 22 * reveal);
      for (var i = 0; i < st.persist.length; i++) {
        var e = st.persist[i], A = st.nodes[e.s], B = st.nodes[e.t];
        p.line(A.x, A.y, B.x, B.y);
      }
      // transient edges: gained (green) / lost (coral), flashing on their event
      var gains = 0, losses = 0;
      for (var j = 0; j < st.dyn.length; j++) {
        var d = st.dyn[j], active = phase >= d.t0 && phase < d.t1;
        var A2 = st.nodes[d.s], B2 = st.nodes[d.t];
        if (active) {
          var sinceGain = phase - d.t0, untilLoss = d.t1 - phase, col, a;
          if (sinceGain < 0.02) { col = green; a = 95; }
          else if (untilLoss < 0.02) { col = coral; a = 85; }
          else { col = teal; a = 38; }
          p.strokeWeight(sinceGain < 0.02 || untilLoss < 0.02 ? 1.5 : 0.9);
          p.stroke(col[0], col[1], col[2], a * reveal);
          p.line(A2.x, A2.y, B2.x, B2.y);
        }
        if (phase >= d.t0) gains++;
        if (phase >= d.t1) losses++;
      }

      // nodes (guild-coloured, gold ring on the load-bearing core)
      for (var k = 0; k < st.nodes.length; k++) {
        var n = st.nodes[k];
        if (n.core) { p.noFill(); p.stroke(gold[0], gold[1], gold[2], 150 * reveal); p.strokeWeight(1.2); p.circle(n.x, n.y, n.sz * 2 + 5); }
        var c = SB.hexToRgb(n.col); p.noStroke(); p.fill(c[0], c[1], c[2], 225 * reveal); p.circle(n.x, n.y, n.sz * 2);
      }

      // event timeline (bottom)
      var axisY = p.height * 0.90, x0 = p.width * 0.06, x1 = p.width * 0.94, Wt = x1 - x0;
      SB.label(p, "REWIRING EVENTS OVER TIME", x0, axisY - 30, { color: GOL.muted, size: 10.5 });
      p.stroke(92, 110, 120, 150 * reveal); p.strokeWeight(1); p.line(x0, axisY, x1, axisY);
      for (var m = 0; m < st.events.length; m++) {
        var ev = st.events[m], ex = x0 + ev.time * Wt, passed = ev.time <= phase, up = ev.type === "gain";
        var col2 = up ? green : coral, alpha = (passed ? 200 : 50) * reveal, hh = passed ? 12 : 7;
        p.stroke(col2[0], col2[1], col2[2], alpha); p.strokeWeight(passed ? 1.5 : 1);
        if (up) p.line(ex, axisY, ex, axisY - hh); else p.line(ex, axisY, ex, axisY + hh);
      }
      var px = x0 + phase * Wt, tb = SB.hexToRgb(GOL.tealBright);
      p.stroke(tb[0], tb[1], tb[2], 220 * reveal); p.strokeWeight(1.5); p.line(px, axisY - 22, px, axisY + 22);
      p.noStroke(); p.fill(tb[0], tb[1], tb[2], 230 * reveal); p.triangle(px - 5, axisY - 28, px + 5, axisY - 28, px, axisY - 20);
      SB.label(p, "gained " + gains, x0, axisY + 32, { color: GOL.green, size: 11.5 });
      SB.label(p, "lost " + losses, x0 + 96, axisY + 32, { color: GOL.coral, size: 11.5 });
      SB.label(p, "backbone held", x0 + 184, axisY + 32, { color: GOL.teal, size: 11.5 });
      SB.label(p, "MOTION ILLUSTRATES THE MECHANISM  /  THE VALIDATION NUMBER IS MEASURED", x0, p.height - 14, { color: GOL.muted, size: 10.5 });

      SB.vignette(p, p.width, p.height, 0.74);
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        layout(p);
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.windowResized = function () { p.resizeCanvas(holder.offsetWidth, holder.offsetHeight); layout(p); if (ctx.reduced) p.redraw(); };
    }, holder);
    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
