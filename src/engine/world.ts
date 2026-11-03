import {
  type Sector,
  type Vec,
  TAU,
  dist,
  lerp,
  mean,
  pointAtDistance,
  sectorArea,
  sectorCentroid,
  sectorContains,
  vec,
} from './geometry'
import {
  DEFAULT_LAYOUT,
  type ExitRule,
  type LabelOptions,
  type LayoutOptions,
  type RerouteRule,
  type WalkerTypeDef,
  type WorldOptions,
  type WorldUpdate,
} from './types'

/** Physics runs at a fixed rate so motion looks the same on 60Hz and 144Hz displays. */
export const PHYSICS_HZ = 60
const STEP_MS = 1000 / PHYSICS_HZ
const MAX_STEPS_PER_ADVANCE = 5
const EXIT_FADE_MS = 900
/** Junction labels sit centred below the circle. Shared with the renderer. */
export const LABEL_GAP = 4
export const LABEL_HEIGHT = 20
/** Minimum clear space between junction boxes (circle plus label). */
const COLLISION_MARGIN = 10
/** Slices start at 12 o'clock. */
const SLICE_START = -Math.PI / 2

export interface Visit {
  junction: string
  time: number
}

export interface Slice extends Sector {
  type: string
  count: number
}

export class Junction {
  readonly kind = 'junction' as const
  pos: Vec
  pinned = false
  /** Pinned by the data set's own layout (e.g. a fixed circle), so not marked as user-pinned. */
  anchored = false
  dragging = false
  /** Animated outer radius; eases toward `targetRadius`. */
  radius: number
  targetRadius: number
  readonly occupants = new Map<string, Set<Walker>>()
  slices: Slice[] = []
  slicesDirty = true
  visits = 0
  departures = 0
  dwellTotal = 0
  readonly outgoing = new Set<Path>()
  readonly incoming = new Set<Path>()
  /** Label width in world units, filled in by the renderer for hit-testing. */
  labelWidth = 0
  /** Where the label was last drawn, in world units (set by the renderer). */
  labelRect: { x: number; y: number; w: number; h: number } | null = null

  constructor(
    readonly name: string,
    pos: Vec,
    radius: number,
  ) {
    this.pos = pos
    this.radius = radius
    this.targetRadius = radius
  }

  get count(): number {
    let n = 0
    for (const set of this.occupants.values()) n += set.size
    return n
  }

  get averageDwell(): number {
    return this.departures === 0 ? 0 : this.dwellTotal / this.departures
  }
}

export class Walker {
  readonly kind = 'walker' as const
  pos: Vec
  junction: Junction | null = null
  enteredAt = 0
  readonly history: Visit[] = []
  dragging = false
  /** Set when the walker has left the world and is fading out; 0..1. */
  exitProgress: number | null = null
  exitedAt = 0

  constructor(
    readonly name: string,
    readonly type: string,
    pos: Vec,
  ) {
    this.pos = pos
  }

  get exiting(): boolean {
    return this.exitProgress !== null
  }
}

export class Path {
  count = 0
  lastTraversedAt = 0
  /** Traffic with older traversals faded out; only kept when the world has `pathMemoryMs`. */
  recent = 0

  constructor(
    readonly from: Junction,
    readonly to: Junction,
  ) {}

  get key(): string {
    return pathKey(this.from.name, this.to.name)
  }
}

export type WorldNode = Junction | Walker

export interface WorldStats {
  junctions: number
  paths: number
  activeWalkers: number
  completed: number
  pending: number
}

function pathKey(from: string, to: string): string {
  return `${from}→${to}`
}

function matches(pattern: string | RegExp, value: string): boolean {
  return typeof pattern === 'string' ? new RegExp(pattern).test(value) : pattern.test(value)
}

interface SpreadGrid {
  spacing: number
  cells: Map<number, Walker[]>
}

