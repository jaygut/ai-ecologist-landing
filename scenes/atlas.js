/* Atlas: the cross-biome reference library. Each ecosystem is rendered as its
   own k-core fingerprint, a dense load-bearing nucleus ringed by progressively
   more peripheral shells, exactly the structure the brief shows. The twenty
   fingerprints are placed by structural similarity and joined where their core
   structure is alike. Hover any ecosystem to read it. Driven by data/atlas.json
   (real per-ecosystem shell occupancy). Similarity is structural, not taxonomic. */
(function () {
  (window.SCENES = window.SCENES || {})["atlas"] = function (holder, ctx) {
    var atlas = ctx.data.atlas;
    var st = { t: 0, nodes: [], edges: [], hover: -1 };
    var tip = document.getElementById("atlas-tip");
    var rng = ctx.prng;

    // k-shell depth ramp: gold core -> blue rim (the brief's coreness ramp)
    var RAMP = [
      [1.0, [244, 208, 63]],
      [0.78, [245, 166, 35]],
      [0.55, [232, 105, 77]],
      [0.32, [88, 192, 160]],
      [0.0, [74, 144, 217]],
    ];
    function shellColor(frac) {
      frac = Math.max(0, Math.min(1, frac));
      for (var i = 0; i < RAMP.length - 1; i++) {
        var a = RAMP[i], b = RAMP[i + 1];
        if (frac <= a[0] && frac >= b[0]) {
          var u = (frac - b[0]) / (a[0] - b[0]);
          return [
            Math.round(b[1][0] + (a[1][0] - b[1][0]) * u),
            Math.round(b[1][1] + (a[1][1] - b[1][1]) * u),
            Math.round(b[1][2] + (a[1][2] - b[1][2]) * u),
          ];
        }
      }
      return RAMP[RAMP.length - 1][1];
    }

    function layout(p) {
      st.w = p.width; st.h = p.height;
      if (!atlas) return;
      var cx = p.width * 0.5, cy = p.height * 0.52;
      var spreadX = p.width * (p.width > 760 ? 0.42 : 0.4);
      var spreadY = p.height * 0.4;
      var byId = {};
      st.nodes = atlas.nodes.map(function (n, i) {
        byId[n.id] = i;
        var Rg = 24 + Math.sqrt(n.n_species) * 0.7; // fingerprint radius
        return {
          id: n.id, label: n.label, cat: n.category, stats: n, idx: i,
          x: cx + n.x * spreadX, y: cy + n.y * spreadY,
          Rg: Rg, flagship: n.flagship, k_max: n.k_max,
          shells: n.shells || [], rot: rng.range(0, 6.28), rsp: rng.range(-0.0025, 0.0025),
        };
      });
      // de-overlap: iterative repulsion so fingerprints do not collide
      var N = st.nodes.length, pad = 14;
      for (var it = 0; it < 60; it++) {
        for (var a = 0; a < N; a++) {
          for (var b = a + 1; b < N; b++) {
            var A = st.nodes[a], B = st.nodes[b];
            var dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 0.01;
            var minD = A.Rg + B.Rg + pad;
            if (d < minD) {
              var push = (minD - d) / 2, ux = dx / d, uy = dy / d;
              A.x -= ux * push; A.y -= uy * push;
              B.x += ux * push; B.y += uy * push;
            }
          }
        }
      }
      // keep inside the frame
      st.nodes.forEach(function (n) {
        n.x = Math.max(n.Rg + 16, Math.min(p.width - n.Rg - 16, n.x));
        n.y = Math.max(n.Rg + 70, Math.min(p.height - n.Rg - 50, n.y));
      });
      st.edges = atlas.edges.map(function (e) { return { a: byId[e.source], b: byId[e.target], w: e.similarity }; });
    }

    function drawFingerprint(p, n, scale, reveal) {
      var Rg = n.Rg * scale;
      var kmax = n.k_max || 1;
      var fc = ctx.reduced ? 0 : p.frameCount;
      var baseRot = n.rot + fc * n.rsp;
      // edges/spokes faint inside (richness)
      // shells from core outward
      var nucleusR = Rg * 0.26;
      for (var i = 0; i < n.shells.length; i++) {
        var sh = n.shells[i];
        var frac = kmax > 0 ? sh.k / kmax : 0;
        var col = shellColor(frac);
        if (sh.k >= kmax) {
          // dense load-bearing nucleus as a filled disc, sized by occupancy
          var core = nucleusR * (0.8 + 0.5 * Math.min(1, Math.sqrt(sh.n / 40)));
          SB.glow(p, n.x, n.y, core * 0.7, "#f4d03f", 70 * reveal);
          p.noStroke(); p.fill(col[0], col[1], col[2], 240 * reveal);
          p.circle(n.x, n.y, core * 2);
        } else {
          var ringR = nucleusR + (Rg - nucleusR) * Math.pow(1 - frac, 0.78);
          var dots = Math.max(1, Math.min(sh.n, 16));
          var dotSz = Math.max(1.4, 2.6 * scale);
          p.noStroke(); p.fill(col[0], col[1], col[2], 225 * reveal);
          for (var d = 0; d < dots; d++) {
            var ang = baseRot + (Math.PI * 2 * d) / dots + i * 0.5;
            p.circle(n.x + Math.cos(ang) * ringR, n.y + Math.sin(ang) * ringR, dotSz);
          }
        }
      }
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 80, alpha: 16 });
      if (!st.nodes.length) { SB.label(p, "loading atlas", 24, p.height - 24); return; }
      var reveal = SB.smoothstep(SB.win01(st.t, 0, 0.4));

      // similarity edges (behind fingerprints)
      var ec = SB.hexToRgb(GOL.teal);
      st.edges.forEach(function (e) {
        if (e.a == null || e.b == null) return;
        var A = st.nodes[e.a], B = st.nodes[e.b];
        var hot = st.hover === e.a || st.hover === e.b;
        var a = (e.w - 0.4) / 0.4; a = Math.max(0.12, Math.min(1, a));
        p.strokeWeight(hot ? 2 : 1);
        p.stroke(ec[0], ec[1], ec[2], (hot ? 150 : 38 * a) * reveal);
        p.line(A.x, A.y, B.x, B.y);
      });

      // fingerprints (hovered drawn last, enlarged)
      var hoverIdx = st.hover;
      st.nodes.forEach(function (n, i) {
        if (i === hoverIdx) return;
        if (n.flagship) {
          p.noFill(); p.stroke(58, 214, 163, 150 * reveal); p.strokeWeight(1.3);
          p.circle(n.x, n.y, n.Rg * 2 + 10);
          p.noStroke();
        }
        drawFingerprint(p, n, 1, reveal);
        if (n.flagship && reveal > 0.5) SB.label(p, n.label, n.x, n.y + n.Rg + 16, { color: GOL.green, size: 11, align: p.CENTER });
      });
      if (hoverIdx >= 0) {
        var h = st.nodes[hoverIdx];
        SB.glow(p, h.x, h.y, h.Rg * 0.6, GOL.teal, 60);
        drawFingerprint(p, h, 1.5, reveal);
        SB.label(p, h.label, h.x, h.y + h.Rg * 1.5 + 16, { color: GOL.text, size: 12, align: p.CENTER });
      }

      // legend
      SB.label(p, "EACH BURST IS ONE ECOSYSTEM  /  GOLD CORE = LOAD-BEARING, BLUE RIM = WEAKLY ATTACHED", 26, 30, { color: GOL.muted, size: 11 });
      SB.label(p, "GREEN RING: THE TWO FLAGSHIP WATERSHED CASES, TAKEN FROM A SPECIES LIST TO A DECISION", 26, 49, { color: GOL.green, size: 11 });
      SB.label(p, "PLACED BY STRUCTURAL SIMILARITY, NOT TAXONOMIC OVERLAP", 26, p.height - 26, { color: GOL.muted, size: 11 });
      SB.vignette(p, p.width, p.height, 0.76);
    }

    function onMove(p) {
      var best = -1, bd = 1e9;
      for (var i = 0; i < st.nodes.length; i++) {
        var n = st.nodes[i], d = Math.hypot(p.mouseX - n.x, p.mouseY - n.y);
        if (d < n.Rg + 10 && d < bd) { bd = d; best = i; }
      }
      st.hover = best;
      if (best >= 0 && tip) {
        var s = st.nodes[best].stats;
        tip.innerHTML =
          "<h4>" + s.label + "</h4>" +
          "<div class='row'><span>" + s.category + "</span></div>" +
          "<div class='row'>species <b>" + s.n_species + "</b></div>" +
          "<div class='row'>interactions <b>" + s.n_edges + "</b></div>" +
          "<div class='row'>core depth <b>k " + s.k_max + "</b></div>" +
          "<div class='row'>structural tier <b>" + s.risk_tier + "</b></div>";
        tip.style.left = (p.winMouseX + 16) + "px";
        tip.style.top = (p.winMouseY + 14) + "px";
        tip.style.opacity = "1";
      } else if (tip) {
        tip.style.opacity = "0";
      }
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        layout(p);
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.mouseMoved = function () { if (!ctx.reduced) onMove(p); };
      p.windowResized = function () { p.resizeCanvas(holder.offsetWidth, holder.offsetHeight); layout(p); if (ctx.reduced) p.redraw(); };
    }, holder);
    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
