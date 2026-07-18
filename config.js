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
      eyebrow: "Ecosystem condition, stress tested",
      title: "Every other reading takes a census. This one runs a stress test.",
      body: "Send the species inventory you already have. The engine reconstructs the interaction network behind it, then removes species one at a time and measures how much of the structure goes with them.",
      readouts: [
        { v: "0.948", k: "held-out link prediction, 80 food webs", cls: "is-teal" },
        { v: "20", k: "reconstructed reference ecosystems, six continents" },
        { v: "a species list", k: "the only data you supply" },
      ],
      chips: [
        { v: "Condition is now required. The metric was never defined." },
        { v: "Everything else counts what is present." },
      ],
      badge: { kind: "illustrative", label: "Illustrative visual, measured numbers" },
    },
    {
      id: "stakes",
      rail: "Stakes",
      module: "stakes",
      copyPos: "tl",
      eyebrow: "The stakes",
      title: "A cloud forest waters a city. Pollinators are the reason it can.",
      body: "A cloud forest above Medellin combs water out of fog and supplies up to 60% of the city's drinking water. What catches the fog is the load of mosses, bromeliads and orchids riding on the canopy. What sustains that load is the pollinators. Follow the chain and the city's water runs through the food web. Break it and the cost lands downstream.",
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
      body: "From a 91 species inventory, the engine infers a web of 1,033 interactions, with no time series required. Tested on 80 published food webs, hiding a fifth of each web's interactions and rebuilding them, it recovers them at 0.948.",
      readouts: [
        { v: "91", k: "species", cls: "is-teal" },
        { v: "1,033", k: "interactions", cls: "is-teal" },
        { v: "0.948", k: "held-out recovery, 80 webs", cls: "" },
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
        body: "The sword-billed hummingbird sits at the very centre of the web. The apex predators, the puma and the black-and-chestnut eagle, sit a couple of layers further out. The species with the highest removal impact of all are the soil's recyclers, a dung beetle and the leaf-cutter ants. These are the species sustaining the canopy that catches the city's water, and on a conventional inventory every one of them is a line item among hundreds. Conservation aimed at the charismatic few can miss the structural foundation.",
      },
      slider: {
        label: "Pull species out of the core. The stress test, running on the reconstructed network",
      },
    },
    {
      id: "instruments",
      rail: "Instruments",
      module: "instruments",
      copyPos: "tl",
      eyebrow: "The instrument set",
      title: "One reconstruction. Four questions worth asking of it.",
      body: "A long list of network measures is mostly one number wearing different hats. Published work finds that twenty structural properties of a food web collapse into about three independent dimensions. So we group the readings by the question they answer rather than counting them, and we say which rest on published network science and which are our own.",
      readouts: [
        { v: "4", k: "independent questions, not a metric count", cls: "is-teal" },
        { v: "published", k: "or ours, marked on every reading" },
        { v: "growing", k: "instruments added as they earn it" },
      ],
      badge: { kind: "real", label: "Capability map" },
      canvasNote: "each ring is one question  /  each tick is one reading",
      note: "Grouping by question is the honest way to present this. Counting measures would imply each adds independent information, and in this field most of them do not. Opt-in instruments go further: confidence intervals on every number, change between two states, restoration priority, and dynamic stability. Each carries the caveat it earned.",
      tiers: [
        {
          k: "Redundancy",
          note: "how much slack the system carries",
          items: [
            { k: "Wiring density", d: "share of possible links that actually exist", src: "published" },
            { k: "Structural completeness", d: "whether the reconstruction is whole or in pieces", src: "ours" },
          ],
        },
        {
          k: "Concentration",
          note: "how much rides on how few",
          items: [
            { k: "Core depth", d: "how many layers deep the tightest core runs", src: "published" },
            { k: "Load-bearing species", d: "a ranked shortlist of what holds it together", src: "ours" },
            { k: "Clusters and bridges", d: "the neighbourhoods, and who connects them", src: "published" },
            { k: "Weighted core", d: "core depth once link strength is counted", src: "ours, gated" },
          ],
        },
        {
          k: "Propagation",
          note: "whether a shock spreads or stays local",
          items: [
            { k: "Knock-on loss", d: "who loses their food supply entirely", src: "published" },
            { k: "Per-species stress test", d: "every species ranked by what its removal costs", src: "ours" },
            { k: "Clustering", d: "how cleanly the web splits into groups", src: "published" },
            { k: "Interaction patterns", d: "the recurring three-species shapes", src: "published, simplified" },
          ],
        },
        {
          k: "Stress response",
          note: "what survives as species are removed",
          items: [
            { k: "Fragility", d: "how much worse a targeted loss is than random", src: "published" },
            { k: "Break point", d: "how much loss before the web splits in half", src: "published" },
            { k: "Food-chain order", d: "how neatly the system layers into levels", src: "published" },
            { k: "Cohesion", d: "how hard the web is to pull apart", src: "ours, no ecological benchmark" },
          ],
        },
      ],
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
      title: "Other readings count what is present. This one tests what the structure can lose.",
      body: "Take a species out of the reconstructed network and the engine measures what goes with it, counting how many others lose their food supply outright and how far the web fragments. That is a structural stress test on the network, not a forecast of what will happen in the field, and we mark the difference everywhere it matters. It runs on top of the inventories you already collect, not instead of them. Machine reasoning does one bounded job inside the reconstruction, and every call it makes is checked against ecological rules and against the shape of the network. The decision layer is deterministic and owned, so no outside model makes the call.",
      readouts: [
        { v: "every species", k: "ranked by what its removal costs the structure", cls: "is-teal" },
        { v: "deterministic", k: "same inputs, same answer, every time" },
        { v: "owned", k: "auditable and reproducible" },
      ],
      badge: { kind: "real", label: "How it works" },
      layers: [
        { name: "A species inventory", sub: "the only data you supply", accent: "#3ad6a3" },
        { name: "Evidence, ranked by strength", sub: "seen in the field, on record, inferred, or expected", accent: "#1aa89b" },
        { name: "Reconstruction", sub: "machine reasoning, checked against ecological rules", accent: "#a78bfa", chip: "bounded" },
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
        { k: "Structural reconstruction", state: "Benchmarked", lit: true, note: "0.948 held-out link prediction on 80 published food webs, structure only" },
        { k: "Fragility and keystones", state: "Computed", lit: true, note: "k-core, fragility ratio, composite integrity" },
        { k: "Cross-biome comparability", state: "Indicative", lit: "half", note: "structural similarity, not calibration" },
        { k: "Financial translation", state: "Prototype", lit: false, note: "screening only, not market calibrated" },
      ],
    },
  ],

  /* closing / ask (rendered as normal-flow DOM) */
  ask: {
    eyebrow: "The ask",
    title: "Stop counting. Start diagnosing.",
    lede: "One site, one decision question, one species list. You get back the reconstructed network, the species the structure is standing on, and what it loses if they go. Expert oversight throughout, and every claim carries its evidence tier.",
    instruments: [
      { k: "Restoration", v: "Which species the recovery has to be built around." },
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
    why: "Restoration authorities are writing habitat condition baselines right now, and the definition of good condition turns on structure and function, not extent alone. Risk teams are being asked for ecosystem dependencies at named locations rather than sector averages. Both need a condition reading that is reproducible and survives review, and neither has been told which metric to use. That is the gap this was built for.",
    factsheet: {
      title: "Verified snapshot",
      rows: [
        { k: "Reconstruction accuracy", v: "AUC 0.948", s: "80 webs held out, structure only; 0.945 on a second benchmark" },
        { k: "Flagship web", v: "91 species", s: "1,033 inferred interactions" },
        { k: "Core depth", v: "k 23", s: "52-species load-bearing core" },
        { k: "Structural integrity", v: "57 of 100", s: "tier BBB, exploratory" },
        { k: "Reference library", v: "20 ecosystems", s: "six continents, compared on structure" },
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
