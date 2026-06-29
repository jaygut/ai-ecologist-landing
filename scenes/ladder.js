/* The honest ladder: a maturity gauge. The structural rungs are lit and
   benchmarked; the financial rung is dimmed and labeled prototype. Below, the
   four evidence tiers, with the tier this reconstruction sits at lit. */
(function () {
  (window.SCENES = window.SCENES || {})["ladder"] = function (holder, ctx) {
    var cfg = ctx.cfg;
    var st = { t: 0 };

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 78, alpha: 16 });
      var rungs = cfg.rungs, tiers = cfg.tiers;
      var t = st.t;

      // panel area on the right half (copy card sits left)
      var panelX = p.width > 900 ? p.width * 0.46 : p.width * 0.08;
      var panelW = p.width > 900 ? p.width * 0.46 : p.width * 0.84;
      var topY = p.height * 0.2;
      var rh = Math.min(64, (p.height * 0.42) / rungs.length);
      var gap = 14;

      for (var i = 0; i < rungs.length; i++) {
        var r = rungs[i];
        var y = topY + i * (rh + gap);
        var lit = SB.smoothstep(SB.win01(t, 0.1 + i * 0.12, 0.4 + i * 0.12));
        var col = r.lit === true ? GOL.green : (r.lit === "half" ? GOL.amber : GOL.coral);
        var c = SB.hexToRgb(col);
        // bar
        p.noStroke();
        if (r.lit) { SB.glow(p, panelX + 12, y + rh / 2, 8, col, 70 * lit); }
        p.fill(11, 32, 48, 230);
        roundRect(p, panelX, y, panelW, rh, 10);
        // fill proportion for lit/half
        var fillW = r.lit === true ? panelW : (r.lit === "half" ? panelW * 0.55 : panelW * 0.16);
        p.fill(c[0], c[1], c[2], (r.lit ? 38 : 22) * lit + 8);
        roundRect(p, panelX, y, fillW, rh, 10);
        // left accent
        p.fill(c[0], c[1], c[2], 230 * Math.max(0.3, lit));
        p.rect(panelX, y + 6, 3, rh - 12, 2);
        // labels
        p.fill(234, 242, 242, 240); p.textFont("IBM Plex Sans"); p.textStyle(p.BOLD);
        p.textAlign(p.LEFT, p.CENTER); p.textSize(15);
        p.text(r.k, panelX + 16, y + rh / 2 - 9);
        p.textStyle(p.NORMAL); p.fill(143, 163, 173, 220); p.textSize(11.5);
        p.text(r.note, panelX + 16, y + rh / 2 + 11);
        // state chip
        p.textFont("IBM Plex Mono"); p.textAlign(p.RIGHT, p.CENTER); p.textSize(11);
        p.fill(c[0], c[1], c[2], 240 * Math.max(0.4, lit));
        p.text(r.state.toUpperCase(), panelX + panelW - 14, y + rh / 2);
      }

      // evidence tiers row
      var ey = topY + rungs.length * (rh + gap) + 22;
      SB.label(p, "EVIDENCE TIERS", panelX, ey - 8, { color: GOL.muted, size: 10.5 });
      var tw = panelW / tiers.length;
      for (var k = 0; k < tiers.length; k++) {
        var ti = tiers[k]; var x = panelX + k * tw;
        var on = ti.on;
        var tc = SB.hexToRgb(on ? GOL.teal : GOL.faint);
        p.noStroke();
        p.fill(on ? 26 : 18, on ? 168 : 30, on ? 155 : 42, on ? 40 : 18);
        roundRect(p, x + 3, ey, tw - 6, 30, 7);
        if (on) { p.noFill(); p.stroke(tc[0], tc[1], tc[2], 220); p.strokeWeight(1.2); roundRectStroke(p, x + 3, ey, tw - 6, 30, 7); p.noStroke(); }
        p.fill(on ? 234 : 120, on ? 242 : 140, on ? 242 : 150, 240);
        p.textFont("IBM Plex Mono"); p.textAlign(p.CENTER, p.CENTER); p.textSize(10.5);
        p.text(ti.k, x + tw / 2, ey + 15);
      }

      SB.vignette(p, p.width, p.height, 0.8);
    }
    function roundRect(p, x, y, w, h, r) { p.rect(x, y, w, h, r); }
    function roundRectStroke(p, x, y, w, h, r) { p.rect(x, y, w, h, r); }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.windowResized = function () { p.resizeCanvas(holder.offsetWidth, holder.offsetHeight); if (ctx.reduced) p.redraw(); };
    }, holder);
    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
