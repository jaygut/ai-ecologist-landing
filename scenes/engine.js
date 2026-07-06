/* The engine. A multilayered stack, input at the base, a deterministic
   decision at the top. Machine reasoning is one bounded layer in the middle,
   checked against ecological rules and network structure. Data rises through the
   stack and each layer lights in turn. The value is the layered reconstruction
   and the owned, reproducible decision
   layer, grounded in ecological and network science. Layer copy lives in config. */
(function () {
  (window.SCENES = window.SCENES || {})["engine"] = function (holder, ctx) {
    var layers = (ctx.cfg.layers || []).slice();
    var st = { t: 0, plates: [], particles: [] };
    var rng = ctx.prng;

    function layout(p) {
      st.w = p.width; st.h = p.height;
      var n = layers.length || 5;
      var x0 = p.width * 0.07, plateW = Math.min(p.width * 0.5, 560);
      var top = p.height * 0.12, bot = p.height * 0.88;
      var gap = (bot - top) * 0.05;
      var ph = (bot - top - gap * (n - 1)) / n;
      st.plates = layers.map(function (L, i) {
        // i = 0 is the base (input); stack upward
        var y = bot - ph - (n - 1 - i) * (ph + gap);
        return { x: x0, y: y, w: plateW, h: ph, L: L, i: i };
      });
      // rising data particles channelled up the centre of the stack
      var cx = x0 + plateW * 0.5;
      st.particles = [];
      for (var k = 0; k < 64; k++) {
        st.particles.push({ x: cx + rng.jitter(plateW * 0.34), u: rng.next(), sp: rng.range(0.0016, 0.0042), col: rng.next() });
      }
      st.cx = cx; st.top = top; st.bot = bot;
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 80, alpha: 14 });
      if (!st.plates.length) { return; }
      var t = st.t;
      var teal = SB.hexToRgb(GOL.teal), green = SB.hexToRgb(GOL.green), coral = SB.hexToRgb(GOL.coral);

      // rising data flow through the stack (bounded inside the column)
      if (!ctx.reduced) st.particles.forEach(function (q) { q.u += q.sp; if (q.u > 1) q.u -= 1; });
      var flowLit = SB.smoothstep(SB.win01(t, 0.05, 0.5));
      p.noStroke();
      st.particles.forEach(function (q) {
        var y = st.bot - q.u * (st.bot - st.top);
        var c = q.col < 0.78 ? teal : (q.col < 0.92 ? green : coral);
        p.fill(c[0], c[1], c[2], 150 * flowLit);
        p.circle(q.x, y, 2.4);
      });

      // plates: light bottom-to-top as data rises
      st.plates.forEach(function (pl) {
        var lit = SB.smoothstep(SB.win01(t, 0.08 + pl.i * 0.15, 0.3 + pl.i * 0.15));
        var L = pl.L;
        var acc = SB.hexToRgb(L.accent || GOL.teal);
        // plate body
        if (lit > 0.05) SB.glow(p, pl.x + 8, pl.y + pl.h / 2, 10, L.accent || GOL.teal, 60 * lit);
        p.noStroke(); p.fill(11, 32, 48, 215); p.rect(pl.x, pl.y, pl.w, pl.h, 12);
        p.fill(acc[0], acc[1], acc[2], (18 + 22 * lit)); p.rect(pl.x, pl.y, pl.w * (0.25 + 0.75 * lit), pl.h, 12);
        p.noFill(); p.stroke(acc[0], acc[1], acc[2], 90 + 130 * lit); p.strokeWeight(1.2); p.rect(pl.x, pl.y, pl.w, pl.h, 12);
        // left accent bar
        p.noStroke(); p.fill(acc[0], acc[1], acc[2], 200 + 55 * lit); p.rect(pl.x, pl.y + 8, 4, pl.h - 16, 2);
        // number
        p.fill(acc[0], acc[1], acc[2], 150 + 105 * lit);
        p.textFont("IBM Plex Mono"); p.textAlign(p.LEFT, p.CENTER); p.textSize(Math.min(16, pl.h * 0.3));
        p.text("0" + (pl.i + 1), pl.x + 18, pl.y + pl.h / 2);
        // name
        p.fill(234, 242, 242, 160 + 95 * lit); p.textFont("IBM Plex Sans"); p.textStyle(p.BOLD);
        p.textSize(Math.min(21, pl.h * 0.36)); p.textAlign(p.LEFT, p.BASELINE);
        p.text(L.name, pl.x + 56, pl.y + pl.h / 2 - 2);
        // sublabel
        p.textStyle(p.NORMAL); p.fill(143, 163, 173, 160 + 70 * lit);
        p.textFont("IBM Plex Mono"); p.textSize(Math.min(12, pl.h * 0.2));
        p.text(L.sub, pl.x + 56, pl.y + pl.h / 2 + 16);
        // bounded chip on the machine-reasoning layer
        if (L.chip) {
          var cw = 92, chx = pl.x + pl.w - cw - 14, chy = pl.y + pl.h / 2 - 12;
          p.noStroke(); p.fill(acc[0], acc[1], acc[2], 28 * lit + 6); p.rect(chx, chy, cw, 24, 12);
          p.noFill(); p.stroke(acc[0], acc[1], acc[2], 150 * lit); p.strokeWeight(1); p.rect(chx, chy, cw, 24, 12);
          p.noStroke(); p.fill(acc[0], acc[1], acc[2], 160 + 80 * lit); p.textAlign(p.CENTER, p.CENTER); p.textSize(10.5);
          p.text(L.chip, chx + cw / 2, chy + 12);
          p.textAlign(p.LEFT, p.BASELINE);
        }
      });

      SB.label(p, "CONNECTIVITY ACROSS A MAP MEANS CORRIDORS.  WE MEASURE WHETHER THE WEB ITSELF HOLDS.", st.plates[0].x, p.height - 22, { color: GOL.muted, size: 11 });
      SB.cornerBrackets(p, p.width, p.height, { alpha: 56 });
      SB.vignette(p, p.width, p.height, 0.72);
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
