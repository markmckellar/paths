import {
  type Sector,
  type Vec,
  TAU,
  dist,
  lerp,
  mean,
  pointAtDistance,
  sectorArea,
  segmentDistance,
  segmentsCross,
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
/** How often (in physics steps) the untangler looks for crossed paths. */
const UNTANGLE_EVERY_STEPS = 30
/** How long a junction takes to slide to its new spot, in physics steps. */
const GLIDE_STEPS = 40
/** Steps to let the layout settle after a move before judging crossings again. */
const UNTANGLE_SETTLE_STEPS = 90
/** Wait after a junction is moved before it may move again; doubles with each move. */
const UNTANGLE_COOLDOWN_STEPS = 180
const UNTANGLE_MAX_BACKOFF = 6
/** Moves in a row that the layout undid (crossings no fewer once settled) before giving up until the graph changes. */
const UNTANGLE_MAX_FAILURES = 3
/** Largest share of the junctions a branch can have and still jump over a path as one. */
const BRANCH_MAX_SHARE = 0.5
/** Directions tried around a junction's neighbours when looking for a better spot. */
const UNTANGLE_ANGLES = 16
/** How often (in physics steps) the spread is adjusted. */
const SPREAD_EVERY_STEPS = 30
/**
 * Most a wall pushes a junction back in one step. Walls push all the way back (springs re-pull
 * every step, so a partial push would never win), but no faster than this, so nothing jumps.
 */
const WALL_MAX_PUSH = 20
/** Screen-free gap kept between junctions and the walls. */
const WALL_MARGIN = 10
/** Average wall push (world units per junction per step) above which the graph is too packed... */
const PRESSURE_HIGH = 0.5
/** ...and below which it may spread out further. In between, nothing changes. */
const PRESSURE_LOW = 0.1
/** Grow only while the graph leaves at least this share of the room empty across or down... */
const MIN_SLACK = 0.08
/**
 * ...and pull in only when it fills the room at least this closely across or down. Pressure on a
 * graph with room to spare all round means it's wedged into a corner, not too big.
 */
const FULL_SLACK = 0.15
/** Room left across or down, while the graph presses on the walls, that means it hasn't found its shape yet. */
const WEDGED_SLACK = 0.4
const SPREAD_GROW = 1.02
const SPREAD_SHRINK = 0.97
const MIN_SPREAD = 0.7
const MAX_SPREAD = 3
/** Steps without anything changing (no new junctions or paths, drags, moves...) before the layout calms down. */
const CALM_AFTER_STEPS = 180
/**
 * How far (world units, on average) junctions may get from where they were a second earlier and
 * still count as nearly settled. Net distance, not distance travelled: jiggling on the spot goes
 * nowhere, while a layout still unfolding keeps heading somewhere.
 */
const SETTLED_DRIFT = 10
const DRIFT_EVERY_STEPS = 180
/** Once calm, the springs fade out over this many steps, then stop: close enough is good enough. */
const COOL_STEPS = 120
/** Once calm, a junction growing or shrinking by this share wakes the layout, so its neighbours make room or close up. */
const CALM_RADIUS_SHARE = 0.5
/** ...and by at least this much (world units), so small junctions gaining a few items don't. */
const CALM_RADIUS_CHANGE = 20
/** A path passing this close to a junction's circle counts as running through it. */
const PATH_CLEARANCE = 6

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
  /**
   * The radius the springs and spacing use. It follows `radius` while the layout is settling; once
   * calm it holds, and a big change from it wakes the layout. (Collisions use the real radius.)
   */
  layoutRadius: number
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
  /** Set while the untangler slides this junction to a spot where its paths cross fewer others. */
  glide: { from: Vec; to: Vec; t: number } | null = null
  /** Times the untangler has moved it; each move makes it wait longer before it may move again. */
  untangleMoves = 0
  /** Physics step from which the untangler may move it again. */
  untangleReadyAt = 0

  constructor(
    readonly name: string,
    pos: Vec,
    radius: number,
  ) {
    this.pos = pos
    this.radius = radius
    this.targetRadius = radius
    this.layoutRadius = radius
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
  /** The path the other way between the same junctions, if there is one. */
  reverse: Path | null = null

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

/** An axis-aligned box in world units. */
export interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** `p` mirrored across the line through `a` and `b`. */
function reflect(p: Vec, a: Vec, b: Vec): Vec {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy || 1
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  const fx = a.x + dx * t
  const fy = a.y + dy * t
  return { x: 2 * fx - p.x, y: 2 * fy - p.y }
}

/** A drawn connection between two junctions, whichever way traffic goes. */
interface Edge {
  a: Junction
  b: Junction
  index: number
}

/** A possible untangling move: junctions and where they would go. */
interface UntangleMove {
  moves: Map<Junction, Vec>
  gain: number
  distance: number
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
  /** Junction moves the untangler has made (for tests and debugging). */
  untangleMoves = 0
  /**
   * The area the graph should fill, in world units, set by the UI (the visible window). Its edges
   * are walls that softly push junctions back in. Null: no walls.
   */
  room: Box | null = null
  /** Areas inside the room to keep clear, such as a legend drawn over the graph. Also walls. */
  keepOut: Box[] = []
  /**
   * How spread out the layout is: path lengths and spacing are multiplied by it. Like a gas in a
   * box, it slowly grows until the graph presses gently on the walls, so the graph fills the room.
   */
  spread = 1
  /** The graph presses on the walls even packed as tight as it goes: the room should grow. */
  cramped = false

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
  private readonly untangleEnabled: boolean
  readonly fillView: boolean
  /** Wall pushes added up since the spread was last adjusted. */
  private pressure = 0
  /** Last step at which something changed that the layout should react to. */
  private lastStir = 0
  /** What was seen last step, to notice changes: counts, room, spread, radii. */
  private stirKey = ''
  private stepCount = 0
  private untangleRestUntil = 0
  /** Edge count the untangler's bookkeeping below is for; it starts afresh when the graph grows. */
  private untangleEdgeCount = -1
  /** Least whole-graph tangle seen since then. Only beating it counts as progress. */
  private untangleRecord = Infinity
  /** Set after a move, so the next look can check whether it made progress. */
  private untangleJudging = false
  private untangleFailures = 0

  constructor(options: WorldOptions, startTime = 0) {
    this.layout = { ...DEFAULT_LAYOUT, ...options.layout }
    this.walkerTypes = new Map(options.walkerTypes.map((t) => [t.key, t]))
    this.pathMemoryMs = options.pathMemoryMs ?? null
    this.labels = { placement: 'below', screenPx: null, ...options.labels }
    this.exits = options.exits ?? []
    this.teleports = options.teleports ?? []
    this.endpointMods = options.endpointMods ?? []
    this.random = options.random ?? Math.random
    this.untangleEnabled = options.untangle ?? true
    this.fillView = options.fillView ?? true
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
      pos = this.placeNear(near, r, angle)
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

  /**
   * A spot next to `near` for a new junction: of a ring of directions starting at the random
   * `angle`, the one whose path from `near` crosses the fewest paths and lands in the most room.
   */
  private placeNear(near: Junction, r: number, angle: number): Vec {
    const d = this.layout.pathLength * this.spread + near.radius + r
    const edges = this.edges()
    let best = near.pos
    let bestCost = Infinity
    for (let k = 0; k < UNTANGLE_ANGLES; k++) {
      const a = angle + (k * TAU) / UNTANGLE_ANGLES
      const p = { x: near.pos.x + Math.cos(a) * d, y: near.pos.y + Math.sin(a) * d }
      let cost = 0
      for (const e of edges) {
        if (e.a !== near && e.b !== near && segmentsCross(near.pos, p, e.a.pos, e.b.pos)) cost++
        if (segmentDistance(p, e.a.pos, e.b.pos) < r + PATH_CLEARANCE) cost++
      }
      for (const o of this.junctions.values()) {
        if (o !== near && dist(p, o.pos) < o.radius + r + this.layout.junctionSpacing * this.spread) cost += 0.5
      }
      if (cost < bestCost) {
        bestCost = cost
        best = p
      }
    }
    return best
  }

  getOrCreatePath(from: Junction, to: Junction): Path {
    const key = pathKey(from.name, to.name)
    let p = this.paths.get(key)
    if (!p) {
      p = new Path(from, to)
      p.reverse = this.paths.get(pathKey(to.name, from.name)) ?? null
      if (p.reverse) p.reverse.reverse = p
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
    for (const p of from.outgoing) if (p.to === to) return true
    return false
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
    this.stepCount++
    this.noticeChanges()
    for (const j of this.junctions.values()) this.updateSlices(j)
    this.stepGlides()
    this.stepJunctions()
    // A couple of passes so resolving one pair doesn't leave another overlapping.
    this.resolveCollisions()
    this.resolveCollisions()
    if (this.fillView) this.pushOffWalls()
    if (this.stepCount % DRIFT_EVERY_STEPS === 0) this.checkDrift()
    this.stepWalkers()
    if (this.untangleEnabled && this.stepCount % UNTANGLE_EVERY_STEPS === 0) this.untangle()
    if (this.fillView && this.stepCount % SPREAD_EVERY_STEPS === 0) {
      // Once calm the springs no longer press on the walls, so the spread would only creep out.
      if (this.calm) this.pressure = 0
      else this.adjustSpread()
    }
  }

  /**
   * The layout is calm once it has nearly stopped moving and nothing has changed for a while: no
   * new junctions or paths, nothing dragged or sliding, nothing pinned or released, the room and spread steady. Then the springs
   * cool off and stop (see `warmth`), so a graph that's close enough to settled stays still
   * instead of shimmering. Collisions and walls still act, so nothing overlaps or leaves the room. Any change wakes it. So does a junction growing or
   * shrinking a lot; smaller changes as items come and go don't.
   */
  get calm(): boolean {
    return this.stepCount - this.lastStir > CALM_AFTER_STEPS
  }

  /** Where junctions were at the last drift check. */
  private driftFrom = new Map<Junction, Vec>()

  /** Still finding its shape (not just jiggling about): too soon to calm down. */
  private checkDrift(): void {
    let moved = 0
    let n = 0
    for (const j of this.junctions.values()) {
      const p = this.driftFrom.get(j)
      if (p) {
        moved += dist(j.pos, p)
        n++
      }
    }
    if (!this.calm && n && moved / n > SETTLED_DRIFT) this.lastStir = this.stepCount
    this.driftFrom = new Map([...this.junctions.values()].map((j) => [j, j.pos]))
  }

  /** How strongly the springs act: 1 while settling, fading to 0 once calm. */
  get warmth(): number {
    const cooling = this.stepCount - this.lastStir - CALM_AFTER_STEPS
    return cooling <= 0 ? 1 : Math.max(0, 1 - cooling / COOL_STEPS)
  }

  /** Wake the layout so it reacts to a change (e.g. a junction dropped somewhere new). */
  stir(): void {
    this.lastStir = this.stepCount
  }

  private noticeChanges(): void {
    const r = this.room
    const key = `${this.junctions.size}|${this.paths.size}|${this.spread}|${r ? `${r.minX},${r.minY},${r.maxX},${r.maxY}` : ''}|${this.keepOut.length}`
    let pinned = 0
    for (const j of this.junctions.values()) if (j.pinned) pinned++
    let stirred = key + pinned !== this.stirKey
    this.stirKey = key + pinned
    const calm = this.calm
    for (const j of this.junctions.values()) {
      if (j.dragging || j.glide) stirred = true
      if (!calm) j.layoutRadius = j.radius
      else if (Math.abs(j.radius - j.layoutRadius) > Math.max(CALM_RADIUS_CHANGE, j.layoutRadius * CALM_RADIUS_SHARE)) {
        j.layoutRadius = j.radius
        stirred = true
      }
    }
    if (stirred) this.lastStir = this.stepCount
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
        // A gliding junction passes over others on its way rather than shoving them aside.
        if (a.glide || b.glide) continue
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
    const spacing = L.junctionSpacing * this.spread
    const pathLength = L.pathLength * this.spread
    // Small noise keeps a settling layout from getting stuck; once calm it only causes shimmer.
    const noise = this.calm ? () => 0.5 : jitter
    const warmth = this.warmth
    if (warmth === 0) return

    for (const j of list) {
      if (j.pinned || j.dragging || j.glide) continue
      const proposals: Vec[] = []

      // Push apart from nearby junctions.
      const targets: Vec[] = []
      for (const other of list) {
        if (other === j) continue
        const rest = spacing + j.layoutRadius + other.layoutRadius
        if (dist(j.pos, other.pos) < rest) targets.push(pointAtDistance(other.pos, j.pos, rest, jitter))
      }
      if (targets.length) proposals.push(lerp(j.pos, mean(targets), L.spacerElasticity))

      // Each path acts as a spring toward its other end.
      for (const p of [...j.outgoing, ...j.incoming]) {
        const other = p.from === j ? p.to : p.from
        const rest = pathLength + j.layoutRadius + other.layoutRadius + noise()
        proposals.push(lerp(j.pos, pointAtDistance(other.pos, j.pos, rest, jitter), L.pathElasticity))
      }

      if (proposals.length) next.set(j, lerp(j.pos, mean(proposals), warmth))
    }
    // Apply after computing so every junction reacts to the same snapshot.
    for (const [j, p] of next) j.pos = p
  }

  // ---------------------------------------------------------------- filling the room

  /**
   * The room's edges and keep-out areas act as soft walls: a junction whose footprint (circle and
   * label) pokes past one is pushed part of the way back each step. How hard the walls are pushing
   * is what tells the spread to stop growing.
   *
   * Each push also nudges the whole graph by the average push, the way a wall pushes a whole body
   * rather than one corner of it, so a graph wedged into one side of the room moves to the middle
   * instead of being squeezed smaller.
   */
  private pushOffWalls(): void {
    const room = this.room
    if (!room) return
    const free: Junction[] = []
    let sumX = 0
    let sumY = 0
    const inner = { minX: room.minX + WALL_MARGIN, minY: room.minY + WALL_MARGIN, maxX: room.maxX - WALL_MARGIN, maxY: room.maxY - WALL_MARGIN }
    for (const j of this.junctions.values()) {
      if (j.pinned || j.dragging || j.glide) continue
      free.push(j)
      const b = this.box(j)
      const left = b.cx - b.hw
      const right = b.cx + b.hw
      const top = b.cy - b.hh
      const bottom = b.cy + b.hh
      let dx = 0
      let dy = 0
      if (right - left > inner.maxX - inner.minX) dx = (inner.minX + inner.maxX) / 2 - b.cx
      else if (left < inner.minX) dx = inner.minX - left
      else if (right > inner.maxX) dx = inner.maxX - right
      if (bottom - top > inner.maxY - inner.minY) dy = (inner.minY + inner.maxY) / 2 - b.cy
      else if (top < inner.minY) dy = inner.minY - top
      else if (bottom > inner.maxY) dy = inner.maxY - bottom
      for (const o of this.keepOut) {
        const ox0 = o.minX - WALL_MARGIN
        const ox1 = o.maxX + WALL_MARGIN
        const oy0 = o.minY - WALL_MARGIN
        const oy1 = o.maxY + WALL_MARGIN
        if (right <= ox0 || left >= ox1 || bottom <= oy0 || top >= oy1) continue
        // Out through the nearest side that stays in the room.
        const ways = [
          { x: ox0 - right, y: 0, ok: ox0 - (right - left) >= inner.minX },
          { x: ox1 - left, y: 0, ok: ox1 + (right - left) <= inner.maxX },
          { x: 0, y: oy0 - bottom, ok: oy0 - (bottom - top) >= inner.minY },
          { x: 0, y: oy1 - top, ok: oy1 + (bottom - top) <= inner.maxY },
        ].filter((w) => w.ok)
        if (!ways.length) continue
        const w = ways.reduce((a, c) => (Math.abs(a.x) + Math.abs(a.y) <= Math.abs(c.x) + Math.abs(c.y) ? a : c))
        dx += w.x
        dy += w.y
      }
      if (dx === 0 && dy === 0) continue
      const len = Math.hypot(dx, dy)
      if (len > WALL_MAX_PUSH) {
        dx *= WALL_MAX_PUSH / len
        dy *= WALL_MAX_PUSH / len
      }
      j.pos = { x: j.pos.x + dx, y: j.pos.y + dy }
      this.pressure += Math.min(len, WALL_MAX_PUSH)
      sumX += dx
      sumY += dy
    }
    if (free.length < 2 || (sumX === 0 && sumY === 0)) return
    const shift = { x: sumX / free.length, y: sumY / free.length }
    for (const j of free) j.pos = { x: j.pos.x + shift.x, y: j.pos.y + shift.y }
  }

  /**
   * Spread out while the walls barely push and there's room to spare, pull in while they push
   * hard, and otherwise leave things be. Small, slow steps with a dead zone between, so the graph
   * eases into its room instead of bouncing about.
   */
  private adjustSpread(): void {
    const pushed = this.pressure
    this.pressure = 0
    const room = this.room
    const free = [...this.junctions.values()].filter((j) => !j.pinned)
    if (!room || free.length < 2) {
      this.cramped = false
      return
    }
    const push = pushed / (free.length * SPREAD_EVERY_STEPS)
    const b = this.bounds()!
    const slackX = 1 - (b.maxX - b.minX) / (room.maxX - room.minX)
    const slackY = 1 - (b.maxY - b.minY) / (room.maxY - room.minY)
    const full = Math.min(slackX, slackY) < FULL_SLACK
    const squeezed = push > PRESSURE_HIGH && full
    if (squeezed) this.spread = Math.max(MIN_SPREAD, this.spread * SPREAD_SHRINK)
    else if (push < PRESSURE_LOW && Math.max(slackX, slackY) > MIN_SLACK) {
      this.spread = Math.min(MAX_SPREAD, this.spread * SPREAD_GROW)
    }
    this.cramped = this.spread <= MIN_SPREAD && squeezed
    // Pressing on the walls with room to spare across or down: wedged, still turning to fit.
    if (push >= PRESSURE_LOW && Math.max(slackX, slackY) > WEDGED_SLACK) this.lastStir = this.stepCount
  }

  // ---------------------------------------------------------------- untangling

  /** Slide junctions the untangler has moved, easing in and out. */
  private stepGlides(): void {
    for (const j of this.junctions.values()) {
      const g = j.glide
      if (!g) continue
      if (j.pinned || j.dragging) {
        j.glide = null
        continue
      }
      g.t = Math.min(1, g.t + 1 / GLIDE_STEPS)
      this.carryJunction(j, lerp(g.from, g.to, g.t * g.t * (3 - 2 * g.t)))
      if (g.t >= 1) j.glide = null
    }
  }

  /** Paths as drawn: one edge per pair of junctions, skipping faded-out paths. */
  private edges(): Edge[] {
    const seen = new Map<Junction, Set<Junction>>()
    const edges: Edge[] = []
    for (const p of this.paths.values()) {
      if (p.from === p.to) continue
      if (this.pathMemoryMs && this.recentTraffic(p) < 0.3 && this.recentTraffic(this.reverse(p)) < 0.3) continue
      const [a, b] = p.from.name < p.to.name ? [p.from, p.to] : [p.to, p.from]
      let set = seen.get(a)
      if (!set) seen.set(a, (set = new Set()))
      if (set.has(b)) continue
      set.add(b)
      edges.push({ a, b, index: edges.length })
    }
    return edges
  }

  private reverse(p: Path): Path {
    return p.reverse ?? p
  }

  /**
   * How tangled things are around the junctions in `moved`, with them placed by `at`: crossings
   * involving their paths, plus paths running through a junction's circle. Only the parts that
   * moving those junctions can change are counted, so costs before and after a move compare.
   */
  private tangleCost(moved: Set<Junction>, edges: Edge[], at: (j: Junction) => Vec): number {
    // Only pairs involving a moved junction can change: a path touching one, or a junction that
    // moved onto a path. Looking at just those keeps the search cheap.
    const touching = new Set<Edge>()
    for (const e of edges) if (moved.has(e.a) || moved.has(e.b)) touching.add(e)
    let cost = 0
    for (const e of touching) {
      const a = at(e.a)
      const b = at(e.b)
      for (const f of edges) {
        if (touching.has(f) && f.index <= e.index) continue // each touching pair once
        if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue
        if (segmentsCross(a, b, at(f.a), at(f.b))) cost++
      }
      for (const j of this.junctions.values()) {
        if (j === e.a || j === e.b) continue
        if (segmentDistance(at(j), a, b) < j.radius + PATH_CLEARANCE) cost++
      }
    }
    for (const j of moved) {
      const p = at(j)
      for (const e of edges) {
        if (touching.has(e) || j === e.a || j === e.b) continue
        if (segmentDistance(p, at(e.a), at(e.b)) < j.radius + PATH_CLEARANCE) cost++
      }
    }
    return cost
  }

  /**
   * Spring layouts often settle with paths crossed: springs only care about length, so a junction
   * on the wrong side of a path has no reason to come back over it. Every so often, look for a
   * junction (or pair to swap) whose move would leave strictly fewer crossings, and slide it there.
   *
   * To keep the graph from flipping back and forth, a move is only made when it is a clear
   * improvement, one at a time with time to settle in between, and each junction waits longer
   * after every move it makes. When no move helps, crossings are left alone.
   */
  private untangle(): void {
    if (this.stepCount < this.untangleRestUntil) return
    for (const j of this.junctions.values()) if (j.dragging || j.glide) return
    const edges = this.edges()
    if (edges.length !== this.untangleEdgeCount) {
      this.untangleEdgeCount = edges.length
      this.untangleRecord = Infinity
      this.untangleFailures = 0
      this.untangleJudging = false
    }
    if (this.untangleFailures >= UNTANGLE_MAX_FAILURES) return
    const total = this.tangleCost(new Set(this.junctions.values()), edges, (j) => j.pos)
    // Springs can slowly pull a moved junction back over the path it jumped, so a move only counts
    // as progress if the graph ends up less tangled than it has ever been (since it last grew).
    // Moves that don't make progress use up a small allowance, after which the untangler leaves
    // things as they are rather than have the graph flip about.
    if (total < this.untangleRecord) {
      this.untangleRecord = total
      this.untangleFailures = 0
    } else if (this.untangleJudging) {
      this.untangleFailures++
    }
    this.untangleJudging = false
    if (total === 0 || this.untangleFailures >= UNTANGLE_MAX_FAILURES) return

    // Junctions on a crossed path, or on a path through another junction, that are free to move.
    const tangled = new Set<Junction>()
    const all = new Set(this.junctions.values())
    const at = (j: Junction) => j.pos
    for (const e of edges) {
      for (const f of edges) {
        if (f.index <= e.index || e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue
        if (segmentsCross(e.a.pos, e.b.pos, f.a.pos, f.b.pos)) for (const j of [e.a, e.b, f.a, f.b]) tangled.add(j)
      }
      for (const j of all) {
        if (j === e.a || j === e.b) continue
        if (segmentDistance(j.pos, e.a.pos, e.b.pos) < j.radius + PATH_CLEARANCE) {
          for (const k of [e.a, e.b, j]) tangled.add(k)
        }
      }
    }
    const movable = [...tangled].filter((j) => !j.pinned && this.stepCount >= j.untangleReadyAt)
    if (movable.length === 0) return

    const neighbours = new Map<Junction, Junction[]>()
    for (const e of edges) {
      neighbours.set(e.a, [...(neighbours.get(e.a) ?? []), e.b])
      neighbours.set(e.b, [...(neighbours.get(e.b) ?? []), e.a])
    }

    let best: UntangleMove | null = null
    const consider = (moves: Map<Junction, Vec>) => {
      const moved = new Set(moves.keys())
      const before = this.tangleCost(moved, edges, at)
      const after = this.tangleCost(moved, edges, (j) => moves.get(j) ?? j.pos)
      const gain = before - after
      if (gain < 1) return
      let distance = 0
      for (const [j, p] of moves) distance += dist(j.pos, p)
      if (!best || gain > best.gain || (gain === best.gain && distance < best.distance)) best = { moves, gain, distance }
    }

    // Move one junction to a spot around its neighbours.
    for (const j of movable) {
      const nbrs = neighbours.get(j)
      if (!nbrs?.length) continue
      const centre = mean(nbrs.map((n) => n.pos))
      const minR = this.layout.pathLength * this.spread + 2 * j.radius
      const radii = new Set([
        Math.round(Math.max(minR, dist(j.pos, centre))),
        Math.round(Math.max(minR, mean(nbrs.map((n) => ({ x: dist(j.pos, n.pos), y: 0 }))).x)),
      ])
      const start = Math.atan2(j.pos.y - centre.y, j.pos.x - centre.x)
      for (const r of radii) {
        for (let k = 1; k < UNTANGLE_ANGLES; k++) {
          const a = start + (k * TAU) / UNTANGLE_ANGLES
          const p = { x: centre.x + Math.cos(a) * r, y: centre.y + Math.sin(a) * r }
          if (this.crowded(p, j)) continue
          consider(new Map([[j, p]]))
        }
      }
    }
    // A group of junctions jumps over a path it crosses as one piece, keeping its shape. For path
    // u-v crossing path f, the group is v and everything reached from it without going back
    // through u: a branch hanging off u. Within a loop twisted into a figure-eight, also stop at
    // one end of f: the group is then one lobe, and flipping it untwists the loop. Moving the
    // fewest junctions breaks ties, so the smaller side tends to jump.
    const crossed: [Edge, Edge][] = []
    for (const e of edges) {
      for (const f of edges) {
        if (f.index === e.index || e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue
        if (segmentsCross(e.a.pos, e.b.pos, f.a.pos, f.b.pos)) crossed.push([e, f])
      }
    }
    for (const [e, f] of crossed) {
      for (const [u, v] of [
        [e.a, e.b],
        [e.b, e.a],
      ]) {
        for (const cuts of [[u], [u, f.a], [u, f.b]]) {
          const group = this.branch(v, new Set(cuts), neighbours, this.junctions.size * BRANCH_MAX_SHARE)
          if (!group || group.size < 2 || (cuts.length === 1 && (group.has(f.a) || group.has(f.b)))) continue
          if ([...group].some((j) => j.pinned || this.stepCount < j.untangleReadyAt)) continue
          const centre = mean([...group].map((j) => j.pos))
          const flips: ((p: Vec) => Vec)[] = [
            (p) => reflect(p, f.a.pos, f.b.pos),
            (p) => ({ x: 2 * centre.x - p.x, y: 2 * centre.y - p.y }),
          ]
          if (cuts.length === 2) flips.push((p) => reflect(p, cuts[0].pos, cuts[1].pos))
          for (const flip of flips) {
            const moves = new Map<Junction, Vec>()
            for (const j of group) moves.set(j, flip(j.pos))
            if (![...moves].some(([j, p]) => this.crowded(p, j, group))) consider(moves)
          }
        }
      }
    }
    // Swap two junctions.
    for (let i = 0; i < movable.length; i++) {
      for (let k = i + 1; k < movable.length; k++) {
        const a = movable[i]
        const b = movable[k]
        consider(
          new Map([
            [a, b.pos],
            [b, a.pos],
          ]),
        )
      }
    }

    const move = best as UntangleMove | null
    if (!move) return
    this.untangleJudging = true
    for (const [j, p] of move.moves) {
      j.glide = { from: { ...j.pos }, to: p, t: 0 }
      j.untangleReadyAt = this.stepCount + UNTANGLE_COOLDOWN_STEPS * 2 ** Math.min(j.untangleMoves, UNTANGLE_MAX_BACKOFF)
      j.untangleMoves++
      this.untangleMoves++
    }
    this.untangleRestUntil = this.stepCount + GLIDE_STEPS + UNTANGLE_SETTLE_STEPS
  }

  /**
   * `start` and every junction reachable from it without passing through `cuts`, or null when
   * that is more than `max` junctions.
   */
  private branch(start: Junction, cuts: Set<Junction>, neighbours: Map<Junction, Junction[]>, max: number): Set<Junction> | null {
    const seen = new Set([start])
    const todo = [start]
    while (todo.length) {
      for (const n of neighbours.get(todo.pop()!) ?? []) {
        if (cuts.has(n) || seen.has(n)) continue
        if (seen.size >= max) return null
        seen.add(n)
        todo.push(n)
      }
    }
    return seen
  }

  /** Whether `p` is too close to a junction (other than `self`, or ones moving with it) to put `self` there. */
  private crowded(p: Vec, self: Junction, alsoMoving?: Set<Junction>): boolean {
    const room = this.room
    if (room && (p.x < room.minX || p.x > room.maxX || p.y < room.minY || p.y > room.maxY)) return true
    for (const o of this.junctions.values()) {
      if (o !== self && !alsoMoving?.has(o) && dist(p, o.pos) < self.radius + o.radius + this.layout.pathLength / 2) return true
    }
    return false
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
      node.glide = null
      this.carryJunction(node, pos)
    } else {
      node.pos = { ...pos }
    }
  }

  /** Move a junction, taking the walkers settled inside it along. */
  private carryJunction(j: Junction, pos: Vec): void {
    const dx = pos.x - j.pos.x
    const dy = pos.y - j.pos.y
    for (const set of j.occupants.values()) {
      for (const w of set) {
        if (!w.dragging && dist(w.pos, j.pos) <= j.radius) w.pos = { x: w.pos.x + dx, y: w.pos.y + dy }
      }
    }
    j.pos = { ...pos }
    for (const s of j.slices) s.center = j.pos
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
