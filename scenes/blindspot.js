/* The blind spot (the aha). A species count and an intactness score read healthy
   and never move. Underneath, the interaction network loses its load-bearing
   species and comes apart into disconnected pieces. The conventional metric
   cannot see it. Illustrative, by design. */
(function () {
  (window.SCENES = window.SCENES || {})["blindspot"] = function (holder, ctx) {
    var st = { t: 0, nodes: [], intra: [], inter: [], clusters: [], cx: 0, cy: 0 };
    var rng = ctx.prng;
    var NCLUST = 4, PER = 17, NKEY = 3;
    var COUNT = 248; // illustrative species count

    function layout(p) {
      st.w = p.width; st.h = p.height;
      st.cx = p.width * 0.5; st.cy = p.height * 0.52;
      var ringR = Math.min(p.width, p.height) * 0.17;
      // cluster centres around the scene centre (intact = pulled inward)
      st.clusters = [];
      for (var c = 0; c < NCLUST; c++) {
        var a = (Math.PI * 2 * c) / NCLUST - Math.PI / 2;
        st.clusters.push({ ang: a, dir: { x: Math.cos(a), y: Math.sin(a) }, baseR: ringR });
      }
      st.nodes = [];
      // member nodes per cluster
      for (var ci = 0; ci < NCLUST; ci++) {
        var cl = st.clusters[ci];
        for (var k = 0; k < PER; k++) {
          var rr = rng.range(8, ringR * 0.72), aa = rng.range(0, Math.PI * 2);
          st.nodes.push({
            cluster: ci, key: false,
            ox: Math.cos(aa) * rr, oy: Math.sin(aa) * rr, // offset from cluster centre
            sz: rng.range(3.2, 5.2),
          });
        }
      }
      // keystone bridge nodes near the centre, each linking 2-3 clusters
      st.keys = [];
      for (var kk = 0; kk < NKEY; kk++) {
        var idx = st.nodes.length;
        st.nodes.push({ cluster: -1, key: true, ox: rng.jitter(ringR * 0.25), oy: rng.jitter(ringR * 0.25), sz: 7.5, kid: kk });
        st.keys.push(idx);
      }
      // intra-cluster edges
      st.intra = [];
      for (var a2 = 0; a2 < st.nodes.length; a2++) {
        if (st.nodes[a2].key) continue;
        for (var r = 0; r < 2; r++) {
          var b = rng.int(0, st.nodes.length - 1);
          if (b !== a2 && !st.nodes[b].key && st.nodes[b].cluster === st.nodes[a2].cluster) st.intra.push([a2, b]);
        }
      }
      // inter-cluster edges THROUGH keystones (the bridges that fail)
      st.inter = [];
      st.keys.forEach(function (ki, n2) {
        for (var t2 = 0; t2 < 10; t2++) {
          var b2 = rng.int(0, st.nodes.length - 1);
          if (!st.nodes[b2].key) st.inter.push([ki, b2]);
        }
      });
    }

    function nodePos(n, frag) {
      var cl = n.cluster >= 0 ? st.clusters[n.cluster] : null;
      // keystones collapse toward centre and fade; clusters drift outward on frag
      if (!cl) return { x: st.cx + n.ox, y: st.cy + n.oy };
      var drift = (0.15 + frag * 1.25) * cl.baseR;
      return { x: st.cx + cl.dir.x * drift + n.ox, y: st.cy + cl.dir.y * drift + n.oy };
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 70, alpha: 16 });
      if (!st.nodes.length) { SB.label(p, "loading", 24, p.height - 24); return; }
      var t = st.t;
      var web = SB.smoothstep(SB.win01(t, 0.18, 0.42)); // hidden network resolves
      var frag = SB.smoothstep(SB.win01(t, 0.52, 0.96)); // keystones fail, web fragments

      var pos = st.nodes.map(function (n) { return nodePos(n, frag); });

      // intra-cluster edges (survive; dim a touch as the system degrades)
      var teal = SB.hexToRgb(GOL.teal);
      p.strokeWeight(1);
      st.intra.forEach(function (e) {
        var A = pos[e[0]], B = pos[e[1]];
        p.stroke(teal[0], teal[1], teal[2], 34 * web * (1 - frag * 0.5));
        p.line(A.x, A.y, B.x, B.y);
      });
      // inter-cluster bridge edges through keystones (these break)
      st.inter.forEach(function (e) {
        var A = pos[e[0]], B = pos[e[1]];
        p.stroke(teal[0], teal[1], teal[2], 40 * web * (1 - frag));
        p.line(A.x, A.y, B.x, B.y);
      });

      // nodes
      p.noStroke();
      st.nodes.forEach(function (n, i) {
        var P = pos[i];
        if (n.key) {
          // keystone: load-bearing, then fails (goes coral then dark)
          var alive = 1 - frag;
          if (web > 0.2) SB.glow(p, P.x, P.y, n.sz, frag > 0.4 ? GOL.coral : GOL.green, 90 * web * Math.max(0.25, alive));
          var c = SB.hexToRgb(frag > 0.4 ? GOL.coral : GOL.green);
          p.fill(c[0], c[1], c[2], 235 * Math.max(0.2, alive));
          p.circle(P.x, P.y, n.sz * 2);
        } else {
          var dim = 1 - frag * 0.55;
          p.fill(150, 165, 175, 210 * dim);
          p.circle(P.x, P.y, n.sz * 2);
        }
      });

      // the conventional metric: counted, and PASSING, and never moving
      drawScoreCard(p, web);

      // the aha line
      if (frag > 0.25) {
        var a = SB.smoothstep(SB.win01(t, 0.62, 0.85)) * 255;
        p.push();
        p.textFont("IBM Plex Sans"); p.textStyle(p.BOLD); p.textAlign(p.CENTER, p.CENTER);
        p.textSize(Math.min(30, p.width * 0.026));
        p.fill(234, 242, 242, a);
        p.text("Same count. Same score. A different system.", p.width * 0.5, p.height * 0.9);
        p.textStyle(p.NORMAL); p.textSize(13); p.fill(143, 163, 173, a);
        p.text("The count never moved. Condition is whether the structure holds.", p.width * 0.5, p.height * 0.9 + 30);
        p.pop();
      }

      SB.cornerBrackets(p, p.width, p.height, { alpha: 50, color: GOL.faint });
      SB.vignette(p, p.width, p.height, 0.8);
    }

    function drawScoreCard(p, web) {
      var w = 300, h = 108;
      var x = p.width < 820 ? p.width * 0.5 - w / 2 : 56, y = p.height * 0.13;
      p.push();
      p.noStroke(); p.fill(11, 32, 48, 222); p.rect(x, y, w, h, 12);
      p.noFill(); p.stroke(21, 41, 58, 255); p.strokeWeight(1); p.rect(x, y, w, h, 12);
      p.noStroke();
      // count (left)
      p.textFont("IBM Plex Mono"); p.textAlign(p.LEFT, p.BASELINE);
      p.fill(234, 242, 242, 255); p.textSize(46); p.text(COUNT, x + 22, y + 58);
      p.fill(143, 163, 173, 255); p.textSize(11); p.text("SPECIES COUNTED", x + 24, y + 80);
      // intactness label + a green PASS pill that never changes (right)
      var g = SB.hexToRgb(GOL.green);
      var px0 = x + w - 116, py0 = y + 22, pw = 92, ph = 28;
      p.fill(143, 163, 173, 220); p.textSize(10); p.textAlign(p.LEFT, p.BASELINE);
      p.text("INTACTNESS", px0, py0 - 5);
      p.noStroke(); p.fill(g[0], g[1], g[2], 32); p.rect(px0, py0, pw, ph, 14);
      p.noFill(); p.stroke(g[0], g[1], g[2], 205); p.strokeWeight(1); p.rect(px0, py0, pw, ph, 14);
      p.noStroke(); p.fill(g[0], g[1], g[2], 255); p.textSize(14); p.textAlign(p.CENTER, p.CENTER);
      p.text("PASS", px0 + pw / 2, py0 + ph / 2 + 1);
      p.textAlign(p.LEFT, p.BASELINE); p.fill(143, 163, 173, 220); p.textSize(10.5);
      p.text("diversity high", px0, y + 80);
      p.pop();
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