/** Integer key for a grid cell (fine for the few thousand cells either side of the origin we use). */
function cellKey(cx: number, cy: number): number {
  return (cx + 0x8000) * 0x10000 + (cy + 0x8000)
}

/** Walkers already inside their slice, bucketed into cells one spacing wide. */
function buildSpreadGrid(slice: Slice, peers: Set<Walker>): SpreadGrid {
  const spacing = Math.max(1, Math.sqrt(sectorArea(slice) / peers.size) * 1.01)
  const cells = new Map<number, Walker[]>()
  for (const w of peers) {
    if (w.dragging || !sectorContains(slice, w.pos)) continue
    const key = cellKey(Math.floor(w.pos.x / spacing), Math.floor(w.pos.y / spacing))
    const cell = cells.get(key)
    if (cell) cell.push(w)
    else cells.set(key, [w])
  }
  return { spacing, cells }
}

export class World {
  readonly layout: LayoutOptions
  readonly walkerTypes: Map<string, WalkerTypeDef>
  /** See `WorldOptions.pathMemoryMs`; null means paths show all-time traffic. */
  readonly pathMemoryMs: number | null
  readonly labels: LabelOptions
  readonly junctions = new Map<string, Junction>()
  readonly walkers = new Map<string, Walker>()
  readonly paths = new Map<string, Path>()

  /** Simulated wall-clock time in ms (epoch based, so it can be shown as a date). */
  simTime: number
  playing = true
  speed = 1
  completed = 0

  private queue: WorldUpdate[] = []
  private queueSorted = true
  private physicsAccumulator = 0
  private readonly exits: ExitRule[]
  private readonly teleports: RerouteRule[]
  private readonly endpointMods: RerouteRule[]
  private readonly random: () => number

  constructor(options: WorldOptions, startTime = 0) {
    this.layout = { ...DEFAULT_LAYOUT, ...options.layout }
    this.walkerTypes = new Map(options.walkerTypes.map((t) => [t.key, t]))
    this.pathMemoryMs = options.pathMemoryMs ?? null
    this.labels = { placement: 'below', screenPx: null, ...options.labels }
    this.exits = options.exits ?? []
    this.teleports = options.teleports ?? []
    this.endpointMods = options.endpointMods ?? []
    this.random = options.random ?? Math.random
    this.simTime = startTime
  }

  // ---------------------------------------------------------------- updates

  enqueue(updates: Iterable<WorldUpdate>): void {
    for (const u of updates) this.queue.push(u)
    this.queueSorted = false
  }

  get pendingUpdates(): number {
    return this.queue.length
  }

  /** Earliest queued update time, or null when the queue is empty. */
  peekNextTime(): number | null {
    this.sortQueue()
    return this.queue.length ? this.queue[0].time : null
  }

  private sortQueue(): void {
    if (this.queueSorted) return
    // Stable sort keeps same-timestamp updates in the order they were enqueued.
    this.queue.sort((a, b) => a.time - b.time)
    this.queueSorted = true
  }

  /** Apply every queued update whose time has arrived. */
  processDue(): number {
    this.sortQueue()
    let i = 0
    while (i < this.queue.length && this.queue[i].time <= this.simTime) {
      this.apply(this.queue[i])
      i++
    }
    if (i > 0) this.queue.splice(0, i)
    return i
  }

  /** Apply a single update immediately, regardless of its timestamp. */
  apply(update: WorldUpdate): void {
    const walkerIsNew = !this.walkers.has(update.walker)
    const walker = this.getOrCreateWalker(update.walker, update.walkerType)
    if (walker.exiting) return // already left the world; late updates are ignored

    let current = walker.junction
    const currentName = current?.name ?? ''

    let targetName = update.junction
    const mod = this.findReroute(this.endpointMods, currentName, targetName)
    if (mod) targetName = mod.name

    const teleport = this.findReroute(this.teleports, currentName, targetName)
    if (teleport) {
      const hop = this.getOrCreateJunction(teleport.name, current)
      this.moveWalker(walker, hop, false, update.time)
      current = hop
    }

    const target = this.getOrCreateJunction(targetName, current)
    if (current === target) return

    this.moveWalker(walker, target, current !== null, update.time)
    if (walkerIsNew) walker.pos = { ...target.pos }
  }

