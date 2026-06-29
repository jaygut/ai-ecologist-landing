/* Reconstruction: the real Oriente web as a hierarchical trophic food web.
   Species are stacked by trophic level, producers at the base, apex predators at
   the top, coloured by feeding guild, with the load-bearing k-core nucleus ringed
   in gold and energy flowing up the layers. Resolves from noise as you scroll.
   The same trophic layout the engine renders for its figures, made live.
   Driven entirely by data/oriente_network.json. */
(function () {
  var GUILD = {
    "Producer": "#4CAF50", "Herbivore": "#8BC34A", "Granivore": "#CDDC39",
    "Omnivore": "#FFC107", "Insectivore": "#FF9800", "Carnivore": "#F44336",
    "Apex Predator": "#9C27B0", "Decomposer": "#795548", "Detritivore": "#607D8B",
    "Biocrust": "#009688",
  };
  var BANDS = [
    { lo: 0.5, hi: 1.5, label: "Producers (TL 1)", tint: [76, 175, 80] },
    { lo: 1.5, hi: 2.5, label: "Primary consumers (TL 2)", tint: [255, 193, 7] },
    { lo: 2.5, hi: 3.5, label: "Secondary consumers (TL 3)", tint: [255, 152, 0] },
    { lo: 3.5, hi: 5.0, label: "Apex predators (TL 4)", tint: [232, 105, 77] },
  ];

  (window.SCENES = window.SCENES || {})["reconstruct"] = function (holder, ctx) {
    var net = ctx.data.network;
    var st = { t: 0, nodes: [], edges: [], kmax: 23, topY: 0, botY: 0 };
    var rng = ctx.prng;

    function tlToY(tl) {
      var f = SB.clamp((tl - 1.0) / (4.2 - 1.0), 0, 1);
      return st.botY - f * (st.botY - st.topY); // TL1 bottom, TL4 top
    }

    function layout(p) {
      st.w = p.width; st.h = p.height;
      if (!net) return;
      st.kmax = net.meta.k_max;
      st.topY = p.height * 0.13; st.botY = p.height * 0.9;
      var marginX = p.width * 0.07, plotW = p.width * 0.84;

      // group into trophic bands (round(tl*2.5)/2.5), sort by degree desc
      var bandMap = {};
      net.nodes.forEach(function (n) {
        var bk = Math.round(n.trophic_level * 2.5) / 2.5;
        (bandMap[bk] = bandMap[bk] || []).push(n);
      });
      Object.keys(bandMap).forEach(function (bk) {
        bandMap[bk].sort(function (a, b) { return (b.degree - a.degree) || (a.id < b.id ? -1 : 1); });
      });

      var targetOf = {};
      Object.keys(bandMap).forEach(function (bk) {
        var peers = bandMap[bk], m = peers.length;
        var y = tlToY(parseFloat(bk));
        peers.forEach(function (n, idx) {
          var fx = m === 1 ? 0.5 : (0.06 + 0.88 * (idx / (m - 1)));
          var jit = Math.max(0.002, 0.02 / (n.degree + 1));
          fx = SB.clamp(fx + rng.jitter(jit), 0.03, 0.97);
          targetOf[n.id] = { x: marginX + fx * plotW, y: y + rng.jitter(p.height * 0.006) };
        });
      });

      st.nodes = net.nodes.map(function (n) {
        var tgt = targetOf[n.id];
        var a = rng.range(0, Math.PI * 2), rr = rng.range(0.4, 1.2) * Math.min(p.width, p.height) * 0.5;
        return {
          tx: tgt.x, ty: tgt.y,
          sx: p.width / 2 + Math.cos(a) * rr, sy: p.height / 2 + Math.sin(a) * rr,
          col: GUILD[n.guild] || "#9aa7ad",
          sz: 3 + Math.sqrt(n.degree) * 1.05,
          core: n.coreness >= st.kmax, hero: n.is_hero,
          stagger: rng.next(),
        };
      });
      st.edges = net.edges.map(function (e) {
        return { s: e.s, t: e.t, ord: rng.next(), core: st.nodes[e.s].core && st.nodes[e.t].core, mixed: st.nodes[e.s].core || st.nodes[e.t].core };
      });
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      if (!st.nodes.length) { SB.label(p, "loading network", 24, p.height - 24); return; }
      var t = st.t;
      var resolve = SB.easeInOut(SB.win01(t, 0, 0.46));
      var settle = SB.smoothstep(SB.win01(t, 0.62, 1));

      // trophic band backgrounds + labels
      BANDS.forEach(function (b) {
        var yHi = tlToY(b.hi <= 5 ? Math.min(b.hi, 4.2) : 4.2);
        var yLo = tlToY(b.lo);
        p.noStroke(); p.fill(b.tint[0], b.tint[1], b.tint[2], 12);
        p.rect(0, yHi, p.width, yLo - yHi);
        SB.label(p, b.label.toUpperCase(), p.width - 26, (yHi + yLo) / 2, { color: GOL.muted, size: 10.5, align: p.RIGHT, valign: p.CENTER });
      });
      SB.instrumentGrid(p, p.width, p.height, { step: 80, alpha: 12 });

      // node positions (scatter -> trophic target)
      var pos = st.nodes.map(function (n) {
        var local = SB.smoothstep(SB.win01(resolve, n.stagger * 0.4, 0.62 + n.stagger * 0.38));
        return { x: SB.lerp(n.sx, n.tx, local), y: SB.lerp(n.sy, n.ty, local) };
      });

      // edges: energy flow up the layers, gold within the core
      var gold = [184, 134, 11];
      for (var i = 0; i < st.edges.length; i++) {
        var e = st.edges[i];
        var a = SB.smoothstep(SB.win01(t, 0.32 + e.ord * 0.34, 0.48 + e.ord * 0.34));
        if (a <= 0.01) continue;
        var A = pos[e.s], B = pos[e.t];
        p.strokeWeight(e.core ? 0.9 : 0.7);
        if (e.core) p.stroke(gold[0], gold[1], gold[2], 70 * a);
        else if (e.mixed) p.stroke(150, 150, 150, 32 * a);
        else p.stroke(130, 140, 146, 26 * a);
        p.line(A.x, A.y, B.x, B.y);
      }

      // nodes
      p.noStroke();
      for (var k = 0; k < st.nodes.length; k++) {
        var n = st.nodes[k], P = pos[k];
        var c = SB.hexToRgb(n.col);
        if (n.core && settle > 0) {
          p.noFill(); p.stroke(244, 208, 63, 200 * settle); p.strokeWeight(1.6);
          p.circle(P.x, P.y, n.sz * 2 + 7); p.noStroke();
        }
        if (n.hero && settle > 0) SB.glow(p, P.x, P.y, n.sz, GOL.green, 95 * settle);
        p.fill(c[0], c[1], c[2], 235);
        p.circle(P.x, P.y, n.sz * 2);
        if (n.hero && settle > 0.2) {
          p.noFill(); p.stroke(58, 214, 163, 210 * settle); p.strokeWeight(1.5);
          p.circle(P.x, P.y, n.sz * 2 + 11 + (ctx.reduced ? 0 : Math.sin(p.frameCount * 0.06) * 3));
          p.noStroke();
          SB.label(p, "Sword-billed hummingbird", P.x + 10, P.y - 9, { color: GOL.green, size: 11 });
        }
      }

      SB.cornerBrackets(p, p.width, p.height, { alpha: 60 });
      SB.label(p, "ORIENTE CLOUD FOREST  /  91 SPECIES  /  1,033 INTERACTIONS  /  GOLD RING = LOAD-BEARING CORE", 26, p.height - 22, { color: GOL.muted, size: 11 });
      SB.vignette(p, p.width, p.height, 0.78);
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
