/* Rewiring: the system changing shape over time, read on a timeline. The
   reconstructed web sits above a time axis. Transient interactions are gained
   (green) and later lost (coral) at moments in time, plotted as events along the
   timeline. A playhead sweeps the record; as it passes each event the matching
   interaction lights up or drops out of the web above. A persistent backbone
   holds in teal throughout. The motion illustrates the temporal mechanism the
   engine measures; the validation number (a near-exact reproduction across 658
   windows) is real and sits in the copy card. */
(function () {
  (window.SCENES = window.SCENES || {})["rewiring"] = function (holder, ctx) {
    var net = ctx.data.network;
    var st = { t: 0, nodes: [], persist: [], dyn: [], events: [] };
    var rng = ctx.prng;
    var LOOP = 1 / (15 * 60); // full timeline sweep about every 15s
    var DYN_COUNT = 64; // transient interactions shown as events (keeps it legible)

    function layout(p) {
      st.w = p.width; st.h = p.height;
      if (!net) return;
      var cx = p.width * 0.5, cy = p.height * 0.36;
      var R = Math.min(p.width * 0.8, p.height * 0.62) * 0.44;
      st.nodes = net.nodes.map(function (n) {
        var fx = n.fx != null ? n.fx : n.x, fy = n.fy != null ? n.fy : n.y;
        return { x: cx + fx * R, y: cy + fy * R, col: GOL.cls[n.klass] || GOL.cls.background, sz: 2.4 + Math.sqrt(n.degree) * 0.8, core: n.coreness >= net.meta.k_max };
      });
      // choose a sample of edges to be transient; the rest are the backbone
      var idx = net.edges.map(function (e, i) { return i; });
      // deterministic shuffle by seeded key
      idx.sort(function (a, b) { return rng.next() - 0.5; });
      var dynSet = {};
      for (var i = 0; i < Math.min(DYN_COUNT, idx.length); i++) dynSet[idx[i]] = true;
      st.persist = []; st.dyn = []; st.events = [];
      net.edges.forEach(function (e, i) {
        if (dynSet[i]) {
          var t0 = rng.range(0, 0.72);
          var t1 = Math.min(1, t0 + rng.range(0.16, 0.55));
          var d = { s: e.s, t: e.t, t0: t0, t1: t1 };
          st.dyn.push(d);
          st.events.push({ time: t0, type: "gain", d: d });
          st.events.push({ time: t1, type: "loss", d: d });
        } else {
          st.persist.push({ s: e.s, t: e.t });
        }
      });
      st.events.sort(function (a, b) { return a.time - b.time; });
    }

    function render(p) {
      SB.ground(p, p.width, p.height);
      SB.instrumentGrid(p, p.width, p.height, { step: 80, alpha: 14 });
      if (!st.nodes.length) { SB.label(p, "loading", 24, p.height - 24); return; }
      var reveal = SB.smoothstep(SB.win01(st.t, 0, 0.3));
      var phase = ctx.reduced ? 0.5 : (p.frameCount * LOOP) % 1.0;
      var teal = SB.hexToRgb(GOL.teal), coral = SB.hexToRgb(GOL.coral), green = SB.hexToRgb(GOL.green);

      // --- network (upper area) ---------------------------------------------
      p.strokeWeight(1);
      p.stroke(teal[0], teal[1], teal[2], 24 * reveal);
      for (var i = 0; i < st.persist.length; i++) {
        var e = st.persist[i], A = st.nodes[e.s], B = st.nodes[e.t];
        p.line(A.x, A.y, B.x, B.y);
      }
      var gainsNow = 0, lossesNow = 0;
      for (var j = 0; j < st.dyn.length; j++) {
        var d = st.dyn[j], active = phase >= d.t0 && phase < d.t1;
        var A2 = st.nodes[d.s], B2 = st.nodes[d.t], col, a;
        if (active) {
          var sinceGain = phase - d.t0, untilLoss = d.t1 - phase;
          if (sinceGain < 0.02) { col = green; a = 95; } // just gained: flash green
          else if (untilLoss < 0.02) { col = coral; a = 85; } // about to be lost
          else { col = teal; a = 40; }
          p.strokeWeight(sinceGain < 0.02 || untilLoss < 0.02 ? 1.6 : 1);
          p.stroke(col[0], col[1], col[2], a * reveal);
          p.line(A2.x, A2.y, B2.x, B2.y);
        }
        if (phase >= d.t0) gainsNow++;
        if (phase >= d.t1) lossesNow++;
      }
      // nodes
      p.noStroke();
      st.nodes.forEach(function (n) {
        if (n.core) SB.glow(p, n.x, n.y, n.sz * 0.8, GOL.teal, 45 * reveal);
        var c = SB.hexToRgb(n.col); p.fill(c[0], c[1], c[2], 205 * reveal); p.circle(n.x, n.y, n.sz * 2);
      });

      // --- timeline (lower area) --------------------------------------------
      var axisY = p.height * 0.8, x0 = p.width * 0.08, x1 = p.width * 0.92, W = x1 - x0;
      SB.label(p, "REWIRING EVENTS OVER TIME", x0, axisY - 64, { color: GOL.muted, size: 11 });
      // axis
      p.stroke(92, 110, 120, 150 * reveal); p.strokeWeight(1); p.line(x0, axisY, x1, axisY);
      // event ticks: gains above (green), losses below (coral); lit once passed
      for (var k = 0; k < st.events.length; k++) {
        var ev = st.events[k], ex = x0 + ev.time * W;
        var passed = ev.time <= phase;
        var up = ev.type === "gain";
        var col2 = up ? green : coral;
        var alpha = (passed ? 200 : 55) * reveal;
        p.stroke(col2[0], col2[1], col2[2], alpha);
        p.strokeWeight(passed ? 1.6 : 1);
        var h = passed ? 16 : 9;
        if (up) p.line(ex, axisY, ex, axisY - h);
        else p.line(ex, axisY, ex, axisY + h);
        if (passed && Math.abs(ev.time - phase) < 0.012) {
          p.noStroke(); p.fill(col2[0], col2[1], col2[2], 230 * reveal);
          p.circle(ex, up ? axisY - h : axisY + h, 5); p.noStroke();
        }
      }
      // playhead
      var px = x0 + phase * W;
      var tb = SB.hexToRgb(GOL.tealBright);
      p.stroke(tb[0], tb[1], tb[2], 220 * reveal); p.strokeWeight(1.5);
      p.line(px, axisY - 34, px, axisY + 34);
      p.noStroke(); p.fill(tb[0], tb[1], tb[2], 230 * reveal); p.triangle(px - 5, axisY - 40, px + 5, axisY - 40, px, axisY - 32);

      // running counts + legend
      SB.label(p, "gained " + gainsNow, x0, axisY + 50, { color: GOL.green, size: 12 });
      SB.label(p, "lost " + lossesNow, x0 + 110, axisY + 50, { color: GOL.coral, size: 12 });
      SB.label(p, "persistent backbone held", x0 + 210, axisY + 50, { color: GOL.teal, size: 12 });
      SB.label(p, "MOTION ILLUSTRATES THE TEMPORAL MECHANISM  /  THE VALIDATION NUMBER IS MEASURED", x0, p.height - 22, { color: GOL.muted, size: 11 });

      SB.cornerBrackets(p, p.width, p.height, { alpha: 52 });
      SB.vignette(p, p.width, p.height, 0.76);
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