  private findReroute(rules: RerouteRule[], from: string, to: string): RerouteRule | null {
    if (from === to) return null
    for (const rule of rules) {
      if (matches(rule.from, from) && matches(rule.to, to)) return rule
    }
    return null
  }

  /** `time` is the update's own timestamp, so stats stay exact even when a frame applies a backlog. */
  private moveWalker(walker: Walker, target: Junction, drawPath: boolean, time: number): void {
    const from = walker.junction
    if (from) {
      this.removeOccupant(from, walker)
      from.departures++
      from.dwellTotal += time - walker.enteredAt
      if (drawPath) {
        const path = this.getOrCreatePath(from, target)
        path.count++
        if (this.pathMemoryMs) path.recent = this.recentTraffic(path, time) + 1
        path.lastTraversedAt = time
      }
    }
    walker.junction = target
    walker.enteredAt = time
    walker.history.push({ junction: target.name, time })
    let set = target.occupants.get(walker.type)
    if (!set) target.occupants.set(walker.type, (set = new Set()))
    set.add(walker)
    target.visits++
    target.slicesDirty = true
  }

  private removeOccupant(junction: Junction, walker: Walker): void {
    const set = junction.occupants.get(walker.type)
    if (!set) return
    set.delete(walker)
    if (set.size === 0) junction.occupants.delete(walker.type)
    junction.slicesDirty = true
  }

  getOrCreateWalker(name: string, type: string): Walker {
    let w = this.walkers.get(name)
    if (!w) {
      w = new Walker(name, type, vec())
      this.walkers.set(name, w)
    }
    return w
  }

  /** New junctions appear next to the junction the walker came from, or near the existing graph. */
  getOrCreateJunction(name: string, near: Junction | null): Junction {
    let j = this.junctions.get(name)
    if (j) return j
    const r = this.layout.minJunctionRadius
    let pos: Vec
    const angle = this.random() * TAU
    if (near) {
      const d = this.layout.pathLength + near.radius + r
      pos = { x: near.pos.x + Math.cos(angle) * d, y: near.pos.y + Math.sin(angle) * d }
    } else if (this.junctions.size === 0) {
      pos = vec()
    } else {
      const center = mean([...this.junctions.values()].map((x) => x.pos))
      const d = this.layout.junctionSpacing * (1 + this.random())
      pos = { x: center.x + Math.cos(angle) * d, y: center.y + Math.sin(angle) * d }
    }
    j = new Junction(name, pos, r)
    this.junctions.set(name, j)
    return j
  }

  getOrCreatePath(from: Junction, to: Junction): Path {
    const key = pathKey(from.name, to.name)
    let p = this.paths.get(key)
    if (!p) {
      p = new Path(from, to)
      this.paths.set(key, p)
      from.outgoing.add(p)
      to.incoming.add(p)
    }
    return p
  }

  /** A path's faded traffic as of `at` (default: now). 0 when the world keeps all-time traffic. */
  recentTraffic(path: Path, at = this.simTime): number {
    if (!this.pathMemoryMs) return 0
    return path.recent * Math.exp(-Math.max(0, at - path.lastTraversedAt) / this.pathMemoryMs)
  }

  hasPath(from: Junction, to: Junction): boolean {
    return this.paths.has(pathKey(from.name, to.name))
  }

  // ---------------------------------------------------------------- exits

  private exitRuleFor(junction: Junction): ExitRule | undefined {
    return this.exits.find((rule) =>
      typeof rule.junction === 'string' ? rule.junction === junction.name : rule.junction.test(junction.name),
    )
  }

