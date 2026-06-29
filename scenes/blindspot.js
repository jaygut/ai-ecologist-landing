/* Blind spot: a flat grid of species dots (the inventory everyone holds).
   The hidden interactions flicker underneath and vanish, the point being that
   the connections are real but unmeasured. Muted, almost no accent. */
(function () {
  (window.SCENES = window.SCENES || {})["blindspot"] = function (holder, ctx) {
    var st = { t: 0, dots: [], links: [] };
    var rng = ctx.prng;

    function layout(p) {
      st.dots = [];
      var cols = Math.max(7, Math.floor(p.width / 86));
      var rows = Math.max(5, Math.floor(p.height / 96));
      var mx = p.width * 0.12, my = p.height * 0.2;
      var gw = (p.width - mx * 2) / (cols - 1), gh = (p.height - my * 2) / (rows - 1);
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          st.dots.push({ x: mx + c * gw + rng.jitter(5), y: my + r * gh + rng.jitter(5) });
        }
      }
      // hidden links between random nearby dots
      st.links = [];
      for (var i = 0; i < st.dots.length; i++) {
        for (var k = 0; k < 2; k++) {
          var j = rng.int(0, st.dots.length - 1);
          if (j !== i && Math.hypot(st.dots[i].x - st.dots[j].x, st.dots[i].y - st.dots[j].y) < gw * 2.4) {
            st.links.push({ a: i, b: j, ph: rng.range(0, 6.28), sp: rng.range(0.5, 1.6) });
          }
        }
      }
      st.w = p.width; st.h = p.height;
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 64, alpha: 22 });
      var t = st.t;
      // links emerge as t rises (the unmeasured web becoming visible)
      var reveal = SB.smoothstep(SB.win01(t, 0.25, 0.95));
      p.strokeWeight(1);
      st.links.forEach(function (l) {
        var a = st.dots[l.a], b = st.dots[l.b];
        var flick = ctx.reduced ? 0.6 : (0.4 + 0.6 * Math.abs(Math.sin(p.frameCount * 0.02 * l.sp + l.ph)));
        var alpha = 46 * reveal * flick;
        p.stroke(26, 168, 155, alpha);
        p.line(a.x, a.y, b.x, b.y);
      });
      // the dots: the flat inventory, always present, muted
      p.noStroke();
      st.dots.forEach(function (d) {
        p.fill(120, 140, 150, 150);
        p.circle(d.x, d.y, 5.2);
      });
      SB.cornerBrackets(p, p.width, p.height, { alpha: 55, color: GOL.faint });
      SB.vignette(p, p.width, p.height, 0.82);
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
