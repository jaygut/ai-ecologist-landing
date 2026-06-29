/* Hero: a small living network. Energy flows along edges between three
   signature nodes (teal connection, green signal, coral keystone) and a
   constellation around them. Forms on load; gently disperses as you scroll on. */
(function () {
  (window.SCENES = window.SCENES || {})["hero"] = function (holder, ctx) {
    var st = { t: 0, w: 0, h: 0, nodes: [], edges: [], flows: [] };
    var rng = ctx.prng;

    function layout(p) {
      st.w = p.width; st.h = p.height;
      // three signature anchors placed away from the centred copy card
      var anchors = [
        { x: p.width * 0.17, y: p.height * 0.30, c: "#1aa89b", r: 9, sig: true },
        { x: p.width * 0.83, y: p.height * 0.25, c: "#3ad6a3", r: 9, sig: true },
        { x: p.width * 0.5, y: p.height * 0.84, c: "#e8694d", r: 11, sig: true },
      ];
      // ambient field spread across the whole viewport
      var extra = p.width < 700 ? 14 : 24;
      for (var i = 0; i < extra; i++) {
        anchors.push({
          x: rng.range(p.width * 0.04, p.width * 0.96),
          y: rng.range(p.height * 0.06, p.height * 0.96),
          c: "#1aa89b", r: rng.range(2.5, 5), sig: false,
        });
      }
      st.nodes = anchors;
      // edges: signatures linked, every node to its 2 nearest neighbours
      st.edges = [[0, 1], [1, 2], [2, 0]];
      for (var k = 3; k < anchors.length; k++) {
        var d = anchors.map(function (n, idx) { return { idx: idx, dd: idx === k ? 1e9 : Math.hypot(n.x - anchors[k].x, n.y - anchors[k].y) }; });
        d.sort(function (a, b) { return a.dd - b.dd; });
        st.edges.push([k, d[0].idx]);
        if (rng.next() > 0.35) st.edges.push([k, d[1].idx]);
      }
      st.flows = [];
      for (var f = 0; f < 120; f++) {
        st.flows.push({ e: rng.int(0, st.edges.length - 1), u: rng.next(), sp: rng.range(0.0016, 0.005) });
      }
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 70, alpha: 26 });
      var t = st.t;
      var form = 1 - SB.smoothstep(SB.win01(t, 0.45, 1)); // present on load, then disperse on scroll
      var breathe = ctx.reduced ? 1 : 1 + Math.sin(p.frameCount * 0.012) * 0.012;
      var disperse = SB.smoothstep(SB.win01(t, 0.5, 1));
      p.push();
      p.translate(p.width * 0.5, p.height * 0.46);
      p.scale(breathe);
      p.translate(-p.width * 0.5, -p.height * 0.46);

      // edges
      p.stroke(26, 168, 155, 70 * (form));
      p.strokeWeight(1.1);
      st.edges.forEach(function (e) {
        var a = st.nodes[e[0]], b = st.nodes[e[1]];
        var ax = a.x + (a.x - p.width / 2) * disperse * 0.6, ay = a.y + (a.y - p.height / 2) * disperse * 0.6;
        var bx = b.x + (b.x - p.width / 2) * disperse * 0.6, by = b.y + (b.y - p.height / 2) * disperse * 0.6;
        p.line(ax, ay, bx, by);
      });

      // flow particles
      if (!ctx.reduced) st.flows.forEach(function (fl) { fl.u += fl.sp; if (fl.u > 1) fl.u -= 1; });
      p.noStroke();
      st.flows.forEach(function (fl) {
        var e = st.edges[fl.e]; if (!e) return;
        var a = st.nodes[e[0]], b = st.nodes[e[1]];
        var x = SB.lerp(a.x, b.x, fl.u), y = SB.lerp(a.y, b.y, fl.u);
        x += (x - p.width / 2) * disperse * 0.6; y += (y - p.height / 2) * disperse * 0.6;
        p.fill(43, 212, 196, 210 * form);
        p.circle(x, y, 2.4);
      });

      // nodes
      st.nodes.forEach(function (n) {
        var x = n.x + (n.x - p.width / 2) * disperse * 0.6, y = n.y + (n.y - p.height / 2) * disperse * 0.6;
        if (n.sig) SB.glow(p, x, y, n.r, n.c, 110 * form);
        var c = SB.hexToRgb(n.c);
        p.noStroke();
        p.fill(c[0], c[1], c[2], 255 * form);
        p.circle(x, y, n.r * 2);
      });
      p.pop();

      SB.cornerBrackets(p, p.width, p.height, { alpha: 70 * form });
      SB.vignette(p, p.width, p.height, 0.8);
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        var w = holder.offsetWidth || window.innerWidth, h = holder.offsetHeight || window.innerHeight;
        p.createCanvas(w, h);
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
