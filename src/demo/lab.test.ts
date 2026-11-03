import { describe, expect, it } from 'vitest'
import { seededRandom } from '../engine/geometry'
import { World } from '../engine/world'
import { LAB_FLOWS, labScenario } from './lab'

describe('lab samples scenario', () => {
  it('is reproducible and every sample starts at Received', () => {
    const a = labScenario.createFeed(3, 0).fill(48 * 3600_000)
    const b = labScenario.createFeed(3, 0).fill(48 * 3600_000)
    expect(a).toEqual(b)
    const first = new Map<string, string>()
    for (const u of a) if (!first.has(u.walker)) first.set(u.walker, u.junction)
    expect(first.size).toBeGreaterThan(50)
    for (const j of first.values()) expect(j).toBe('Received')
  })

  it('takes side trips and returns to the step it left', () => {
    const updates = labScenario.createFeed(11, 0).fill(7 * 24 * 3600_000)
    const byWalker = new Map<string, string[]>()
    for (const u of updates) byWalker.set(u.walker, [...(byWalker.get(u.walker) ?? []), u.junction])
    let holds = 0
    for (const route of byWalker.values()) {
      route.forEach((state, i) => {
        if (state === 'On Hold: Missing Info') {
          holds++
          expect(route[i + 1]).toBe('Accessioning')
        }
        if (state === 'More Tissue Requested') expect(route[i + 1]).toBe('Pathology Review')
      })
      expect(route[route.length - 1]).toBe('Reported')
    }
    expect(holds).toBeGreaterThan(0)
  })

  it('runs a simulated week with samples finishing', () => {
    const random = seededRandom(5)
    const world = new World(labScenario.worldOptions(random), 0)
    const feed = labScenario.createFeed(5, 0)
    world.speed = labScenario.timeScale * 4
    for (let i = 0; i < 60 * 60; i++) {
      world.enqueue(feed.fill(world.simTime + 30 * 3600_000))
      world.advance(1000 / 60)
    }
    expect(world.stats().completed).toBeGreaterThan(20)
    expect(LAB_FLOWS.every((f) => world.junctions.has(f.steps[0].state))).toBe(true)
  })
})
