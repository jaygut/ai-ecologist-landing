/* ============================================================================
   Orchestration: inject copy from config, build scenes, drive scroll progress,
   lazy-init p5 sketches, accessibility, reduced motion. No copy lives here.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CFG;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SHARED = { network: null, atlas: null, reduced: reduced };
  var instances = {}; // sceneId -> p5 instance
  var sections = {}; // sceneId -> section element

  // ---- small DOM helpers ---------------------------------------------------
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function buildCopyCard(s) {
    if (s.copyPos === "none") return null;
    var card = el("div", "copy copy--" + (s.copyPos || "tl"));
    var eye = el("div", "eyebrow");
    eye.innerHTML = '<span class="node"></span>' + esc(s.eyebrow);
    card.appendChild(eye);
    var h = el("h2");
    h.innerHTML = s.title; // title may carry <em>
    card.appendChild(h);
    if (s.body) card.appendChild(el("p", "copy__body", s.body));
    if (s.readouts) {
      var r = el("div", "readouts");
      s.readouts.forEach(function (ro) {
        var item = el("div", "readout");
        item.appendChild(el("div", "readout__v " + (ro.cls || ""), esc(ro.v)));
        item.appendChild(el("div", "readout__k", esc(ro.k)));
        r.appendChild(item);
      });
      card.appendChild(r);
    }
    if (s.chips) {
      var ch = el("div", "chips");
      s.chips.forEach(function (c) {
        ch.appendChild(el("span", "chip", c.k ? (esc(c.k) + ": <b>" + esc(c.v) + "</b>") : ("<b>" + esc(c.v) + "</b>")));
      });
      card.appendChild(ch);
    }
    if (s.badge) {
      var b = el("div", "badge is-" + s.badge.kind);
      b.innerHTML = '<span class="dot"></span>' + esc(s.badge.label);
      card.appendChild(b);
    }
    return card;
  }

  // ---- anatomy-specific DOM (instrument panel, class chips, keynote) -------
  function buildAnatomyDOM(stage, s) {
    // class filter chips
    var bar = el("div", "classbar");
    s.classes.forEach(function (c) {
      var chip = el("button", "classchip");
      chip.setAttribute("aria-pressed", c.key === "all" ? "true" : "false");
      chip.setAttribute("data-class", c.key);
      chip.innerHTML =
        '<span class="sw" style="background:' + c.color + '"></span>' +
        esc(c.label) +
        ' <span class="ct">' + c.count + "</span>";
      chip.addEventListener("click", function () {
        bar.querySelectorAll(".classchip").forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");
        var inst = instances[s.id];
        if (inst && inst._setClass) inst._setClass(c.key);
      });
      bar.appendChild(chip);
    });
    stage.appendChild(bar);

    // structural integrity panel
    var p = s.panel;
    var panel = el("div", "si-panel");
    var eb = el("div", "si-panel__eyebrow");
    eb.innerHTML =
      '<span class="node"></span>' +
      p.eyebrow
        .map(function (x, i) {
          return i === 0 ? "<span>" + esc(x) + "</span>" : '<span class="sub">' + esc(x) + "</span>";
        })
        .join(' <span class="sub">&middot;</span> ');
    panel.appendChild(eb);

    var score = el("div", "si-score");
    score.innerHTML =
      '<span class="si-score__big" id="si-score-val">' + p.score + "</span>" +
      '<span class="si-score__note">' + esc(p.scoreNote) + "</span>";
    panel.appendChild(score);
    panel.appendChild(el("div", "si-tier", esc(p.tier)));
    panel.appendChild(el("div", "si-desc", p.desc));

    // gradient bar
    var bar2 = el("div", "si-bar");
    var track = el("div", "si-bar__track");
    var mk = el("div", "si-bar__marker");
    mk.style.left = p.bar.value + "%";
    mk.id = "si-marker";
    track.appendChild(mk);
    bar2.appendChild(track);
    var scale = el("div", "si-bar__scale");
    p.bar.scale.forEach(function (x) {
      scale.appendChild(el("span", null, esc(x)));
    });
    bar2.appendChild(scale);
    panel.appendChild(bar2);

    // metric grid
    var grid = el("div", "si-grid");
    p.cards.forEach(function (c) {
      var card = el("div", "si-card");
      card.innerHTML =
        '<div class="si-card__v">' + esc(c.v) + "</div>" +
        '<div class="si-card__k">' + esc(c.k) + "</div>" +
        '<div class="si-card__d">' + esc(c.d) + "</div>";
      grid.appendChild(card);
    });
    panel.appendChild(grid);

    // removal slider (live, recomputed from the real network)
    var ctrl = el("div", "removal-ctrl");
    ctrl.innerHTML =
      "<label for='rm-" + s.id + "'>" + esc(s.slider.label) + "</label>" +
      "<input id='rm-" + s.id + "' type='range' min='0' max='20' value='0' step='1' />" +
      "<div class='live'>" +
      "<span>removed <b id='rm-n'>0</b></span>" +
      "<span>connected <b id='rm-lcc'>100%</b></span>" +
      "<span>knock-on losses <b id='rm-sec'>0</b></span>" +
      "</div>";
    panel.appendChild(ctrl);
    ctrl.querySelector("input").addEventListener("input", function (e) {
      var inst = instances[s.id];
      if (inst && inst._setRemoval) inst._setRemoval(parseInt(e.target.value, 10));
    });

    panel.appendChild(el("div", "callout", "<strong>A hypothesis, not a verdict.</strong> " + p.callout.replace("A hypothesis, not a verdict. ", "")));
    stage.appendChild(panel);

    // keynote (the flagship hummingbird beat) carries the scene title
    var kn = el("div", "keynote");
    kn.innerHTML =
      "<div class='eyebrow'><span class='node'></span>" + esc(s.eyebrow) + "</div>" +
      "<h2 style='font-size:21px;line-height:1.1;margin-bottom:10px'>" + s.title + "</h2>" +
      "<h3 class='lede'>" + esc(s.keynote.lede) + "</h3><p>" + s.keynote.body + "</p>";
    stage.appendChild(kn);
  }


  // ---- instruments-specific DOM (tiered capability map) --------------------
  function buildInstrumentsDOM(stage, s) {
    var wrap = el("div", "iset");
    var TIER_CLS = ["is-ax1", "is-ax2", "is-ax3", "is-ax4"];
    (s.tiers || []).forEach(function (tier, i) {
      var block = el("div", "iset__tier " + (TIER_CLS[i] || ""));
      block.appendChild(
        el("div", "iset__head",
          "<b>" + esc(tier.k) + "</b><span>" + esc(tier.note) + "</span>")
      );
      var items = el("div", "iset__items");
      (tier.items || []).forEach(function (it) {
        var srcCls = it.src === "ours" ? "is-ours" : (it.src.indexOf("ours") === 0 ? "is-ours" : "is-pub");
        items.appendChild(
          el("div", "iset__item",
            "<b>" + esc(it.k) + "</b><span>" + esc(it.d) + "</span>" +
            "<i class='iset__src " + srcCls + "'>" + esc(it.src) + "</i>")
        );
      });
      block.appendChild(items);
      wrap.appendChild(block);
    });
    if (s.note) wrap.appendChild(el("p", "iset__note", esc(s.note)));
    stage.appendChild(wrap);
  }

  // ---- build all scene sections from config --------------------------------
  function buildScenes() {
    var host = document.getElementById("scenes");
    CFG.scenes.forEach(function (s, i) {
      var section = el("section", "scene");
      if (s.id === "hero") section.classList.add("scene--short");
      if (s.id === "anatomy" || s.id === "engine" || s.id === "instruments") section.classList.add("scene--tall");
      section.id = "scene-" + s.id;
      section.setAttribute("data-scene", s.id);
      section.setAttribute("aria-label", s.eyebrow);

      var stage = el("div", "scene__stage" + (s.module === "anatomy" ? " stage--anatomy" : ""));
      var holder = el("div", "scene__canvas");
      holder.id = "holder-" + s.id;
      stage.appendChild(holder);

      var card = buildCopyCard(s);
      if (card) stage.appendChild(card);

      if (s.module === "anatomy") {
        buildAnatomyDOM(stage, s);
      }
      if (s.module === "instruments") {
        buildInstrumentsDOM(stage, s);
      }

      section.appendChild(stage);
      host.appendChild(section);
      sections[s.id] = section;
    });
  }

  // ---- rail ----------------------------------------------------------------
  function buildRail() {
    var rail = document.getElementById("rail");
    CFG.scenes.forEach(function (s) {
      var b = el("button");
      b.setAttribute("data-target", "scene-" + s.id);
      b.setAttribute("data-label", s.rail);
      b.setAttribute("aria-label", "Go to " + s.rail);
      b.addEventListener("click", function () {
        document.getElementById("scene-" + s.id).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
      rail.appendChild(b);
    });
    var ask = el("button");
    ask.setAttribute("data-target", "ask");
    ask.setAttribute("data-label", "Ask");
    ask.setAttribute("aria-label", "Go to the ask");
    ask.addEventListener("click", function () {
      document.getElementById("ask").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
    rail.appendChild(ask);
  }

  // ---- claim strip ---------------------------------------------------------
  function buildClaim() {
    var c = document.getElementById("claimbar");
    c.innerHTML =
      '<span class="tag">' + esc(CFG.claim.tag) + "</span>" +
      '<span class="txt">' + esc(CFG.claim.text) + "</span>" +
      '<span class="snap">snapshot ' + esc(CFG.snapshot) + "</span>";
  }

  // ---- ask section ---------------------------------------------------------
  function buildAsk() {
    var a = CFG.ask;
    var host = document.getElementById("ask");
    var wrap = el("div", "ask__wrap");

    var instruments = el("div", "instruments");
    a.instruments.forEach(function (it) {
      instruments.appendChild(el("div", "instr", "<h4><span class='ic'>&#9679;</span> " + esc(it.k) + "</h4><p>" + esc(it.v) + "</p>"));
    });
    wrap.appendChild(instruments);

    var grid = el("div", "ask__grid");
    var left = el("div");
    left.innerHTML =
      '<div class="eyebrow"><span class="node"></span>' + esc(a.eyebrow) + "</div>" +
      "<h2>" + a.title.replace("diagnosing.", "<em>diagnosing.</em>") + "</h2>" +
      '<p class="ask__lede">' + esc(a.lede) + "</p>";
    var engage = el("div", "engage");
    a.engage.forEach(function (o) {
      engage.appendChild(el("div", "opt", "<h5>" + esc(o.k) + "</h5><p>" + esc(o.v) + "</p>"));
    });
    left.appendChild(engage);
    var ctaRow = el("div", "cta-row");
    a.ctas.forEach(function (c) {
      var btn = el("a", "btn btn--" + c.kind, esc(c.label));
      btn.href = c.href;
      ctaRow.appendChild(btn);
    });
    var mail = el("div");
    mail.style.marginTop = "16px";
    mail.innerHTML =
      '<a class="mono" href="mailto:' + CFG.brand.email + '">' + CFG.brand.email + "</a>" +
      '  <span style="color:var(--faint)">&middot;</span>  ' +
      '<a class="mono" href="' + CFG.brand.website + '" target="_blank" rel="noopener">' + CFG.brand.websiteLabel + "</a>";
    left.appendChild(ctaRow);
    left.appendChild(mail);
    left.appendChild(el("p", "builtby", a.builtby));
    grid.appendChild(left);

    var fs = el("div", "factsheet");
    fs.appendChild(el("h3", null, esc(a.factsheet.title)));
    a.factsheet.rows.forEach(function (row) {
      var r = el("div", "fact-row");
      r.innerHTML =
        '<span class="k">' + esc(row.k) + "</span>" +
        '<span class="v">' + esc(row.v) + (row.s ? "<small>" + esc(row.s) + "</small>" : "") + "</span>";
      fs.appendChild(r);
    });
    fs.appendChild(el("div", "snapnote", "every figure verified against the engine, snapshot " + esc(CFG.snapshot)));
    grid.appendChild(fs);

    wrap.appendChild(grid);
    host.appendChild(wrap);
  }

  // ---- scene lifecycle -----------------------------------------------------
  function ctxFor(s) {
    return { cfg: s, data: SHARED, reduced: reduced, prng: window.makePRNG(CFG.seed + "::" + s.id) };
  }

  function initScene(s) {
    if (instances[s.id]) return;
    var factory = window.SCENES && window.SCENES[s.module];
    var holder = document.getElementById("holder-" + s.id);
    if (!factory || !holder) return;
    try {
      var inst = factory(holder, ctxFor(s));
      instances[s.id] = inst;
      if (reduced && inst && inst._setProgress) {
        inst._setProgress(0.55);
        if (inst.noLoop) inst.noLoop();
        if (inst.redraw) inst.redraw();
      }
    } catch (err) {
      // fail soft: a broken scene must not take the page down
      if (window.console) console.warn("scene init failed:", s.id, err);
    }
  }

  function observe() {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var id = en.target.getAttribute("data-scene");
          var s = CFG.scenes.filter(function (x) { return x.id === id; })[0];
          if (!s) return;
          if (en.isIntersecting) {
            initScene(s);
            var inst = instances[id];
            if (inst && !reduced && inst.loop) inst.loop();
          } else {
            var inst2 = instances[id];
            if (inst2 && !reduced && inst2.noLoop) inst2.noLoop();
          }
        });
      },
      { rootMargin: "25% 0px 25% 0px" }
    );
    CFG.scenes.forEach(function (s) { io.observe(sections[s.id]); });
  }

  // ---- scroll progress -----------------------------------------------------
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      var activeId = null;
      CFG.scenes.forEach(function (s) {
        var sec = sections[s.id];
        var rect = sec.getBoundingClientRect();
        var total = rect.height - vh;
        var t = total > 0 ? (-rect.top) / total : (rect.top < vh / 2 ? 1 : 0);
        t = Math.max(0, Math.min(1, t));
        var inst = instances[s.id];
        if (inst && inst._setProgress) inst._setProgress(t);
        // active = the section currently pinned across the viewport middle
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) activeId = s.id;
      });
      updateRail(activeId);
      // hide the atlas tooltip when the atlas is not the active scene
      var tip = document.getElementById("atlas-tip");
      if (tip && activeId !== "atlas") tip.style.opacity = "0";
      ticking = false;
    });
  }

  function updateRail(activeId) {
    var rail = document.getElementById("rail");
    rail.querySelectorAll("button").forEach(function (b) {
      var on = b.getAttribute("data-target") === "scene-" + activeId;
      b.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  // ---- resize --------------------------------------------------------------
  var rTimer = null;
  function onResize() {
    clearTimeout(rTimer);
    rTimer = setTimeout(function () {
      // each sketch owns canvas resize via p.windowResized (auto-fires);
      // here we only recompute scroll progress and rail state.
      onScroll();
    }, 160);
  }

  // ---- boot ----------------------------------------------------------------
  function boot() {
    buildScenes();
    buildRail();
    buildClaim();
    buildAsk();
    observe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        Object.keys(instances).forEach(function (k) {
          var i = instances[k];
          if (i && i.noLoop) i.noLoop();
        });
      } else if (!reduced) {
        onScroll();
      }
    });
    // first paint: init the hero immediately
    initScene(CFG.scenes[0]);
    var h = instances[CFG.scenes[0].id];
    if (h && !reduced && h.loop) h.loop();
    onScroll();
  }

  // load real data, then boot. Page must be served over http (fetch).
  Promise.all([
    fetch(CFG.data.network).then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch(CFG.data.atlas).then(function (r) { return r.json(); }).catch(function () { return null; }),
  ]).then(function (res) {
    SHARED.network = res[0];
    SHARED.atlas = res[1];
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  });
})();