  private processExits(): void {
    for (const w of this.walkers.values()) {
      if (w.exiting || !w.junction || w.dragging) continue
      const rule = this.exitRuleFor(w.junction)
      if (rule && this.simTime - w.enteredAt >= rule.afterMs) {
        const j = w.junction
        this.removeOccupant(j, w)
        j.departures++
        j.dwellTotal += this.simTime - w.enteredAt
        w.exitProgress = 0
        this.completed++
      }
    }
  }

  // ---------------------------------------------------------------- time

  /**
   * Advance by `realDtMs` of real time. Simulated time and physics only move while playing;
   * dragging still works while paused (see `dragNode`).
   */
  advance(realDtMs: number): void {
    if (!this.playing) return
    this.simTime += realDtMs * this.speed
    this.processDue()
    this.processExits()

    this.physicsAccumulator = Math.min(this.physicsAccumulator + realDtMs, STEP_MS * MAX_STEPS_PER_ADVANCE)
    while (this.physicsAccumulator >= STEP_MS) {
      this.step()
      this.physicsAccumulator -= STEP_MS
    }
  }

  /**
   * Run the layout for `steps` physics steps without moving the clock, so walkers start out
   * settled in their junctions instead of spilling out of them.
   */
  settle(steps = 300): void {
    for (let i = 0; i < steps; i++) this.step()
  }

  /** One fixed physics step. */
  step(): void {
    for (const j of this.junctions.values()) this.updateSlices(j)
    this.stepJunctions()
    // A couple of passes so resolving one pair doesn't leave another overlapping.
    this.resolveCollisions()
    this.resolveCollisions()
    this.stepWalkers()
  }

  /** Junction footprint: the circle plus the label hanging below it. */
  private box(j: Junction): { cx: number; cy: number; hw: number; hh: number } {
    // Labels placed outside a fixed layout point away from it, so only the circle needs room.
    const labelBelow = this.labels.placement === 'below' && j.labelWidth > 0
    const hw = labelBelow ? Math.max(j.radius, j.labelWidth / 2) : j.radius
    const top = j.pos.y - j.radius
    const bottom = j.pos.y + j.radius + (labelBelow ? LABEL_GAP + LABEL_HEIGHT : 0)
    return { cx: j.pos.x, cy: (top + bottom) / 2, hw, hh: (bottom - top) / 2 }
  }

  /**
   * Springs are stiff and can pull junctions on top of each other, hiding one. Push apart any
   * overlapping footprints along the axis of least overlap; fixed junctions don't move.
   */
  private resolveCollisions(): void {
    const list = [...this.junctions.values()]
    for (let i = 0; i < list.length; i++) {
      for (let k = i + 1; k < list.length; k++) {
        const a = list[i]
        const b = list[k]
        const aFixed = a.pinned || a.dragging
        const bFixed = b.pinned || b.dragging
        if (aFixed && bFixed) continue
        const A = this.box(a)
        const B = this.box(b)
        const dx = B.cx - A.cx
        const dy = B.cy - A.cy
        const ox = A.hw + B.hw + COLLISION_MARGIN - Math.abs(dx)
        const oy = A.hh + B.hh + COLLISION_MARGIN - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        // Fully resolve: springs re-pull every step, so a partial push would never win.
        const push = 1
        let mx = 0
        let my = 0
        if (ox < oy) mx = ox * push * (dx === 0 ? (this.random() < 0.5 ? -1 : 1) : Math.sign(dx))
        else my = oy * push * (dy === 0 ? (this.random() < 0.5 ? -1 : 1) : Math.sign(dy))
        const shareA = aFixed ? 0 : bFixed ? 1 : 0.5
        const shareB = 1 - shareA
        a.pos = { x: a.pos.x - mx * shareA, y: a.pos.y - my * shareA }
        b.pos = { x: b.pos.x + mx * shareB, y: b.pos.y + my * shareB }
      }
    }
  }

