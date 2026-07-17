/* ============================================================================
   SINGLE SOURCE OF TRUTH.
   Every number, snapshot date, and line of copy lives here and is injected
   into the DOM by main.js. To update the page after a new engine run, edit
   THIS file only. Every figure traces to the exported case data.
   House style: no em-dashes, no jargon or tool names in rendered copy.
   ========================================================================== */
window.CFG = {
  seed: "graph-of-life-ai-ecologist",
  snapshot: "2026-06-29",

  brand: {
    product: "AI Ecologist",
    descriptor: "Structural ecological intelligence engine",
    email: "jg@graphoflife.com",
    website: "https://biome-translator.emergent.host/",
    websiteLabel: "biome-translator.emergent.host",
  },

  claim: {
    tag: "CLAIM BOUNDARY",
    text: "Structural reconstruction and fragility, benchmarked and reproducible. Financial outputs are prototype, not calibrated.",
  },

  data: {
    network: "data/oriente_network.json",
    atlas: "data/atlas.json",
  },

  /* scene order drives the rail and the scroll. module = the sketch file's
     registered name in window.SCENES. */
  scenes: [
    {
      id: "hero",
      rail: "Home",
      module: "hero",
      copyPos: "center",
      eyebrow: "Structural ecological intelligence engine",
      title: "The living network, and where it breaks first.",
      body: "Give the engine a species list. It reconstructs the web of interactions behind it, then finds the few species that hold the whole system together.",
      chips: [
        { v: "AI Ecologist" },
        { v: "The structural reading of ecosystem condition" },
      ],
      badge: { kind: "illustrative", label: "Illustrative" },
    },
    {
      id: "stakes",
      rail: "Stakes",
      module: "stakes",
      copyPos: "tl",
      eyebrow: "The stakes",
      title: "A cloud forest waters a city. The web holding it up is real.",
      body: "A cloud forest above Medellin catches fog and feeds up to 60% of the city's drinking water. The interaction web that keeps it working is real and benchmarked. When it fails, the cost lands downstream, on a balance sheet, as a clearly tiered estimate.",
      readouts: [
        { v: "60%", k: "of one city's water", cls: "is-teal" },
        { v: "4M", k: "people downstream" },
      ],
      badge: { kind: "illustrative", label: "Illustrative, one real figure" },
    },
    {
      id: "blindspot",
      rail: "Blind spot",
      module: "blindspot",
      copyPos: "tr",
      eyebrow: "What 'condition' means",
      title: "Inventories everywhere. Decisions nowhere.",
      body: "Three ways to read an ecosystem: how much is there, what is present, and whether it holds. The rules now require the third, ecosystem condition, yet leave the metric undefined. A score can read healthy while the structure underneath comes apart.",
      badge: { kind: "illustrative", label: "Illustrative" },
    },
    {
      id: "reconstruct",
      rail: "Reconstruct",
      module: "reconstruct",
      copyPos: "bl",
      eyebrow: "The reconstruction",
      title: "From a list of names to the living network.",
      body: "From a 91 species inventory, the engine infers a web of 1,033 interactions, with no time series required. It proves itself against known food webs at link-prediction accuracy near 0.95.",
      readouts: [
        { v: "91", k: "species", cls: "is-teal" },
        { v: "1,033", k: "interactions", cls: "is-teal" },
        { v: "0.948", k: "link-prediction AUC", cls: "" },
      ],
      badge: { kind: "real", label: "Real data" },
    },
    {
      id: "anatomy",
      rail: "Anatomy",
      module: "anatomy",
      copyPos: "none",
      eyebrow: "The hidden keystone",
      title: "The apex predator is not holding it up.",
      // the instrument panel, class chips, keynote and slider are rendered from below
      badge: { kind: "real", label: "Real data" },
      intro:
        "Distance from the centre shows how deep a species sits in the network's tightest, most interconnected core. Each wedge is a cluster the engine found on its own. Pick a class to isolate its members and the interactions they carry.",
      panel: {
        eyebrow: ["STRUCTURAL INTEGRITY", "EXPLORATORY", "INFERRED"],
        score: 57,
        scoreNote: "0 to 100, higher is sounder",
        tier: "BBB · Investment grade",
        desc:
          "A fully reconstructed structural reading, not a condition grade. Fragility alone would read this forest as prime. The composite does not let one strong dimension paper over weak ones. How well the web holds together and how cleanly it clusters both read fragile, so the grade stays pinned to the network's weakest dimension rather than smoothing it away.",
        bar: { value: 57, scale: ["0 Critical", "30", "50", "70", "85", "100"] },
        cards: [
          { v: "23", k: "Core depth", d: "how many layers deep the tightest core runs" },
          { v: "52", k: "Core taxa", d: "57% of the web" },
          { v: "25.2%", k: "Wiring density", d: "share of possible links that actually exist" },
          { v: "3", k: "Clusters", d: "how cleanly the web splits into groups" },
          { v: "0.78", k: "Cohesion", d: "how hard the web is to split apart" },
          { v: "46%", k: "Robustness", d: "share of key species you would have to remove before the web breaks apart" },
          { v: "1.12", k: "Fragility", d: "how much worse a smart attack is than random loss" },
          { v: "0.84", k: "Weakest axis", d: "the dimension keeping the score down" },
        ],
        callout:
          "A hypothesis, not a verdict. Computed on a network that is fully reconstructed, all 1,033 interactions inferred, none yet observed in the field. There is no observed interaction tier for the reconstruction gate to anchor on, so this is an exploratory structural reading.",
      },
      classes: [
        { key: "all", label: "All classes", count: 91, color: "#8fa3ad" },
        { key: "nectar", label: "Nectar-feeders in core", count: 14, color: "#3ad6a3" },
        { key: "hub", label: "High-centrality hubs", count: 9, color: "#1aa89b" },
        { key: "connector", label: "Connectors", count: 6, color: "#a78bfa" },
        { key: "apex", label: "Top-trophic", count: 9, color: "#e8694d" },
        { key: "producer", label: "Producers", count: 16, color: "#3ad6a3" },
        { key: "background", label: "Background", count: 51, color: "#586b77" },
      ],
      keynote: {
        lede: "Fourteen nectar-feeders sit at the very centre of the web, eleven of them hummingbirds. The puma sits further out.",
        body: "The sword-billed hummingbird sits at the very centre of the web. The apex predators, the puma and the black-and-chestnut eagle, sit a couple of layers further out. The species with the highest removal impact of all are the soil's recyclers, a dung beetle and the leaf-cutter ants. Conservation aimed at the charismatic few can miss the structural foundation.",
      },
      slider: {
        label: "Remove the deepest core species, watch the web answer",
      },
    },
    {
      id: "atlas",
      rail: "Atlas",
      module: "atlas",
      copyPos: "bl",
      eyebrow: "Cross-biome benchmarking",
      title: "One ecosystem is a diagnosis. Twenty is a reference frame.",
      body: "The engine profiles the structural fingerprint of ecosystems across six continents, then measures which are built alike. Similarity here is structural, not a claim of shared species or shared risk.",
      readouts: [
        { v: "20", k: "reference ecosystems", cls: "is-teal" },
        { v: "6", k: "continents" },
        { v: "reef to boreal", k: "biome span", cls: "" },
      ],
      badge: { kind: "real", label: "Real data" },
      lensNote: "Closeness is structural similarity, not taxonomic overlap.",
    },
    {
      id: "rewiring",
      rail: "Rewiring",
      module: "rewiring",
      copyPos: "tr",
      eyebrow: "Change over time",
      title: "The system is changing shape.",
      body: "Compare two states of the same network and the engine reports what stayed the same, what was replaced, and how the central group of species shifted. On a published record it reproduced the whole-network change signal almost exactly. It quantifies change. It does not forecast it.",
      readouts: [
        { v: "0.99999", k: "match to a known change record", cls: "is-teal" },
        { v: "658", k: "time windows" },
      ],
      badge: { kind: "real", label: "Real metric, illustrated mechanism" },
    },
    {
      id: "engine",
      rail: "The engine",
      module: "engine",
      copyPos: "tr",
      eyebrow: "Inside the engine",
      title: "Not a chatbot over ecology. A multilayered engine.",
      body: "Reading an ecosystem is not a text problem. Machine reasoning does one bounded job, and every call it makes is checked against known ecological rules and the shape of the network itself. It is the structural layer beneath the screening tools you already use, benchmarked and deterministic, where no outside model makes the call.",
      readouts: [
        { v: "0.95", k: "benchmarked accuracy", cls: "is-teal" },
        { v: "deterministic", k: "decision layer" },
        { v: "owned", k: "auditable and reproducible" },
      ],
      badge: { kind: "real", label: "How it works" },
      layers: [
        { name: "A species inventory", sub: "the only input required", accent: "#3ad6a3" },
        { name: "Evidence, ranked by strength", sub: "seen in the field, on record, inferred, or expected", accent: "#1aa89b" },
        { name: "Neuro-symbolic reconstruction", sub: "machine reasoning, checked against ecological rules", accent: "#a78bfa", chip: "bounded" },
        { name: "Structural intelligence", sub: "the load-bearing core, weak points, and knock-on failures, grounded in network science", accent: "#f2a24e" },
        { name: "A deterministic decision", sub: "owned, auditable, reproducible", accent: "#e8694d" },
      ],
    },
    {
      id: "ladder",
      rail: "Ladder",
      module: "ladder",
      copyPos: "tl",
      eyebrow: "What we claim",
      title: "Benchmarked where it counts. Prototype where it is not.",
      body: "Every interaction carries an evidence tier. The structural layer is benchmarked, deterministic, and reproducible, a condition reading built to survive an audit, not a score you have to trust. The financial layer is a screening prototype, and we never dress it up as calibrated.",
      badge: { kind: "real", label: "Real labels" },
      tiers: [
        { k: "Observed", on: false },
        { k: "Interaction recorded", on: false },
        { k: "Inferred", on: true, note: "this reconstruction sits here" },
        { k: "Expected", on: false },
      ],
      rungs: [
        { k: "Structural reconstruction", state: "Benchmarked", lit: true, note: "link-prediction accuracy near 0.95 on standard food webs" },
        { k: "Fragility and keystones", state: "Computed", lit: true, note: "k-core, fragility ratio, composite integrity" },
        { k: "Held-out generalization", state: "Diagnostic", lit: "half", note: "recovers hidden links and transfers to unseen ecosystems across 254 networks, corpus still open" },
        { k: "Cross-biome comparability", state: "Indicative", lit: "half", note: "structural similarity, not calibration" },
        { k: "Financial translation", state: "Prototype", lit: false, note: "screening only, not market calibrated" },
      ],
    },
  ],

  /* closing / ask (rendered as normal-flow DOM) */
  ask: {
    eyebrow: "The ask",
    title: "Stop counting. Start diagnosing.",
    lede: "Send one species list and a site boundary for a fixed-scope pilot, or talk to us about backing the layer beneath the nature-intelligence stack.",
    instruments: [
      { k: "Restoration", v: "Where each action buys the most resilience." },
      { k: "Watershed", v: "Secure water through the catchment's load-bearing species." },
      { k: "Conservation", v: "Protect the structural linchpins, not only the charismatic few." },
      { k: "Fisheries", v: "Find the linchpins of marine and freshwater webs." },
      { k: "Nature finance", v: "Structural inputs for disclosure screening." },
    ],
    engage: [
      { k: "Pilot scan", v: "One site, one decision question, days not months, with expert oversight." },
      { k: "Monitoring", v: "Recurring structural intelligence and change tracking across a portfolio." },
      { k: "Managed access", v: "Inputs in, evidence out, through an interface you query. The engine stays owned." },
      { k: "Partnership", v: "Back the vulnerability layer beneath the nature-intelligence stack." },
    ],
    why: "The rules now require companies to report whether an ecosystem is healthy. They do not say how to measure it. A benchmarked, audit-grade structural reading is the answer that gap has been missing.",
    factsheet: {
      title: "Verified snapshot",
      rows: [
        { k: "Reconstruction accuracy", v: "AUC 0.948", s: "0.945 on a second benchmark" },
        { k: "Generalization", v: "254 networks", s: "held-out recovery confirmed, transfer supported" },
        { k: "Flagship web", v: "91 species", s: "1,033 inferred interactions" },
        { k: "Core depth", v: "k 23", s: "52-species load-bearing core" },
        { k: "Structural integrity", v: "57 of 100", s: "tier BBB, exploratory" },
        { k: "Reference library", v: "20 ecosystems", s: "six continents" },
        { k: "Change signal", v: "0.99999", s: "across 658 windows" },
        { k: "Evidence status", v: "Inferred", s: "no observed tier yet" },
        { k: "Financial layer", v: "Prototype", s: "not market calibrated" },
      ],
    },
    builtby:
      "Built by Jay Gutierrez, PhD, working at the intersection of ecological network science, graph intelligence, nature-finance translation, and publishing the work that defines the structural-risk category.",
    ctas: [
      { label: "Start a pilot", kind: "primary", href: "mailto:jg@graphoflife.com" },
      { label: "Read the full brief", kind: "ghost", href: "report/index.html" },
    ],
  },
};
