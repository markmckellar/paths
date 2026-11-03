import { describe, expect, it } from 'vitest'
import { PipelineFeed } from '../demo/pipeline'
import { fitCamera, screenToWorld, worldToScreen, zoomAt } from './camera'
import {
  TAU,
  dist,
  pointAtDistance,
  sectorArea,
  sectorCentroid,
  sectorContains,
  seededRandom,
} from './geometry'
import type { WorldOptions, WorldUpdate } from './types'
import { World } from './world'

const types: WorldOptions['walkerTypes'] = [
  { key: 'a', label: 'A', color: '#f00', shape: 'circle' },
  { key: 'b', label: 'B', color: '#00f', shape: 'square' },
]

function makeWorld(extra: Partial<WorldOptions> = {}): World {
  return new World({ walkerTypes: types, random: seededRandom(1), ...extra }, 0)
}

const u = (time: number, walker: string, junction: string, walkerType = 'a'): WorldUpdate => ({
  time,
  walker,
  junction,
  walkerType,
})

describe('geometry', () => {
  it('places a point at a distance along the ray', () => {
    const p = pointAtDistance({ x: 0, y: 0 }, { x: 10, y: 0 }, 4, Math.random)
    expect(p).toEqual({ x: 4, y: 0 })
  })

  it('separates coincident points using jitter', () => {
    const p = pointAtDistance({ x: 1, y: 1 }, { x: 1, y: 1 }, 5, () => 0.25)
    expect(dist(p, { x: 1, y: 1 })).toBeCloseTo(5)
  })

  it('tests sector containment, including sectors that wrap past 0', () => {
    const s = { center: { x: 0, y: 0 }, radius: 10, start: -Math.PI / 4, end: Math.PI / 4 }
    expect(sectorContains(s, { x: 5, y: 0 })).toBe(true)
    expect(sectorContains(s, { x: 0, y: 5 })).toBe(false)
    expect(sectorContains(s, { x: 11, y: 0 })).toBe(false)
    const full = { ...s, start: 0, end: TAU }
    expect(sectorContains(full, { x: -5, y: -5 })).toBe(true)
  })

  it('computes sector area and centroid', () => {
    const half = { center: { x: 0, y: 0 }, radius: 3, start: -Math.PI / 2, end: Math.PI / 2 }
    expect(sectorArea(half)).toBeCloseTo((Math.PI * 9) / 2)
    const c = sectorCentroid(half)
    expect(c.x).toBeCloseTo((4 * 3) / (3 * Math.PI))
    expect(c.y).toBeCloseTo(0)
    expect(sectorCentroid({ ...half, start: 0, end: TAU })).toEqual({ x: 0, y: 0 })
  })
})

describe('camera', () => {
  const view = { width: 800, height: 600 }

  it('round-trips between screen and world', () => {
    const cam = { x: 50, y: -20, zoom: 1.7 }
    const p = { x: 123, y: 456 }
    const back = screenToWorld(cam, view, worldToScreen(cam, view, p))
    expect(back.x).toBeCloseTo(p.x)
    expect(back.y).toBeCloseTo(p.y)
  })

  it('keeps the point under the cursor fixed while zooming', () => {
    const cam = { x: 0, y: 0, zoom: 1 }
    const cursor = { x: 600, y: 100 }
    const before = screenToWorld(cam, view, cursor)
    const after = screenToWorld(zoomAt(cam, view, cursor, 2), view, cursor)
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
  })

  it('fits bounds inside the viewport', () => {
    const cam = fitCamera({ minX: 0, minY: 0, maxX: 1000, maxY: 100 }, view, 50)
    expect(cam.x).toBe(500)
    expect(cam.zoom).toBeCloseTo(0.7)
  })
})

