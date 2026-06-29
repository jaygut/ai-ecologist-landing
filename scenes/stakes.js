/* Stakes: fog catches on a forested ridge and runs down as water, and at the
   base the value lands on a ledger. Illustrative. The cloud forest feeds a city,
   and when the web fails the cost shows up on a balance sheet. */
(function () {
  (window.SCENES = window.SCENES || {})["stakes"] = function (holder, ctx) {
    var st = { t: 0, fog: [], drops: [], ridge: [], cells: [] };
    var rng = ctx.prng;

    function ridgeYAt(x) {
      if (!st.ridge.length) return 0;
      var i = Math.max(0, Math.min(st.ridge.length - 1, Math.floor(x / 8)));
      return st.ridge[i].y;
    }

    function layout(p) {
      st.w = p.width; st.h = p.height;
      var yBase = p.height * 0.5;
      st.ridge = [];
      for (var x = 0; x <= p.width; x += 8) {
        var n = p.noise(x * 0.0016, 11.3);
        st.ridge.push({ x: x, y: yBase + (n - 0.5) * p.height * 0.22 });
      }
      st.fog = [];
      for (var i = 0; i < 240; i++) {
        st.fog.push({ x: rng.range(0, p.width), y: rng.range(p.height * 0.12, p.height * 0.6), r: rng.range(16, 52), sp: rng.range(0.1, 0.4), ph: rng.range(0, 6.28) });
      }
      st.drops = [];
      for (var j = 0; j < 130; j++) {
        var rx = rng.range(0, p.width);
        st.drops.push({ x: rx, y: ridgeYAt(rx), v: rng.range(0.7, 2.4), len: rng.range(6, 16) });
      }
      // ledger grid at the base
      st.cells = [];
      var ly = p.height * 0.82, lh = p.height * 0.14;
      var cols = Math.max(8, Math.floor(p.width / 76));
      var rows = 3, cw = p.width / cols, ch = lh / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          st.cells.push({ x: c * cw, y: ly + r * ch, w: cw, h: ch, lit: rng.next(), order: rng.next() });
        }
      }
      st.ledgerY = ly;
    }

    function render(p) {
      var g = p.drawingContext.createLinearGradient(0, 0, 0, p.height);
      g.addColorStop(0, "#06141f"); g.addColorStop(0.55, "#081d29"); g.addColorStop(1, "#0a2433");
      p.drawingContext.fillStyle = g; p.drawingContext.fillRect(0, 0, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 84, alpha: 14 });
      var t = st.t;
      var rise = SB.smoothstep(SB.win01(t, 0, 0.55));
      var fc = ctx.reduced ? 0 : p.frameCount;

      // fog
      p.noStroke();
      st.fog.forEach(function (f) {
        if (!ctx.reduced) { f.y -= f.sp * (0.5 + rise); if (f.y < p.height * 0.08) f.y = p.height * 0.62; }
        var a = 14 + 13 * rise + Math.sin(fc * 0.02 + f.ph) * 5;
        p.fill(26, 168, 155, a);
        p.circle(f.x, f.y, f.r * (0.7 + rise * 0.5));
      });

      // ridge
      p.fill(5, 15, 23, 245);
      p.beginShape(); p.vertex(0, p.height);
      st.ridge.forEach(function (pt) { p.vertex(pt.x, pt.y); });
      p.vertex(p.width, p.height); p.endShape(p.CLOSE);
      p.noFill(); p.stroke(26, 168, 155, 100); p.strokeWeight(1.4);
      p.beginShape(); st.ridge.forEach(function (pt) { p.vertex(pt.x, pt.y); }); p.endShape();

      // water running down the slope
      p.noStroke();
      st.drops.forEach(function (d) {
        if (!ctx.reduced) { d.y += d.v * (0.4 + rise); if (d.y > st.ledgerY) d.y = ridgeYAt(d.x); }
        var below = SB.smoothstep((d.y - ridgeYAt(d.x)) / (p.height * 0.28));
        p.fill(58, 214, 163, 150 * rise * below);
        p.rect(d.x, d.y, 1.6, d.len);
      });

      // ledger at the base: faint cells, a few light up as the cost lands
      var litN = SB.smoothstep(SB.win01(t, 0.3, 1));
      st.cells.forEach(function (cell) {
        p.noFill(); p.stroke(21, 41, 58, 150); p.strokeWeight(1);
        p.rect(cell.x, cell.y, cell.w, cell.h);
        if (cell.lit > 0.74 && cell.order < litN) {
          var warm = cell.lit > 0.9 ? GOL.coral : GOL.amber;
          var wc = SB.hexToRgb(warm);
          p.noStroke(); p.fill(wc[0], wc[1], wc[2], 30 + 40 * litN);
          p.rect(cell.x + 2, cell.y + 2, cell.w - 4, cell.h - 4);
        }
      });
      SB.label(p, "VALUE ON NO LEDGER  /  COST ON EVERY LEDGER", 26, p.height - 16, { color: GOL.muted, size: 11 });

      SB.cornerBrackets(p, p.width, p.height, { alpha: 56, color: GOL.teal });
      SB.vignette(p, p.width, p.height, 0.76);
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        p.noiseSeed(42);
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
