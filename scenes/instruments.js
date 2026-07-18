/* The instrument set. A radial dial: the reconstruction at the centre, then one
   concentric ring per question the battery answers, one tick per reading.
   Grouped by question rather than counted, because published work finds most
   food-web structural measures are not independent of one another. */
(function () {
  (window.SCENES = window.SCENES || {})["instruments"] = function (holder, ctx) {
    var cfg = ctx.cfg;
    var st = { t: 0 };

    // ring index -> accent. One hue per question axis; colour is categorical.
    var RING_COLOR = [GOL.green, GOL.teal, GOL.purple, GOL.amber];

    function ringsFromCfg() {
      var rings = (cfg.tiers || []).map(function (tier, i) {
        return {
          label: tier.k,
          note: tier.note,
          count: (tier.items || []).length,
          items: tier.items || [],
          color: RING_COLOR[i] || GOL.muted,
        };
      });
      return rings;
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 82, alpha: 14 });

      var rings = ringsFromCfg();
      if (!rings.length) { SB.vignette(p, p.width, p.height, 0.8); return; }

      var t = st.t;
      var wide = p.width > 900;
      // dial sits right of the copy card on wide screens, centred otherwise
      var cx = wide ? p.width * 0.68 : p.width * 0.5;
      var cy = p.height * 0.5;
      var maxR = Math.min(wide ? p.width * 0.26 : p.width * 0.40, p.height * 0.38);
      var r0 = maxR * 0.30;
      var step = (maxR - r0) / Math.max(1, rings.length);

      // --- centre: the reconstruction ---------------------------------------
      var coreIn = SB.smoothstep(SB.win01(t, 0.0, 0.16));
      SB.glow(p, cx, cy, 16 * coreIn, GOL.green, 60 * coreIn);
      p.noStroke();
      var gc = SB.hexToRgb(GOL.green);
      p.fill(gc[0], gc[1], gc[2], 220 * coreIn);
      p.circle(cx, cy, 15 * coreIn);
      p.fill(234, 242, 242, 235 * coreIn);
      p.textFont("IBM Plex Mono");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(9.5);
      p.text("ONE NETWORK", cx, cy + 30 * coreIn);

      // --- rings -------------------------------------------------------------
      for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        var r = r0 + step * (i + 0.75);
        var c = SB.hexToRgb(ring.color);
        // ring appears, then its ticks light one by one
        var ringIn = SB.smoothstep(SB.win01(t, 0.12 + i * 0.16, 0.30 + i * 0.16));
        if (ringIn <= 0.001) continue;

        // the arc itself
        p.noFill();
        p.stroke(c[0], c[1], c[2], 46 * ringIn);
        p.strokeWeight(1.1);
        p.circle(cx, cy, r * 2);

        // ticks, evenly spaced, one per instrument family
        var n = Math.max(1, ring.items.length);
        for (var j = 0; j < n; j++) {
          var frac = j / n;
          var ang = -Math.PI / 2 + frac * Math.PI * 2;
          var lit = SB.smoothstep(
            SB.win01(t, 0.18 + i * 0.16 + frac * 0.10, 0.30 + i * 0.16 + frac * 0.10)
          );
          if (lit <= 0.001) continue;
          var tx = cx + Math.cos(ang) * r;
          var ty = cy + Math.sin(ang) * r;

          // spoke back toward the centre, faint
          p.stroke(c[0], c[1], c[2], 22 * lit);
          p.strokeWeight(0.9);
          p.line(cx + Math.cos(ang) * r0 * 0.9, cy + Math.sin(ang) * r0 * 0.9, tx, ty);

          // the instrument node
          p.noStroke();
          if (lit > 0.6) SB.glow(p, tx, ty, 5.2, ring.color, 46 * lit);
          p.fill(c[0], c[1], c[2], 232 * lit);
          p.circle(tx, ty, 7.4 * lit);
          p.fill(6, 20, 31, 235 * lit);
          p.circle(tx, ty, 3.0 * lit);
        }

        // ring label, set just outside the arc at the top
        var labelAlpha = 210 * ringIn;
        p.noStroke();
        p.fill(c[0], c[1], c[2], labelAlpha);
        p.textFont("IBM Plex Mono");
        p.textAlign(p.CENTER, p.BASELINE);
        p.textSize(9.5);
        p.text(ring.label.toUpperCase(), cx, cy - r - 9);
      }

      // --- footer note -------------------------------------------------------
      var footIn = SB.smoothstep(SB.win01(t, 0.62, 0.8));
      if (footIn > 0.001 && cfg.canvasNote) {
        SB.label(p, cfg.canvasNote.toUpperCase(), cx, cy + maxR + 34, {
          align: p.CENTER,
          size: 9.5,
          alpha: 150 * footIn,
        });
      }

      SB.vignette(p, p.width, p.height, 0.82);
    }

    var inst = new p5(function (p) {
      p.setup = function () {
        p.createCanvas(holder.offsetWidth || window.innerWidth, holder.offsetHeight || window.innerHeight);
        p.pixelDensity(Math.min(1.5, window.devicePixelRatio || 1));
        if (ctx.reduced) p.noLoop();
      };
      p.draw = function () { render(p); };
      p.windowResized = function () {
        p.resizeCanvas(holder.offsetWidth, holder.offsetHeight);
        if (ctx.reduced) p.redraw();
      };
    }, holder);
    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    return inst;
  };
})();
