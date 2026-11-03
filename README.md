# Paths

**A live, animated map of work moving through a process.**

**[Try the live demo →](https://markmckellar.github.io/paths/)**

Each state in a workflow is a circle. Each item is a small shape that moves from state to state as its status
changes. The paths it takes are drawn as arrows, and they get thicker as more items follow them. Over time the
picture *becomes* the process: where work piles up, which steps send items back for rework, and how long things
sit in each state.

![Paths: work items flowing through a delivery pipeline, with a state's flow details open](docs/screenshot.png)

The demo shows bugs, features and chores moving through a delivery pipeline, but the engine is generic. It
draws any stream of "item X entered state Y at time T" events: samples moving through lab processing steps,
orders through fulfillment, tickets through support.

## What you can do

- **Watch it build itself.** States appear as items first reach them, and the layout arranges itself as the
  network grows. The view follows the graph until you take over.
- **Ask a state what's going on.** Click a state to see how many items are there now (by type), total visits,
  the average time items spend there, and where items arrive from and go next, ranked by volume.
- **Follow one item.** Click an item to see its whole journey with timings. Its route lights up on the map.
- **Arrange it your way.** Drag a state to pin it in place, and double-click it to release it. Pan, zoom, or pinch
  on a touch screen.
- **Control time.** Play, pause, and run from ½× to 8× speed.

Works in light and dark mode, on desktop and on phones.

## Run it

The [live demo](https://markmckellar.github.io/paths/) runs in any modern browser. To run it locally:

Requires Node 18 or newer.

```sh
npm install
npm run dev        # open http://localhost:5173
```

```sh
npm test           # engine unit tests
npm run build      # type-check and build static files into dist/
```

| Action | Result |
| --- | --- |
| Click a state or item | Show details |
| Drag a state | Move it and pin it there |
| Double-click a pinned state | Release it back to the automatic layout |
| Drag empty space · scroll · pinch | Pan · zoom |
| **F**, or double-click empty space | Fit the graph to the window |
| **Space** · **Esc** · **+** / **−** | Play/pause · close details · zoom |

## How it works

The simulation engine is plain TypeScript with no framework, so it can be tested on its own and used outside Vue.

- **Layout.** A small force-directed physics model runs at a fixed 60 steps a second, so it looks the same on any
  display. Paths act as springs, states push apart, and a collision pass keeps states and their labels from
  overlapping.
- **States.** Each state grows with the number of items in it and is divided into slices, one per item type.
  Items settle into their own slice and spread out evenly.
- **Events.** Updates are queued by timestamp and played against a simulated clock, so a day of history can be
  replayed in minutes. Statistics use each event's own timestamp, so they stay exact at any speed. Optional
  rules can re-route items or let them leave after reaching a final state.
- **Drawing.** Rendered on an HTML canvas, sharp on high-resolution screens, with colors taken from CSS theme
  variables.
- **UI.** Vue 3 components handle the toolbar, the details popover (a bottom sheet on phones), the legend, and
  keyboard and touch input. The simulation stays outside Vue's reactivity, so the UI never slows down the
  animation.

The demo is built and published to GitHub Pages by a GitHub Actions workflow
([`deploy-demo.yml`](.github/workflows/deploy-demo.yml)) on every push to `master`, after the tests pass.

```
src/engine/      simulation, physics, camera, canvas renderer (framework-free, unit tested)
src/demo/        the demo pipeline and its endless, reproducible event stream
src/components/  Vue 3 components: GraphCanvas, NodePopover, ShapeIcon
src/App.vue      toolbar, legend, keyboard shortcuts
legacy/          the original 2018 JavaScript version
```

### Feeding it your own data

```ts
import { World } from './engine/world'

const world = new World({
  walkerTypes: [{ key: 'order', label: 'Order', color: '#3e8ef7', shape: 'square' }],
  exits: [{ junction: 'Delivered', afterMs: 60_000 }],
})

world.enqueue([
  { time: Date.parse('2026-01-05T09:00'), walker: 'order-1', walkerType: 'order', junction: 'Placed' },
  { time: Date.parse('2026-01-05T09:20'), walker: 'order-1', walkerType: 'order', junction: 'Packed' },
])
```

## History

I first built Paths in 2018 as an experiment in animating state changes on an HTML canvas. The original was
written in ES6 JavaScript with browserify and jQuery, and it could run stand-alone or as a shared graph served
from a Node/Express server. It is kept in [`legacy/`](legacy/).

In 2026 I rebuilt it in Vue 3 and TypeScript, working with Claude Code. Along the way I fixed bugs in the
original:
- a Play button that needed two clicks
- popups that crashed or appeared in the wrong place
- broken geometry checks
- typos in the demo data
- physics that ran faster on faster screens

I also added the details panels, pinning, pan and zoom, touch support, dark mode, and unit tests for the engine.

## Built with

TypeScript · Vue 3 · Vite · HTML Canvas · Vitest

## License

MIT