  private updateSlices(j: Junction): void {
    const { walkerRadius, minJunctionRadius } = this.layout
    const n = j.count
    const padding = walkerRadius + 3
    // Area grows with occupancy so the walkers fit inside.
    const areaPerWalker = (walkerRadius * 2.6) ** 2
    const inner = Math.sqrt((n * areaPerWalker) / Math.PI)
    j.targetRadius = Math.max(minJunctionRadius, inner + padding)
    j.radius += (j.targetRadius - j.radius) * 0.1

    if (!j.slicesDirty && j.slices.length) {
      const r = Math.max(0, j.radius - padding)
      for (const s of j.slices) {
        s.center = j.pos
        s.radius = r
      }
      return
    }
    j.slicesDirty = false
    const r = Math.max(0, j.radius - padding)
    const types = [...j.occupants.keys()].sort()
    let angle = SLICE_START
    j.slices = types.map((type) => {
      const count = j.occupants.get(type)!.size
      const span = (count / n) * TAU
      const slice: Slice = { type, count, center: j.pos, radius: r, start: angle, end: angle + span }
      angle += span
      return slice
    })
  }

  private stepJunctions(): void {
    const L = this.layout
    const jitter = this.random
    const list = [...this.junctions.values()]
    const next = new Map<Junction, Vec>()

    for (const j of list) {
      if (j.pinned || j.dragging) continue
      const proposals: Vec[] = []

      // Push apart from nearby junctions.
      const targets: Vec[] = []
      for (const other of list) {
        if (other === j) continue
        const rest = L.junctionSpacing + j.radius + other.radius
        if (dist(j.pos, other.pos) < rest) targets.push(pointAtDistance(other.pos, j.pos, rest, jitter))
      }
      if (targets.length) proposals.push(lerp(j.pos, mean(targets), L.spacerElasticity))

      // Each path acts as a spring toward its other end. Small noise keeps the layout alive.
      for (const p of [...j.outgoing, ...j.incoming]) {
        const other = p.from === j ? p.to : p.from
        const rest = L.pathLength + j.radius + other.radius + jitter()
        proposals.push(lerp(j.pos, pointAtDistance(other.pos, j.pos, rest, jitter), L.pathElasticity))
      }

      if (proposals.length) next.set(j, mean(proposals))
    }
    // Apply after computing so every junction reacts to the same snapshot.
    for (const [j, p] of next) j.pos = p
  }

