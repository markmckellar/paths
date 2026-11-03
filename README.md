# Paths

**A live, animated map of work moving through a process.**

**[Try the live demo →](https://markmckellar.github.io/paths/)** ·
**[A day in the life →](https://markmckellar.github.io/paths/#life-weekday)** ·
**[Configure it with your own data ↓](#configure-it)**

Each state in a workflow is a circle. Each item is a small shape that moves from state to state as its status
changes. The paths it takes are drawn as arrows, and they get thicker as more items follow them. Over time the
picture *becomes* the process: where work piles up, which steps send items back for rework, and how long things
sit in each state.

![Paths: work items flowing through a delivery pipeline, with a state's flow details open](docs/screenshot.png)

The engine is generic: it draws any stream of "item X entered state Y at time T" events, such as samples moving
through lab processing steps, orders through fulfillment, or tickets through support. The demo has two kinds of
data, chosen from the picker at the top:

- **Delivery pipeline.** Bugs, features and chores moving through a software delivery process.
- **A day in the life.** Real people's days from the American Time Use Survey: when they sleep, commute, work,
  eat, look after others and relax. Pick everyone on a weekday or weekend, or day-shift workers, night-shift
  workers, students, homemakers or retirees, and watch the day go round a clock-like circle of activities.

![A day in the life: 400 people from the American Time Use Survey at 1:18pm on a weekday, most at work, lunch or school](docs/screenshot-day.png)

## What you can do

- **Watch it build itself.** States appear as items first reach them, and the layout arranges itself as the
  network grows. The view follows the graph until you take over.
- **Ask a state what's going on.** Click a state to see how many items are there now (by type), total visits,
  the average time items spend there, and where items arrive from and go next, ranked by volume.
- **Follow one item.** Click an item to see its whole journey with timings. Its route lights up on the map.
- **Arrange it your way.** Drag a state to pin it in place, and double-click it to release it. Pan, zoom, or pinch
  on a touch screen.
- **Control time.** Play, pause, and run from ½× to 8× speed. Turn on the big clock to see the time of day (and,
  for a day's data, how far through the day it is) right on the graph.
- **Switch data sets.** Each one has its own link (for example `#life-night`), so you can share a view.

Works in light and dark mode, on desktop and on phones.

## Configure it

Paths has two layers, and everything specific to a data set is configuration rather than code:

1. **The engine** (`src/engine/`, framework-free TypeScript). A `World` takes options for how items look and how the
   graph is drawn, and you feed it events.
2. **Scenarios** (`src/scenario.ts`). A scenario bundles one data set for the demo app: its events, its clock, its
   wording, and which display options it turns on. The picker lists every scenario.

### Engine options (`WorldOptions`)

| Option | What it does |
| --- | --- |
| `walkerTypes` | The kinds of item: key, label, colour and shape (`circle`, `square`, `triangle`, `diamond`). |
| `exits` | Items that have been in a matching state for a while leave, e.g. finished work. |
| `teleports`, `endpointMods` | Re-routing rules applied to matching moves. |
| `layout` | Spacing, path length, item size and how quickly things move. |
| `pathMemoryMs` | Show **recent** traffic: each path fades out this long after it was last used. Unset, paths show all-time traffic. Use it for cyclic data such as daily routines. |
| `labels.placement` | `'below'` each state (default), or `'outside'`: pointing away from the middle, for fixed layouts like a circle. |
| `labels.screenPx` | Draw labels at a fixed on-screen size at any zoom (a little smaller on phones). Unset, they scale with the map. |

Junctions (states) can also be **pinned** in place. Set `anchored` as well for a deliberate layout, so they aren't
marked as pinned by hand. `world.settle()` runs the layout ahead of time, so items start settled.

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

### Scenario options (`Scenario`)

| Field | What it does |
| --- | --- |
| `key`, `group`, `label`, `subtitle` | Its link (`#key`), where it sits in the picker, and the line under the title. |
| `worldOptions(random)` | The engine options above. |
| `createFeed(seed, start)` | An object whose `fill(until)` returns the events due up to a time. Can be endless. |
| `startTime()`, `timeScale`, `defaultSpeed` | When the clock starts, how much simulated time passes per real millisecond at 1×, and the starting speed. |
| `setup(world)` | Runs on a fresh world, e.g. to pin states in a fixed layout. |
| `startSettled` | Apply the first events and settle the layout before the clock starts, so items begin where they are. |
| `words` | What to call states and items ("State"/"Activity", "In flight"/"People", ...). |
| `formatClock`, `formatTimeOfDay` | The clock text, and clock times in an item's history instead of "+2h 10m". |
| `bigClock`, `timeCaption`, `cycle` | Show the big on-graph clock by default, a caption under it ("Morning"), and for repeating data a progress bar with scale labels. |
| `showDone`, `restartHint`, `credit` | Whether a "Done" count makes sense, the Restart tooltip, and a data credit under the legend. |

### Example: importing "a day in the life"

The time-use data sets were added purely through configuration. Here is the whole path from raw survey files to
the demo.

**1. Get the data.** The [American Time Use Survey](https://www.bls.gov/tus/) (U.S. Bureau of Labor Statistics,
public domain) asks thousands of people to describe one day, 4am to 4am, activity by activity, with start times.
Download the Activity, Respondent and Roster files for a year (`atusact-2019.zip`, `atusresp-2019.zip`,
`atusrost-2019.zip`) into `data-raw/`, which git ignores.

**2. Build a compact data file.** [`scripts/build-timeuse.py`](scripts/build-timeuse.py) (standard-library Python)
does the survey-specific work once, offline:

```sh
python3 scripts/build-timeuse.py data-raw 2019 src/demo/timeuse/atus-2019.json
```

- puts each person in a group from their diary day: day-shift or night-shift worker (half or more of their work
  between 8pm and 6am), student, homemaker, retiree, ...
- maps 400-odd survey activity codes onto 16 activities, naming meals breakfast, lunch or dinner by time of day,
  and merges back-to-back repeats
- samples a few hundred people per data set **using the survey weights**, so each sample is representative

The result is 66 KB compressed. Each person is a row of `[group, age, start minute, activity, start minute,
activity, ...]`:

```json
{ "activities": [{ "key": "sleep", "label": "Sleeping" }, ...],
  "groups": [{ "key": "day", "label": "Day-shift worker" }, ...],
  "datasets": [{ "key": "weekday", "label": "Everyone, on a weekday", "respondents": 4538,
                 "people": [[0, 42, 0, 0, 210, 15, 255, 8, ...], ...] }, ...] }
```

**3. Turn people into events.** [`src/demo/timeuse.ts`](src/demo/timeuse.ts) replays each person's day as
"entered activity at time T" events, then the same day again, forever:

```ts
fill(until: number): WorldUpdate[] {
  const out: WorldUpdate[] = []
  while (this.startTime + this.nextDay * DAY_MS <= until) {
    const dayStart = this.startTime + this.nextDay * DAY_MS
    for (const p of this.people)
      for (const [minute, activity] of p.day)
        out.push({ time: dayStart + minute * 60_000, walker: p.name, walkerType: p.group, junction: activity })
    this.nextDay++
  }
  return out
}
```

**4. Describe it as a scenario.** The rest is settings:

```ts
{
  key: 'life-weekday',
  label: 'Everyone, on a weekday',
  timeScale: 600,                                  // at 1×, one real second is ten minutes of the day
  worldOptions: (random) => ({
    walkerTypes,                                   // one per group, with its own colour and shape
    pathMemoryMs: 40 * 60 * 1000,                  // show where people are moving now
    labels: { placement: 'outside', screenPx: 14 },
    random,
  }),
  createFeed: (_seed, start) => new TimeUseFeed(people, start),
  setup: (world) => pinActivityCircle(world, data, people.length),  // activities round a clock, travel in the middle
  startSettled: true,
  bigClock: true,
  timeCaption: partOfDay,                          // "Morning", "Afternoon", ...
  cycle: { lengthMs: DAY_MS, scale: ['4am', '10am', '4pm', '10pm', '4am'] },
  words: { state: 'Activity', states: 'Activities', active: 'People', journey: 'Their day' },
  // ... plus clock formatting and the data credit
}
```

To use a newer survey year, download its files, re-run the script with that year, and point the import at the new
JSON file.

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
- **Spreading.** Items inside a state spread out using a spatial grid, so states holding hundreds of items stay
  cheap.
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
src/scenario.ts  what a data set provides: events, clock, wording, display options
src/demo/        the delivery pipeline, and the time-use data and its feed (demo/timeuse/)
src/components/  Vue 3 components: GraphCanvas, NodePopover, ShapeIcon, BigClock
src/App.vue      toolbar, data set picker, legend, keyboard shortcuts
scripts/         build-timeuse.py: turns raw survey files into the time-use data
legacy/          the original 2018 JavaScript version
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

Later I added the "day in the life" data sets from the American Time Use Survey. That meant growing the engine's
configuration (recent-traffic paths, fixed-size outside labels, fixed layouts, a settled start, the big clock) and a
faster way for items to spread out, so states holding hundreds of people stay smooth.

## Built with

TypeScript · Vue 3 · Vite · HTML Canvas · Vitest

## License

MIT
