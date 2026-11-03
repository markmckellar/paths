import { describe, expect, it } from 'vitest'
import { dist } from '../engine/geometry'
import { World } from '../engine/world'
import { Simulation } from '../simulation'
import { DAY_MS, TimeUseFeed, peopleOf, pinActivityCircle, timeUseScenarios, type TimeUseData } from './timeuse'
import atus2019 from './timeuse/atus-2019.json'

const data = atus2019 as TimeUseData

describe('time-use data (ATUS 2019)', () => {
  it('has every data set the picker offers, each with people', () => {
    expect(data.datasets.map((d) => d.key)).toEqual(['weekday', 'weekend', 'day', 'night', 'student', 'home', 'retired'])
    for (const ds of data.datasets) {
      expect(ds.people.length).toBeGreaterThan(50)
      expect(ds.people.length).toBeLessThanOrEqual(ds.respondents)
    }
  })

  it('describes each person as a well-formed day starting at 4am', () => {
    for (const ds of data.datasets) {
      for (const person of peopleOf(data, ds.key)) {
        expect(person.day[0][0]).toBe(0)
        for (let i = 0; i < person.day.length; i++) {
          const [minute, activity] = person.day[i]
          expect(minute).toBeGreaterThanOrEqual(0)
          expect(minute).toBeLessThan(24 * 60)
          expect(data.activities.some((a) => a.label === activity)).toBe(true)
          if (i > 0) {
            expect(minute).toBeGreaterThan(person.day[i - 1][0])
            expect(activity).not.toBe(person.day[i - 1][1]) // repeats are merged
          }
        }
      }
    }
  })

  it('keeps single-group data sets to that group', () => {
    for (const key of ['day', 'night', 'student', 'home', 'retired']) {
      expect(new Set(peopleOf(data, key).map((p) => p.group))).toEqual(new Set([key]))
    }
  })

  it('has night-shift workers mostly at work in the small hours, and day-shift workers mostly asleep', () => {
    const at = (key: string, minuteOfDiary: number) =>
      peopleOf(data, key).map((p) => [...p.day].reverse().find(([m]) => m <= minuteOfDiary)![1])
    const share = (labels: string[], label: string) => labels.filter((l) => l === label).length / labels.length
    const twoAm = 22 * 60 // 2am is 22 hours after the 4am start
    expect(share(at('night', twoAm), 'Work')).toBeGreaterThan(0.4)
    expect(share(at('day', twoAm), 'Sleeping')).toBeGreaterThan(0.8)
  })
})

describe('TimeUseFeed', () => {
  const people = [
    { name: 'A', group: 'day', day: [[0, 'Sleeping'], [180, 'Work'], [600, 'Sleeping']] as [number, string][] },
    { name: 'B', group: 'home', day: [[0, 'Sleeping'], [300, 'Breakfast']] as [number, string][] },
  ]
  const start = 1_000_000

  it('generates a whole day as soon as it starts, at the right times', () => {
    const feed = new TimeUseFeed(people, start)
    const first = feed.fill(start)
    expect(first).toHaveLength(5)
    expect(first.find((u) => u.walker === 'A' && u.junction === 'Work')!.time).toBe(start + 180 * 60_000)
    expect(feed.fill(start + DAY_MS - 1)).toEqual([]) // nothing new until the next day begins
  })

  it('repeats the day', () => {
    const feed = new TimeUseFeed(people, start)
    feed.fill(start)
    const second = feed.fill(start + DAY_MS)
    expect(second).toHaveLength(5)
    expect(Math.min(...second.map((u) => u.time))).toBe(start + DAY_MS)
  })
})

describe('time-use scenarios', () => {
  it('pins the activities in a circle with travel in the middle', () => {
    const world = new World({ walkerTypes: [] })
    pinActivityCircle(world, data, 200)
    expect(world.junctions.size).toBe(data.activities.length)
    for (const j of world.junctions.values()) expect(j.pinned).toBe(true)
    const travel = world.junctions.get('Commuting & travel')!
    expect(travel.pos).toEqual({ x: 0, y: 0 })
    const sleep = world.junctions.get('Sleeping')!
    expect(sleep.pos.x).toBeCloseTo(0)
    expect(sleep.pos.y).toBeLessThan(0) // 12 o'clock
  })

  it('runs a day without errors and moves people around', () => {
    const scenario = timeUseScenarios(data).find((s) => s.key === 'life-weekday')!
    const world = new World(scenario.worldOptions(Math.random), scenario.startTime())
    scenario.setup?.(world)
    const feed = scenario.createFeed(1, world.simTime)
    world.enqueue(feed.fill(world.simTime))
    world.speed = 60 * 60 * 1000 // an hour of the day per real second
    for (let i = 0; i < 24 * 10; i++) world.advance(100)
    expect(world.walkers.size).toBe(400)
    const visits = [...world.junctions.values()].reduce((n, j) => n + j.visits, 0)
    expect(visits).toBeGreaterThan(400 * 5)
  })
})

describe('starting settled', () => {
  it('has everyone inside their first activity before the clock moves', () => {
    const scenario = timeUseScenarios(data).find((s) => s.key === 'life-weekday')!
    const t0 = performance.now()
    const sim = new Simulation(scenario, 1)
    const ms = performance.now() - t0
    expect(sim.world.simTime).toBe(scenario.startTime())
    expect(sim.world.walkers.size).toBe(400)
    for (const w of sim.world.walkers.values()) {
      expect(w.junction).not.toBeNull()
      expect(dist(w.pos, w.junction!.pos)).toBeLessThanOrEqual(w.junction!.radius)
    }
    expect(ms).toBeLessThan(1500) // settling happens on load and switch, so keep it quick
  })
})