describe('World updates', () => {
  it('processes updates in time order and only once they are due', () => {
    const w = makeWorld()
    w.enqueue([u(2000, 'w1', 'B'), u(1000, 'w1', 'A')])
    w.simTime = 1500
    expect(w.processDue()).toBe(1)
    expect(w.walkers.get('w1')!.junction!.name).toBe('A')
    w.simTime = 2000
    w.processDue()
    expect(w.walkers.get('w1')!.junction!.name).toBe('B')
    expect(w.pendingUpdates).toBe(0)
  })

  it('creates directed paths and counts traversals', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(1, 'w1', 'B'), u(2, 'w2', 'A'), u(3, 'w2', 'B'), u(4, 'w2', 'A')])
    w.simTime = 10
    w.processDue()
    expect([...w.paths.keys()].sort()).toEqual(['A→B', 'B→A'])
    const ab = w.paths.get('A→B')!
    expect(ab.count).toBe(2)
    expect(w.hasPath(ab.to, ab.from)).toBe(true)
  })

  it('tracks occupants by type, keyed per walker (not per object string)', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A', 'a'), u(0, 'w2', 'A', 'a'), u(0, 'w3', 'A', 'b')])
    w.simTime = 0
    w.processDue()
    const a = w.junctions.get('A')!
    expect(a.count).toBe(3)
    expect(a.occupants.get('a')!.size).toBe(2)
    expect(a.occupants.get('b')!.size).toBe(1)
  })

  it('ignores a move to the junction the walker is already at (no self-loop)', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(1, 'w1', 'A')])
    w.simTime = 5
    w.processDue()
    expect(w.paths.size).toBe(0)
    expect(w.junctions.get('A')!.visits).toBe(1)
  })

  it('records dwell time and history', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(400, 'w1', 'B')])
    w.simTime = 400
    w.processDue()
    expect(w.junctions.get('A')!.averageDwell).toBe(400)
    expect(w.walkers.get('w1')!.history.map((h) => h.junction)).toEqual(['A', 'B'])
  })

  it('removes walkers after the exit delay, then fades them out', () => {
    const w = makeWorld({ exits: [{ junction: 'Done', afterMs: 1000 }] })
    w.enqueue([u(0, 'w1', 'Done')])
    w.advance(500)
    expect(w.walkers.get('w1')!.exiting).toBe(false)
    w.advance(600)
    const walker = w.walkers.get('w1')!
    expect(walker.exiting).toBe(true)
    expect(w.junctions.get('Done')!.count).toBe(0)
    expect(w.stats().completed).toBe(1)
    for (let i = 0; i < 20; i++) w.advance(100)
    expect(w.walkers.has('w1')).toBe(false)
  })

  it('applies endpoint mods and teleports, including for brand-new walkers', () => {
    const w = makeWorld({
      endpointMods: [{ name: 'Late Review', from: '^QA$', to: '^Review$' }],
      teleports: [{ name: 'Requeue', from: '^Done$', to: '.*' }],
    })
    w.enqueue([u(0, 'w1', 'QA'), u(1, 'w1', 'Review'), u(2, 'w2', 'Done'), u(3, 'w2', 'Start')])
    w.simTime = 10
    w.processDue()
    expect(w.walkers.get('w1')!.junction!.name).toBe('Late Review')
    expect(w.paths.has('QA→Late Review')).toBe(true)
    // Teleport: w2 hops Done -> Requeue without a path, then walks Requeue -> Start.
    expect(w.walkers.get('w2')!.history.map((h) => h.junction)).toEqual(['Done', 'Requeue', 'Start'])
    expect(w.paths.has('Done→Requeue')).toBe(false)
    expect(w.paths.has('Requeue→Start')).toBe(true)
  })

  it('does not advance time or physics while paused', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(100, 'w1', 'B')])
    w.advance(50)
    w.playing = false
    const before = { ...w.junctions.get('A')!.pos }
    w.advance(1000)
    expect(w.simTime).toBe(50)
    expect(w.junctions.get('A')!.pos).toEqual(before)
  })
})

