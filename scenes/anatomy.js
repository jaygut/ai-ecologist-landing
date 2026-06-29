/* The Anatomy of the Web (signature scene).
   The real Oriente network as a k-core shell decomposition: distance from the
   centre is k-core depth, colour is functional class, every interaction drawn.
   Live class filter and a removal control that recomputes connectivity and
   knock-on losses from the real edge list. Pairs with the DOM integrity panel. */
(function () {
  (window.SCENES = window.SCENES || {})["anatomy"] = function (holder, ctx) {
    var net = ctx.data.network;
    var st = {
      t: 0, activeClass: "all", removal: 0,
      nodes: [], edges: [], rings: [], cx: 0, cy: 0, R: 0, kmax: 23,
      removedSet: {}, extinctSet: {},
    };
    var rng = ctx.prng;

    // ---- graph prep --------------------------------------------------------
    function prep() {
      if (!net) return;
      st.kmax = net.meta.k_max;
      var N = net.nodes.length;
      st.adj = []; st.inPrey = []; st.producer = [];
      for (var i = 0; i < N; i++) { st.adj.push([]); st.inPrey.push([]); st.producer.push(net.nodes[i].klass === "producer"); }
      net.edges.forEach(function (e) {
        st.adj[e.s].push(e.t); st.adj[e.t].push(e.s);
        st.inPrey[e.t].push(e.s); // prey s feeds consumer t
      });
      // removal order: deepest core first, then most central
      st.order = net.nodes.map(function (n, i) { return i; }).sort(function (a, b) {
        var na = net.nodes[a], nb = net.nodes[b];
        if (nb.coreness !== na.coreness) return nb.coreness - na.coreness;
        return nb.betweenness - na.betweenness;
      });
      recompute();
    }

    function recompute() {
      var N = net.nodes.length;
      var removed = {};
      for (var i = 0; i < st.removal && i < st.order.length; i++) removed[st.order[i]] = true;
      st.removedSet = removed;
      // cascade of secondary extinctions: a non-producer consumer with at least
      // one prey originally, that loses all its prey, goes extinct, and so on.
      var extinct = {};
      var changed = true;
      while (changed) {
        changed = false;
        for (var v = 0; v < N; v++) {
          if (removed[v] || extinct[v] || st.producer[v]) continue;
          var prey = st.inPrey[v];
          if (prey.length === 0) continue;
          var alive = false;
          for (var k = 0; k < prey.length; k++) { var ppv = prey[k]; if (!removed[ppv] && !extinct[ppv]) { alive = true; break; } }
          if (!alive) { extinct[v] = true; changed = true; }
        }
      }
      st.extinctSet = extinct;
      // largest connected component over nodes not removed (structural)
      var seen = {}, best = 0;
      for (var s = 0; s < N; s++) {
        if (removed[s] || seen[s]) continue;
        var stack = [s], size = 0; seen[s] = true;
        while (stack.length) {
          var u = stack.pop(); size++;
          var nb = st.adj[u];
          for (var j = 0; j < nb.length; j++) { var w = nb[j]; if (!removed[w] && !seen[w]) { seen[w] = true; stack.push(w); } }
        }
        if (size > best) best = size;
      }
      st.lcc = best; st.lccPct = Math.round((best / N) * 100);
      st.secCount = Object.keys(extinct).length;
      updateReadouts();
    }

    function updateReadouts() {
      var n = document.getElementById("rm-n"), l = document.getElementById("rm-lcc"), s = document.getElementById("rm-sec");
      if (n) n.textContent = st.removal;
      if (l) l.textContent = st.lccPct + "%";
      if (s) s.textContent = st.secCount;
    }

    // ---- layout ------------------------------------------------------------
    function layout(p) {
      st.w = p.width; st.h = p.height;
      var rightPanel = p.width > 980 ? 0.30 : 0; // panel occupies right side on desktop
      var cx = p.width * (rightPanel ? 0.34 : 0.5);
      var cy = p.height * 0.52;
      var R = Math.min(p.width * (rightPanel ? 0.6 : 0.9), p.height * 0.92) * 0.46;
      st.cx = cx; st.cy = cy; st.R = R;
      if (!net) return;
      st.nodes = net.nodes.map(function (nn) {
        return {
          px: cx + nn.x * R, py: cy + nn.y * R,
          klass: nn.klass, col: GOL.cls[nn.klass] || GOL.cls.background,
          sz: 3 + Math.sqrt(nn.degree) * 0.95,
          coreness: nn.coreness, core: nn.coreness >= st.kmax,
          hero: nn.is_hero, dr: Math.hypot(nn.x, nn.y),
        };
      });
      st.edges = net.edges;
      // guide rings: average data-radius per coreness level
      var byK = {};
      net.nodes.forEach(function (nn) { (byK[nn.coreness] = byK[nn.coreness] || []).push(Math.hypot(nn.x, nn.y)); });
      st.rings = Object.keys(byK).map(function (k) {
        var arr = byK[k]; var m = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
        return { k: +k, r: m * R };
      });
    }

    // ---- render ------------------------------------------------------------
    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 76, alpha: 18 });
      if (!st.nodes.length) { SB.label(p, "loading network", 24, p.height - 24); return; }
      var reveal = SB.smoothstep(SB.win01(st.t, 0, 0.3));
      var filtered = st.activeClass !== "all";

      // guide rings
      p.noFill();
      st.rings.forEach(function (rg) {
        p.stroke(21, 41, 58, 120 * reveal);
        p.circle(st.cx, st.cy, rg.r * 2);
      });

      // edges (batched faint teal). skip if endpoint removed.
      var ec = SB.hexToRgb(GOL.teal);
      p.strokeWeight(1);
      for (var i = 0; i < st.edges.length; i++) {
        var e = st.edges[i];
        if (st.removedSet[e.s] || st.removedSet[e.t]) continue;
        var A = st.nodes[e.s], B = st.nodes[e.t];
        var dim = filtered && A.klass !== st.activeClass && B.klass !== st.activeClass;
        p.stroke(ec[0], ec[1], ec[2], (dim ? 7 : 24) * reveal);
        p.line(A.px, A.py, B.px, B.py);
      }

      // nodes
      p.noStroke();
      for (var k = 0; k < st.nodes.length; k++) {
        var n = st.nodes[k];
        var removed = st.removedSet[k], extinct = st.extinctSet[k];
        var match = !filtered || n.klass === st.activeClass;
        var baseA = (filtered && !match ? 40 : 235) * reveal;
        if (removed) {
          p.fill(90, 100, 108, 60 * reveal);
          p.circle(n.px, n.py, n.sz * 1.6);
          continue;
        }
        var col = SB.hexToRgb(extinct ? GOL.coral : n.col);
        if ((n.core || n.hero) && match && !filtered) SB.glow(p, n.px, n.py, n.sz * 0.8, n.hero ? GOL.green : n.col, 80 * reveal);
        if (extinct) SB.glow(p, n.px, n.py, n.sz, GOL.coral, 110 * reveal);
        p.fill(col[0], col[1], col[2], baseA);
        p.circle(n.px, n.py, n.sz * 2);
        if (n.hero && reveal > 0.4) {
          p.noFill(); p.stroke(58, 214, 163, 210); p.strokeWeight(1.5);
          var puls = ctx.reduced ? 0 : Math.sin(p.frameCount * 0.06) * 3;
          p.circle(n.px, n.py, n.sz * 2 + 11 + puls);
          p.noStroke();
          SB.label(p, "Sword-billed hummingbird", n.px + 10, n.py - 8, { color: GOL.green, size: 11 });
        }
      }

      // core label
      p.push();
      p.fill(143, 163, 173, 230 * reveal);
      p.textFont("IBM Plex Mono"); p.textAlign(p.CENTER, p.CENTER); p.textSize(11);
      p.text("CORE", st.cx, st.cy - 6);
      p.fill(43, 212, 196, 230 * reveal); p.textSize(13);
      p.text("k = " + st.kmax, st.cx, st.cy + 10);
      p.pop();

      SB.vignette(p, p.width, p.height, 0.7);
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        prep();
        layout(p);
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.windowResized = function () { p.resizeCanvas(holder.offsetWidth, holder.offsetHeight); layout(p); if (ctx.reduced) p.redraw(); };
    }, holder);

    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    inst._setClass = function (key) { st.activeClass = key; if (ctx.reduced && inst.redraw) inst.redraw(); };
    inst._setRemoval = function (n) { st.removal = n; recompute(); if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
