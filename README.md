# AI Ecologist storytelling site

A self-contained, offline scrollytelling site for the AI Ecologist engine
(a Graph of Life platform), plus a linked HTML brief. Built to land clients
and investors: a cinematic, instrument-grade journey through structural
ecological intelligence, anchored by the Oriente cloud-forest "Hummingbird
study" and the cross-biome reference library.

Every hero visual is driven by real, committed engine output. Nothing in the
data scenes is invented.

## What is here

- `index.html` plus `styles.css`, `config.js`, `main.js`, `lib/`, `scenes/` is
  the landing experience: a hero and eight scroll-driven p5 scenes.
- `report/` is a faithful HTML rendering of the product brief, in Graph of Life
  document mode, with the four brief figures embedded.
- `data/` holds the seeded exports that drive the hero scenes.
- `tools/` holds the export scripts that produce `data/`.
- `vendor/` holds p5.js and the IBM Plex web fonts, so the page runs fully
  offline with no content delivery network.
- `DIGEST.md` is the verified-facts spine. `STRATEGY.md` is the build plan.

## How to serve

The page fetches `data/*.json`, so it must be served over http. It will not run
from a `file://` URL.

```
cd web/ai-ecologist
python3 -m http.server 8137
# then open http://127.0.0.1:8137/
```

## How to update the numbers

`config.js` is the single source of truth for every number and every line of
copy. To refresh after a new engine run:

1. Regenerate the data:
   `uv run python web/ai-ecologist/tools/export_oriente.py`
   `uv run python web/ai-ecologist/tools/export_atlas.py`
   Both are seeded (random seed 42) and byte-reproducible.
2. Update the matching figures in `config.js` (the integrity panel, readouts,
   factsheet) and in `report/index.html`.
3. Update the snapshot date in `config.js` and `report/index.html`.

## Which scenes are real versus illustrative

| Scene | Data status |
|---|---|
| Hero, Stakes, Blind spot | Illustrative framing, labeled as such on screen |
| Reconstruction | Real Oriente network (91 species, 1,033 interactions) |
| The Anatomy of the Web | Real network, real structural metrics, live removal recompute |
| Atlas | Real cross-biome library (20 ecosystems) |
| Rewiring | Real validated metric, illustrated mechanism |
| Honest ladder | Real evidence tiers and benchmark status |
| Ask factsheet | Real verified figures |

The removal control in the Anatomy scene recomputes connectivity and knock-on
losses in the browser from the real edge list. It is not a precomputed
animation.

## Claim boundary

The structural reconstruction and fragility layer is benchmarked
(link-prediction accuracy near 0.95 on standard food-web datasets) and
reproducible. Financial outputs are prototype, screening-grade, and not
market-calibrated. The site shows no specific economic figures. The flagship
network is fully reconstructed, with no observed interaction tier yet, so its
structural integrity reading is exploratory by construction. The cross-biome
similarity is structural, not taxonomic, and not a claim of shared risk.

## Deploy

Static folder, served on GitHub Pages. The landing sits at the root; the brief
sits under `report/`. The Open Graph image is `assets/og.png`.

This directory is the source of truth. The public deploy is a render-only,
IP-hardened subset (build tooling, the internal `DIGEST.md` and `STRATEGY.md`,
and the methodology fields in the data `meta` are excluded) pushed to a separate
public repo:

- Live: https://jaygut.github.io/ai-ecologist-landing/ (brief at `/report/`)
- Public repo: `jaygut/ai-ecologist-landing` (Pages from `main`/root)

Snapshot: 2026-06-29.