describe('World physics', () => {
  function settle(w: World, steps = 600): void {
    for (let i = 0; i < steps; i++) w.step()
  }

  it('settles connected junctions near the spring rest length', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(1, 'w1', 'B')])
    w.simTime = 1
    w.processDue()
    settle(w)
    const a = w.junctions.get('A')!
    const b = w.junctions.get('B')!
    const rest = w.layout.pathLength + a.radius + b.radius
    expect(dist(a.pos, b.pos)).toBeGreaterThan(rest * 0.8)
    expect(dist(a.pos, b.pos)).toBeLessThan(rest * 1.5)
  })

  it('pushes unconnected junctions apart', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(0, 'w2', 'B')])
    w.processDue()
    w.junctions.get('A')!.pos = { x: 0, y: 0 }
    w.junctions.get('B')!.pos = { x: 5, y: 0 }
    settle(w, 1200)
    expect(dist(w.junctions.get('A')!.pos, w.junctions.get('B')!.pos)).toBeGreaterThan(100)
  })

  it('gathers walkers inside their own slice of the junction', () => {
    const w = makeWorld()
    const updates = []
    for (let i = 0; i < 12; i++) updates.push(u(0, `w${i}`, 'A', i % 3 === 0 ? 'b' : 'a'))
    w.enqueue(updates)
    w.processDue()
    for (const walker of w.walkers.values()) walker.pos = { x: 300, y: -200 }
    settle(w, 900)
    const j = w.junctions.get('A')!
    for (const walker of w.walkers.values()) {
      const slice = j.slices.find((s) => s.type === walker.type)!
      expect(sectorContains({ ...slice, radius: slice.radius + 0.5 }, walker.pos)).toBe(true)
    }
  })

  it('never lets junctions (including their labels) overlap, even when springs pull them together', () => {
    const w = makeWorld({ layout: { pathLength: 0 } })
    w.enqueue([u(0, 'w1', 'A'), u(1, 'w1', 'B'), u(2, 'w1', 'A')])
    w.simTime = 2
    w.processDue()
    const a = w.junctions.get('A')!
    const b = w.junctions.get('B')!
    a.labelWidth = b.labelWidth = 90
    a.pos = { x: 0, y: 0 }
    b.pos = { x: 1, y: 1 }
    settle(w, 600)
    // Labels are 90 wide, so side-by-side centres need >= 90 apart; stacked need circle+label height.
    const apartX = Math.abs(a.pos.x - b.pos.x) >= 90
    const apartY = Math.abs(a.pos.y - b.pos.y) >= a.radius + b.radius + 24
    expect(apartX || apartY).toBe(true)
  })

  it('keeps pinned junctions still', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A'), u(1, 'w1', 'B')])
    w.simTime = 1
    w.processDue()
    const a = w.junctions.get('A')!
    a.pinned = true
    const before = { ...a.pos }
    settle(w, 100)
    expect(a.pos).toEqual(before)
  })

  it('drags a junction together with the walkers sitting in it', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A')])
    w.processDue()
    settle(w, 200)
    const j = w.junctions.get('A')!
    const walker = w.walkers.get('w1')!
    const offset = { x: walker.pos.x - j.pos.x, y: walker.pos.y - j.pos.y }
    w.dragNode(j, { x: j.pos.x + 200, y: j.pos.y + 50 })
    expect(walker.pos.x - j.pos.x).toBeCloseTo(offset.x)
    expect(walker.pos.y - j.pos.y).toBeCloseTo(offset.y)
  })

  it('hit-tests walkers before the junction underneath them', () => {
    const w = makeWorld()
    w.enqueue([u(0, 'w1', 'A')])
    w.processDue()
    settle(w, 200)
    const walker = w.walkers.get('w1')!
    expect(w.hitTest(walker.pos)).toBe(walker)
    const j = w.junctions.get('A')!
    expect(w.hitTest({ x: j.pos.x + j.radius - 0.5, y: j.pos.y })).toBe(j)
    expect(w.hitTest({ x: j.pos.x + 500, y: j.pos.y })).toBeNull()
  })
})

describe('PipelineFeed', () => {
  it('is reproducible for a given seed and only generates arrivals up to the horizon', () => {
    const a = new PipelineFeed(42, 0).fill(20_000)
    const b = new PipelineFeed(42, 0).fill(20_000)
    expect(a).toEqual(b)
    expect(a.length).toBeGreaterThan(0)
    const firstVisits = new Map<string, number>()
    for (const x of a) if (!firstVisits.has(x.walker)) firstVisits.set(x.walker, x.time)
    for (const t of firstVisits.values()) expect(t).toBeLessThanOrEqual(20_000)
  })

  it('runs a long simulation without errors and with walkers exiting', () => {
    const random = seededRandom(7)
    const feed = new PipelineFeed(7, 0)
    const world = new World(
      {
        walkerTypes: types,
        exits: [{ junction: /^(Closed|Released|Merged)$/, afterMs: 5000 }],
        random,
      },
      0,
    )
    world.speed = 10
    for (let i = 0; i < 60 * 60; i++) {
      world.enqueue(feed.fill(world.simTime + 30_000))
      world.advance(1000 / 60)
    }
    const s = world.stats()
    expect(s.completed).toBeGreaterThan(50)
    for (const j of world.junctions.values()) {
      expect(Number.isFinite(j.pos.x) && Number.isFinite(j.pos.y)).toBe(true)
    }
  })
})

describe('recent-traffic paths (pathMemoryMs)', () => {
  it('fades a path out after it stops being used, while keeping the all-time count', () => {
    const world = new World({ walkerTypes: [{ key: 't', label: 'T', color: '#000', shape: 'circle' }], pathMemoryMs: 1000 })
    world.apply({ time: 0, walker: 'w', walkerType: 't', junction: 'A' })
    world.apply({ time: 0, walker: 'w', walkerType: 't', junction: 'B' })
    world.apply({ time: 0, walker: 'w', walkerType: 't', junction: 'A' })
    world.apply({ time: 0, walker: 'w', walkerType: 't', junction: 'B' })
    const path = world.paths.get('A→B')!
    expect(path.count).toBe(2)
    expect(world.recentTraffic(path, 0)).toBeCloseTo(2)
    expect(world.recentTraffic(path, 1000)).toBeCloseTo(2 / Math.E)
    expect(world.recentTraffic(path, 10_000)).toBeLessThan(0.001)
  })

  it('keeps all-time traffic when no memory is set', () => {
    const world = new World({ walkerTypes: [] })
    const a = world.getOrCreateJunction('A', null)
    const b = world.getOrCreateJunction('B', a)
    expect(world.recentTraffic(world.getOrCreatePath(a, b))).toBe(0)
  })
})
