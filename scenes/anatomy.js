/* The Anatomy of the Web (signature scene).
   The real Oriente network as a standard k-core shell decomposition: each k-shell
   on its own concentric ring, the load-bearing nucleus (k=23) at the centre,
   coloured gold-core to blue-rim by shell depth. A class filter spotlights
   functional guilds. The "Nectar-feeders" chip zooms into the core and labels the
   fourteen nectar-feeders seated in the deepest shell. A removal control
   recomputes connectivity and knock-on losses live from the real edge list.
   Pairs with the DOM Structural Integrity panel. Driven by oriente_network.json. */
(function () {
  // k-shell depth ramp: gold core -> blue rim (the engine's coreness ramp)
  var RAMP = [
    [1.0, [244, 208, 63]], [0.78, [245, 166, 35]], [0.55, [232, 105, 77]],
    [0.32, [120, 200, 150]], [0.0, [74, 144, 217]],
  ];
  function shellColor(frac) {
    frac = Math.max(0, Math.min(1, frac));
    for (var i = 0; i < RAMP.length - 1; i++) {
      var a = RAMP[i], b = RAMP[i + 1];
      if (frac <= a[0] && frac >= b[0]) {
        var u = (frac - b[0]) / (a[0] - b[0]);
        return [Math.round(b[1][0] + (a[1][0] - b[1][0]) * u),
                Math.round(b[1][1] + (a[1][1] - b[1][1]) * u),
                Math.round(b[1][2] + (a[1][2] - b[1][2]) * u)];
      }
    }
    return RAMP[RAMP.length - 1][1];
  }

  (window.SCENES = window.SCENES || {})["anatomy"] = function (holder, ctx) {
    var net = ctx.data.network;
    var st = {
      t: 0, activeClass: "all", removal: 0, zoom: 0, zoomTarget: 0,
      nodes: [], edges: [], rings: [], cx: 0, cy: 0, R: 0, Rz: 0, kmax: 23,
      removedSet: {}, extinctSet: {},
    };

    function prep() {
      if (!net) return;
      st.kmax = net.meta.k_max;
      var N = net.nodes.length;
      st.adj = []; st.inPrey = []; st.producer = [];
      for (var i = 0; i < N; i++) { st.adj.push([]); st.inPrey.push([]); st.producer.push(net.nodes[i].klass === "producer"); }
      net.edges.forEach(function (e) { st.adj[e.s].push(e.t); st.adj[e.t].push(e.s); st.inPrey[e.t].push(e.s); });
      st.order = net.nodes.map(function (n, i) { return i; }).sort(function (a, b) {
        var na = net.nodes[a], nb = net.nodes[b];
        if (nb.coreness !== na.coreness) return nb.coreness - na.coreness;
        return nb.betweenness - na.betweenness;
      });
      recompute();
    }

    function recompute() {
      var N = net.nodes.length, removed = {};
      for (var i = 0; i < st.removal && i < st.order.length; i++) removed[st.order[i]] = true;
      st.removedSet = removed;
      var extinct = {}, changed = true;
      while (changed) {
        changed = false;
        for (var v = 0; v < N; v++) {
          if (removed[v] || extinct[v] || st.producer[v]) continue;
          var prey = st.inPrey[v]; if (prey.length === 0) continue;
          var alive = false;
          for (var k = 0; k < prey.length; k++) { var pv = prey[k]; if (!removed[pv] && !extinct[pv]) { alive = true; break; } }
          if (!alive) { extinct[v] = true; changed = true; }
        }
      }
      st.extinctSet = extinct;
      var seen = {}, best = 0;
      for (var s = 0; s < N; s++) {
        if (removed[s] || seen[s]) continue;
        var stack = [s], size = 0; seen[s] = true;
        while (stack.length) { var u = stack.pop(); size++; var nb = st.adj[u]; for (var j = 0; j < nb.length; j++) { var w = nb[j]; if (!removed[w] && !seen[w]) { seen[w] = true; stack.push(w); } } }
        if (size > best) best = size;
      }
      st.lccPct = Math.round((best / N) * 100); st.secCount = Object.keys(extinct).length;
      var n = document.getElementById("rm-n"), l = document.getElementById("rm-lcc"), sc = document.getElementById("rm-sec");
      if (n) n.textContent = st.removal; if (l) l.textContent = st.lccPct + "%"; if (sc) sc.textContent = st.secCount;
    }

    /* Centre the shell figure in the band genuinely free at its widest point,
       measured from the DOM rather than assumed. The keynote card sits in the
       lower left starting almost exactly at the figure's vertical centre, so it
       is a real horizontal obstacle, not just a bottom-corner one; the reading
       panel bounds the right. Measuring both keeps the figure optically centred
       AND clear of both cards at any viewport width, which a fixed fraction of
       canvas width cannot do because the panel is a fixed pixel width. */
    function freeBand(p) {
      var lo = 0;
      var hi = p.width;
      var section = holder.closest ? holder.closest("section") : null;
      if (section) {
        var hr = holder.getBoundingClientRect();
        var keyEl = section.querySelector(".keynote");
        var panelEl = section.querySelector(".si-panel");
        if (keyEl) {
          var kr = keyEl.getBoundingClientRect();
          // only an obstacle if it spans the figure's vertical mid-band
          if (kr.width > 0 && kr.top - hr.top < p.height * 0.62) {
            lo = Math.max(lo, kr.right - hr.left + 18);
          }
        }
        if (panelEl) {
          var pr = panelEl.getBoundingClientRect();
          if (pr.width > 0 && pr.left > hr.left) hi = Math.min(hi, pr.left - hr.left - 18);
        }
      }
      if (hi - lo < 260) { lo = 0; hi = p.width; }   // too tight to be useful
      return { lo: lo, hi: hi, mid: (lo + hi) / 2, w: hi - lo };
    }

    function layout(p) {
      st.w = p.width; st.h = p.height;
      var wide = p.width > 980;
      var band = wide ? freeBand(p) : { mid: p.width / 2, w: p.width };
      st.cx = band.mid;
      st.cy = p.height * 0.52;
      st.R = Math.min(band.w * 0.47, p.height * 0.94 * 0.47);
      st.Rz = Math.min(band.w * 0.44, p.height * 0.86 * 0.44);
      if (!net) return;
      // core-zoom ring order: core nodes evenly on a big ring, sorted by id
      var coreIds = net.nodes.map(function (n, i) { return i; }).filter(function (i) { return net.nodes[i].coreness >= st.kmax; });
      coreIds.sort(function (a, b) { return net.nodes[a].id < net.nodes[b].id ? -1 : 1; });
      var coreRingIndex = {};
      coreIds.forEach(function (idx, j) { coreRingIndex[idx] = j; });
      var nCore = coreIds.length;

      st.nodes = net.nodes.map(function (nn, i) {
        var ox = st.cx + nn.cx * st.R, oy = st.cy + nn.cy * st.R;
        var isCore = nn.coreness >= st.kmax;
        var zx = ox, zy = oy;
        if (isCore) {
          var ang = (Math.PI * 2 * coreRingIndex[i]) / nCore - Math.PI / 2;
          zx = st.cx + Math.cos(ang) * st.Rz; zy = st.cy + Math.sin(ang) * st.Rz;
          nn._zang = ang;
        }
        return {
          ox: ox, oy: oy, zx: zx, zy: zy,
          col: shellColor(nn.coreness / st.kmax),
          sz: 3 + Math.sqrt(nn.degree) * 0.95,
          coreness: nn.coreness, core: isCore, klass: nn.klass,
          hero: nn.is_hero, nectar: nn.nectar, apex: nn.is_apex,
          common: nn.common_name || nn.id, zang: nn._zang,
        };
      });
      st.edges = net.edges;
      // guide rings: one per distinct shell radius
      var radii = {};
      net.nodes.forEach(function (nn) { var r = Math.round(Math.hypot(nn.cx, nn.cy) * st.R); radii[r] = 1; });
      st.rings = Object.keys(radii).map(Number).filter(function (r) { return r > 6; });
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 78, alpha: 16 });
      if (!st.nodes.length) { SB.label(p, "loading network", 24, p.height - 24); return; }
      // animate zoom toward target
      if (!ctx.reduced) st.zoom += (st.zoomTarget - st.zoom) * 0.12; else st.zoom = st.zoomTarget;
      var Z = SB.smoothstep(st.zoom);
      var reveal = SB.smoothstep(SB.win01(st.t, 0, 0.3));
      var filtered = st.activeClass !== "all" && st.activeClass !== "nectar";
      var nectarMode = st.activeClass === "nectar";

      function pos(n) { return { x: SB.lerp(n.ox, n.core ? n.zx : n.ox, Z), y: SB.lerp(n.oy, n.core ? n.zy : n.oy, Z) }; }

      // concentric guide rings (fade as we zoom into the core)
      p.noFill();
      st.rings.forEach(function (r) { p.stroke(21, 41, 58, 130 * reveal * (1 - Z)); p.circle(st.cx, st.cy, r * 2); });

      // edges (gold within the core, faint teal elsewhere). hide outer when zoomed.
      var gold = [184, 134, 11], ec = SB.hexToRgb(GOL.teal);
      p.strokeWeight(1);
      for (var i = 0; i < st.edges.length; i++) {
        var e = st.edges[i];
        if (st.removedSet[e.s] || st.removedSet[e.t]) continue;
        var A = st.nodes[e.s], B = st.nodes[e.t];
        var bothCore = A.core && B.core;
        if (Z > 0.05 && !bothCore) continue; // in zoom, only core-core edges
        var dimC = filtered && A.klass !== st.activeClass && B.klass !== st.activeClass;
        var nd = nectarMode && !(A.nectar && B.nectar);
        var aEdge = bothCore ? 30 : 22;
        if (dimC || nd) aEdge = 7;
        var col = bothCore ? gold : ec;
        p.stroke(col[0], col[1], col[2], aEdge * reveal);
        var P = pos(A), Q = pos(B);
        p.line(P.x, P.y, Q.x, Q.y);
      }

      // nodes
      p.noStroke();
      for (var k = 0; k < st.nodes.length; k++) {
        var n = st.nodes[k];
        if (st.removedSet[k]) { var P2 = pos(n); p.fill(90, 100, 108, 55 * reveal); p.circle(P2.x, P2.y, n.sz * 1.5); continue; }
        var ext = st.extinctSet[k];
        var matchClass = !filtered || n.klass === st.activeClass;
        var matchNectar = !nectarMode || n.nectar;
        var P = pos(n);
        // outer (non-core) nodes fade out in zoom
        var zoomFade = n.core ? 1 : (1 - Z);
        var dim = (filtered && !matchClass) || (nectarMode && !matchNectar) ? 0.16 : 1;
        var baseA = 235 * reveal * zoomFade * dim;
        if (baseA < 4) continue;
        var c = ext ? SB.hexToRgb(GOL.coral) : n.col;
        var sz = n.sz * (Z > 0.05 && n.core ? 1.25 : 1);
        if (n.core && Z < 0.05 && matchClass && !filtered && !nectarMode) SB.glow(p, P.x, P.y, n.sz * 0.7, "#f4d03f", 55 * reveal);
        if (ext) SB.glow(p, P.x, P.y, n.sz, GOL.coral, 100 * reveal);
        p.noStroke(); p.fill(c[0], c[1], c[2], baseA); p.circle(P.x, P.y, sz * 2);
        // nectar-feeder highlight (green ring), the fourteen seated in the core
        if (n.nectar && n.core && (nectarMode || (!filtered && reveal > 0.5))) {
          p.noFill(); p.stroke(58, 214, 163, (nectarMode ? 235 : 150) * reveal); p.strokeWeight(1.6); p.circle(P.x, P.y, sz * 2 + 9); p.noStroke();
        }
        // class highlight ring
        if (filtered && matchClass) {
          var cc = SB.hexToRgb(classColor(n.klass)); p.noFill(); p.stroke(cc[0], cc[1], cc[2], 220 * reveal); p.strokeWeight(1.6); p.circle(P.x, P.y, sz * 2 + 8); p.noStroke();
        }
        // hero ring + label (always subtle; prominent in zoom)
        if (n.hero) {
          p.noFill(); p.stroke(58, 214, 163, 230 * reveal); p.strokeWeight(1.8);
          p.circle(P.x, P.y, sz * 2 + 12 + (ctx.reduced ? 0 : Math.sin(p.frameCount * 0.06) * 3)); p.noStroke();
        }
      }

      // labels for the fourteen nectar-feeders when zoomed into the core
      if (Z > 0.35) {
        var la = SB.smoothstep(SB.win01(Z, 0.35, 0.85)) * 255;
        st.nodes.forEach(function (n) {
          if (!n.nectar || !n.core || st.removedSet[idxOf(n)]) return;
          var P = pos(n);
          var dx = Math.cos(n.zang), dy = Math.sin(n.zang);
          var lx = P.x + dx * 16, ly = P.y + dy * 16;
          var anchor = dx >= 0 ? p.LEFT : p.RIGHT;
          var col = n.hero ? GOL.green : GOL.text;
          SB.label(p, n.common, lx, ly + 3, { color: col, size: n.hero ? 12.5 : 10.5, align: anchor, alpha: la });
        });
      }

      // core label
      p.push();
      p.fill(143, 163, 173, 220 * reveal * (1 - Z));
      p.textFont("IBM Plex Mono"); p.textAlign(p.CENTER, p.CENTER); p.textSize(11);
      p.text("CORE", st.cx, st.cy - 6);
      p.fill(244, 208, 63, 230 * reveal * (1 - Z)); p.textSize(13); p.text("k = " + st.kmax, st.cx, st.cy + 10);
      p.pop();
      if (Z > 0.4) SB.label(p, "THE DEEPEST CORE  /  14 NECTAR-FEEDERS, 11 OF THEM HUMMINGBIRDS", st.cx, st.cy, { color: GOL.muted, size: 11, align: p.CENTER, valign: p.CENTER, alpha: SB.win01(Z, 0.4, 0.7) * 200 });

      SB.vignette(p, p.width, p.height, 0.7);
    }

    function idxOf(n) { return st.nodes.indexOf(n); }
    function classColor(klass) {
      return { hub: "#1aa89b", producer: "#3ad6a3", connector: "#a78bfa", apex: "#e8694d", background: "#586b77" }[klass] || "#8fa3ad";
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        prep(); layout(p);
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.windowResized = function () { p.resizeCanvas(holder.offsetWidth, holder.offsetHeight); layout(p); if (ctx.reduced) p.redraw(); };
    }, holder);

    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    inst._setClass = function (key) { st.activeClass = key; st.zoomTarget = key === "nectar" ? 1 : 0; if (ctx.reduced) { st.zoom = st.zoomTarget; inst.redraw && inst.redraw(); } };
    inst._setRemoval = function (n) { st.removal = n; recompute(); if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