  private stepWalkers(): void {
    const L = this.layout
    // Spreading only needs nearby peers, so bucket each junction's walkers of a type into a grid
    // (cells one spacing wide) once per step, and check the 3x3 cells around each walker. This
    // keeps a junction holding hundreds of walkers cheap; comparing every pair was O(n²).
    const grids = new Map<Set<Walker>, SpreadGrid>()
    for (const [name, w] of this.walkers) {
      if (w.exiting) {
        w.exitProgress = Math.min(1, w.exitProgress! + STEP_MS / EXIT_FADE_MS)
        if (w.exitProgress >= 1) this.walkers.delete(name)
        continue
      }
      if (w.dragging || !w.junction) continue
      const slice = w.junction.slices.find((s) => s.type === w.type)
      if (!slice) continue

      if (!sectorContains(slice, w.pos)) {
        w.pos = lerp(w.pos, sectorCentroid(slice), L.walkerSeekElasticity)
        continue
      }
      // Inside the slice: spread out evenly using the slice area per walker as spacing.
      const peers = w.junction.occupants.get(w.type)!
      let grid = grids.get(peers)
      if (!grid) grids.set(peers, (grid = buildSpreadGrid(slice, peers)))
      const { spacing, cells } = grid
      const cx = Math.floor(w.pos.x / spacing)
      const cy = Math.floor(w.pos.y / spacing)
      const targets: Vec[] = []
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = cells.get(cellKey(cx + dx, cy + dy))
          if (!cell) continue
          for (const other of cell) {
            if (other === w) continue
            if (dist(w.pos, other.pos) < spacing) targets.push(pointAtDistance(other.pos, w.pos, spacing, this.random))
          }
        }
      }
      if (targets.length) {
        const proposal = lerp(w.pos, mean(targets), L.walkerSpreadElasticity)
        // Never let spreading push a walker out of its slice.
        if (sectorContains(slice, proposal)) w.pos = proposal
      }
    }
  }

  // ---------------------------------------------------------------- interaction

  /**
   * Move a node to `pos`. Dragging a junction carries its settled walkers with it, so
   * rearranging works the same whether or not the simulation is playing.
   */
  dragNode(node: WorldNode, pos: Vec): void {
    if (node.kind === 'junction') {
      const dx = pos.x - node.pos.x
      const dy = pos.y - node.pos.y
      for (const set of node.occupants.values()) {
        for (const w of set) {
          if (!w.dragging && dist(w.pos, node.pos) <= node.radius) w.pos = { x: w.pos.x + dx, y: w.pos.y + dy }
        }
      }
      node.pos = { ...pos }
      for (const s of node.slices) s.center = node.pos
    } else {
      node.pos = { ...pos }
    }
  }

  /**
   * Topmost node under `p`. `slop` (world units) enlarges walker hit areas so small walkers
   * stay clickable when zoomed out. Junction labels sit below the circle and are hittable too.
   */
  hitTest(p: Vec, slop = 0): WorldNode | null {
    let best: Walker | null = null
    let bestD = Infinity
    for (const w of this.walkers.values()) {
      if (w.exiting) continue
      const d = dist(w.pos, p)
      if (d <= this.layout.walkerRadius + slop && d < bestD) {
        best = w
        bestD = d
      }
    }
    return best ?? this.junctionAt(p)
  }

  /** Junction whose circle or label contains `p`, ignoring walkers on top of it. */
  junctionAt(p: Vec): Junction | null {
    const list = [...this.junctions.values()].reverse()
    for (const j of list) {
      if (dist(j.pos, p) <= j.radius) return j
      const r = j.labelRect
      if (r) {
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return j
        continue
      }
      const top = j.pos.y + j.radius + LABEL_GAP
      const half = j.labelWidth / 2
      if (p.x >= j.pos.x - half && p.x <= j.pos.x + half && p.y >= top && p.y <= top + LABEL_HEIGHT) return j
    }
    return null
  }

  /** Bounding box of the graph, including junction labels. */
  bounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (this.junctions.size === 0) return null
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const j of this.junctions.values()) {
      if (this.labels.screenPx) {
        // Fixed-size labels take screen space, not map space: counting them here would make the
        // fit zoom out, which makes them bigger in map units, and so on. The fit adds a margin.
        minX = Math.min(minX, j.pos.x - j.radius)
        maxX = Math.max(maxX, j.pos.x + j.radius)
        minY = Math.min(minY, j.pos.y - j.radius)
        maxY = Math.max(maxY, j.pos.y + j.radius)
        continue
      }
      const r = j.labelRect
      if (r) {
        minX = Math.min(minX, j.pos.x - j.radius, r.x)
        maxX = Math.max(maxX, j.pos.x + j.radius, r.x + r.w)
        minY = Math.min(minY, j.pos.y - j.radius, r.y)
        maxY = Math.max(maxY, j.pos.y + j.radius, r.y + r.h)
        continue
      }
      const halfW = Math.max(j.radius, j.labelWidth / 2)
      minX = Math.min(minX, j.pos.x - halfW)
      maxX = Math.max(maxX, j.pos.x + halfW)
      minY = Math.min(minY, j.pos.y - j.radius)
      maxY = Math.max(maxY, j.pos.y + j.radius + LABEL_GAP + LABEL_HEIGHT)
    }
    return { minX, minY, maxX, maxY }
  }

  stats(): WorldStats {
    let active = 0
    for (const w of this.walkers.values()) if (!w.exiting) active++
    return {
      junctions: this.junctions.size,
      paths: this.paths.size,
      activeWalkers: active,
      completed: this.completed,
      pending: this.queue.length,
    }
  }
}
