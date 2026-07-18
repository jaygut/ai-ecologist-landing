/* The instrument set. A radial dial: the reconstruction at the centre, then one
   concentric ring per question the battery answers, one tick per reading.
   Grouped by question rather than counted, because published work finds most
   food-web structural measures are not independent of one another.

   Layout: the dial is placed in the free band between the copy card and the
   reading panel, measured from the live DOM rather than assumed, so it can never
   be drawn underneath either of them. Hovering a tier in the panel raises its
   ring and dims the others. */
(function () {
  (window.SCENES = window.SCENES || {})["instruments"] = function (holder, ctx) {
    var cfg = ctx.cfg;
    var st = { t: 0, active: -1, hoverMix: [] };

    // ring index -> accent. One hue per question axis; colour is categorical.
    var RING_COLOR = [GOL.green, GOL.teal, GOL.purple, GOL.amber];

    function ringsFromCfg() {
      return (cfg.tiers || []).map(function (tier, i) {
        return {
          label: tier.k,
          items: tier.items || [],
          color: RING_COLOR[i] || GOL.muted,
        };
      });
    }

    /* Measure the free horizontal band between the copy card and the reading
       panel. Cached, recomputed on resize. Falls back to the whole canvas when
       the panel stacks below the stage on narrow viewports. */
    var layout = null;
    var settleFrames = 0;
    function measure(p) {
      var section = holder.closest ? holder.closest("section") : null;
      var hr = holder.getBoundingClientRect();
      var left = 0;
      var right = p.width;
      if (section) {
        var copy = section.querySelector(".copy");
        var panel = section.querySelector(".iset");
        if (copy) {
          var cr = copy.getBoundingClientRect();
          if (cr.width > 0) left = Math.max(left, cr.right - hr.left + 28);
        }
        if (panel) {
          var pr = panel.getBoundingClientRect();
          // treat the panel as a horizontal obstacle only when it sits beside
          // the stage; once it stacks below, the whole canvas is free
          if (pr.width > 0 && pr.top < hr.top + hr.height - 40) {
            right = Math.min(right, pr.left - hr.left - 28);
          }
        }
      }
      var band = right - left;
      if (!(band > 150)) { left = 0; right = p.width; band = p.width; }
      return { cx: left + band / 2, band: band };
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 82, alpha: 14 });

      var rings = ringsFromCfg();
      if (!rings.length) { SB.vignette(p, p.width, p.height, 0.8); return; }
      // the panel's height depends on webfonts, so keep re-measuring briefly
      // rather than caching a layout taken before text has settled
      if (!layout || settleFrames < 90) { layout = measure(p); settleFrames++; }

      var t = st.t;
      var cx = layout.cx;
      var cy = p.height * 0.5;
      var maxR = Math.min(layout.band * 0.44, p.height * 0.34);
      var r0 = maxR * 0.26;
      var step = (maxR - r0) / rings.length;

      // ease hover weight toward its target so highlighting is not a hard cut
      for (var h = 0; h < rings.length; h++) {
        if (st.hoverMix[h] == null) st.hoverMix[h] = 0;
        var want = st.active === -1 ? 0 : (st.active === h ? 1 : -1);
        st.hoverMix[h] += (want - st.hoverMix[h]) * 0.16;
      }

      // --- centre: the one reconstruction everything is read from ------------
      var coreIn = SB.smoothstep(SB.win01(t, 0.0, 0.16));
      if (coreIn > 0.001) {
        SB.glow(p, cx, cy, 14 * coreIn, GOL.green, 55 * coreIn);
        p.noStroke();
        var gc = SB.hexToRgb(GOL.green);
        p.fill(gc[0], gc[1], gc[2], 220 * coreIn);
        p.circle(cx, cy, 13 * coreIn);
        SB.label(p, "ONE NETWORK", cx, cy + 26, {
          align: p.CENTER, size: 9, alpha: 190 * coreIn,
        });
      }

      // --- rings --------------------------------------------------------------
      for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        var r = r0 + step * (i + 0.72);
        var c = SB.hexToRgb(ring.color);
        var ringIn = SB.smoothstep(SB.win01(t, 0.12 + i * 0.15, 0.30 + i * 0.15));
        if (ringIn <= 0.001) continue;

        var mix = st.hoverMix[i];                 // -1 dimmed, 0 rest, 1 raised
        var boost = 1 + Math.max(0, mix) * 1.9;   // the raised ring brightens
        var dim = 1 + Math.min(0, mix) * 0.62;    // others fade, never vanish

        p.noFill();
        p.stroke(c[0], c[1], c[2], 46 * ringIn * boost * dim);
        p.strokeWeight(1.1 + Math.max(0, mix) * 0.9);
        p.circle(cx, cy, r * 2);

        var n = Math.max(1, ring.items.length);
        for (var j = 0; j < n; j++) {
          var frac = j / n;
          var ang = -Math.PI / 2 + frac * Math.PI * 2;
          var lit = SB.smoothstep(
            SB.win01(t, 0.18 + i * 0.15 + frac * 0.09, 0.30 + i * 0.15 + frac * 0.09)
          );
          if (lit <= 0.001) continue;
          var tx = cx + Math.cos(ang) * r;
          var ty = cy + Math.sin(ang) * r;

          p.stroke(c[0], c[1], c[2], 22 * lit * boost * dim);
          p.strokeWeight(0.9);
          p.line(cx + Math.cos(ang) * r0 * 0.86, cy + Math.sin(ang) * r0 * 0.86, tx, ty);

          p.noStroke();
          if (lit > 0.6) SB.glow(p, tx, ty, 4.6 * boost, ring.color, 44 * lit * dim);
          p.fill(c[0], c[1], c[2], 232 * lit * dim);
          p.circle(tx, ty, (6.6 + Math.max(0, mix) * 3.4) * lit);
          p.fill(6, 20, 31, 235 * lit);
          p.circle(tx, ty, 2.7 * lit);
        }

        // ring label sits just outside its arc, at the top
        p.noStroke();
        p.fill(c[0], c[1], c[2], 205 * ringIn * dim * (1 + Math.max(0, mix) * 0.3));
        p.textFont("IBM Plex Mono");
        p.textAlign(p.CENTER, p.BASELINE);
        p.textSize(9);
        p.text(ring.label.toUpperCase(), cx, cy - r - 7);
      }

      var footIn = SB.smoothstep(SB.win01(t, 0.62, 0.8));
      if (footIn > 0.001 && cfg.canvasNote) {
        SB.label(p, cfg.canvasNote.toUpperCase(), cx, cy + maxR + 40, {
          align: p.CENTER, size: 9, alpha: 145 * footIn,
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
        layout = null;
        if (ctx.reduced) p.redraw();
      };
    }, holder);

    inst._setProgress = function (t) { st.t = t; if (ctx.reduced && inst.redraw) inst.redraw(); };
    // called by main.js when a reading tier is hovered or focused; -1 clears.
    // main.js parks non-active scenes with noLoop(), and reduced-motion parks
    // every scene, so a hover must be able to repaint on its own. When the
    // sketch is not looping the ease is snapped to its target and drawn once,
    // otherwise the draw loop eases it normally.
    inst._setActiveRing = function (i) {
      st.active = typeof i === "number" ? i : -1;
      var looping = typeof inst.isLooping === "function" ? inst.isLooping() : true;
      if (!looping) {
        for (var k = 0; k < (cfg.tiers || []).length; k++) {
          st.hoverMix[k] = st.active === -1 ? 0 : (st.active === k ? 1 : -1);
        }
        if (inst.redraw) inst.redraw();
      }
    };
    // recompute placement when the panel geometry may have changed
    inst._remeasure = function () { layout = null; };
    return inst;
  };
})();
