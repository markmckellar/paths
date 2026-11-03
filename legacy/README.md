# Legacy implementation

The original 2017–18 ES6 + browserify implementation, kept unchanged for reference. The app in
`src/` replaces it.

- `paths/js/paths`, `paths/js/nodes`: the original engine (ported to `src/engine`).
- `paths/js/pathsexp/demographs`: the stand-alone demo (`html/demograph1.html`).
- `paths/js/pathsexp/pathserver`, `paths/js/pedigree*`: the Express server mode and the pedigree
  experiment. These were not ported.
- `main.ts`, `test.html`: entry point for the separate `walkers` rewrite. It imports files that
  were never in this repo, so it doesn't build here.

To view the old demo, serve this folder (e.g. `python3 -m http.server`) and open
`html/demograph1.html`.
