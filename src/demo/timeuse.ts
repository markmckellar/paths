import { TAU } from '../engine/geometry'
import type { WalkerShape, WalkerTypeDef, WorldOptions, WorldUpdate } from '../engine/types'
import type { World } from '../engine/world'
import type { Feed, Scenario } from '../scenario'
import atus2019 from './timeuse/atus-2019.json'

/**
 * Demo: a day in the life, from the American Time Use Survey (ATUS).
 *
 * Each person in the survey described one day, 4am to 4am, activity by activity.
 * Every sampled person becomes an item that moves round a circle of activities as
 * their day goes on, and the day repeats. Data is built by scripts/build-timeuse.py.
 */

export interface TimeUseData {
  source: { name: string; publisher: string; url: string; license: string; notes: string }
  year: number
  /** Diary days start this many minutes after midnight (4am). */
  dayStartMinutes: number
  activities: { key: string; label: string }[]
  groups: { key: string; label: string }[]
  datasets: {
    key: string
    label: string
    /** How many survey respondents the sample was drawn from. */
    respondents: number
    /** Per person: [group index, age, start minute, activity index, start minute, activity index, ...]. */
    people: number[][]
  }[]
}

export const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

/** Colour and shape per group, so groups stay recognisable across data sets. */
const GROUP_STYLE: Record<string, { color: string; shape: WalkerShape }> = {
  day: { color: '#3e8ef7', shape: 'square' },
  night: { color: '#8e4ec6', shape: 'diamond' },
  student: { color: '#f5a524', shape: 'triangle' },
  home: { color: '#30a46c', shape: 'circle' },
  retired: { color: '#e5484d', shape: 'circle' },
  off: { color: '#12a594', shape: 'square' },
  other: { color: '#8b8d98', shape: 'triangle' },
}

/** The activity in the middle of the circle; everything else goes round the edge. */
const CENTER_ACTIVITY = 'travel'

export interface Person {
  name: string
  group: string
  /** [minute of the diary day it starts, activity label] in order. */
  day: [number, string][]
}

/** The people in one data set, ready to replay. */
export function peopleOf(data: TimeUseData, datasetKey: string): Person[] {
  const ds = data.datasets.find((d) => d.key === datasetKey)
  if (!ds) throw new Error(`No time-use data set "${datasetKey}"`)
  return ds.people.map((row, i) => {
    const [groupIndex, age, ...rest] = row
    const day: [number, string][] = []
    for (let k = 0; k + 1 < rest.length; k += 2) day.push([rest[k], data.activities[rest[k + 1]].label])
    return { name: `Person ${i + 1}, age ${age}`, group: data.groups[groupIndex].key, day }
  })
}

/**
 * Replays everyone's diary day, then the same day again, forever. Day `n` starts at
 * `startTime + n * DAY_MS`, where `startTime` is the diary's 4am start.
 */
export class TimeUseFeed implements Feed {
  private nextDay = 0

  constructor(
    private readonly people: Person[],
    private readonly startTime: number,
  ) {}

  fill(until: number): WorldUpdate[] {
    const out: WorldUpdate[] = []
    // A whole day is generated as soon as it begins; its updates are queued until due.
    while (this.startTime + this.nextDay * DAY_MS <= until) {
      const dayStart = this.startTime + this.nextDay * DAY_MS
      for (const p of this.people) {
        for (const [minute, activity] of p.day) {
          out.push({ time: dayStart + minute * MINUTE_MS, walker: p.name, walkerType: p.group, junction: activity })
        }
      }
      this.nextDay++
    }
    return out
  }
}

/** Pin the activities in a circle, in the order a day goes round it, with travel in the middle. */
export function pinActivityCircle(world: World, data: TimeUseData, people: number): void {
  const ring = data.activities.filter((a) => a.key !== CENTER_ACTIVITY)
  const radius = 320 + people * 0.45
  ring.forEach((a, i) => {
    const angle = -Math.PI / 2 + (i / ring.length) * TAU // clockwise from 12 o'clock
    const j = world.getOrCreateJunction(a.label, null)
    j.pos = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    j.pinned = true
    j.anchored = true
  })
  const center = data.activities.find((a) => a.key === CENTER_ACTIVITY)
  if (center) {
    const j = world.getOrCreateJunction(center.label, null)
    j.pos = { x: 0, y: 0 }
    j.pinned = true
    j.anchored = true
  }
}

function timeOfDay(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function partOfDay(ms: number): string {
  const hour = new Date(ms).getHours()
  if (hour >= 5 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 21) return 'Evening'
  return 'Night'
}

/** One scenario per data set in the file. */
export function timeUseScenarios(data: TimeUseData = atus2019 as TimeUseData): Scenario[] {
  return data.datasets.map((ds) => {
    const people = peopleOf(data, ds.key)
    const present = new Set(people.map((p) => p.group))
    const walkerTypes: WalkerTypeDef[] = data.groups
      .filter((g) => present.has(g.key))
      .map((g) => ({ key: g.key, label: g.label, ...(GROUP_STYLE[g.key] ?? GROUP_STYLE.other) }))
    const options: Omit<WorldOptions, 'random'> = {
      walkerTypes,
      layout: { walkerRadius: 3.6, minJunctionRadius: 14, walkerSeekElasticity: 0.07 },
      // Show where people are moving now; all-time paths would soon join everything to everything.
      pathMemoryMs: 40 * 60 * 1000,
      // Big, fixed-size labels outside the circle, clear of the people inside it.
      labels: { placement: 'outside', screenPx: 14 },
    }
    return {
      key: `life-${ds.key}`,
      group: `A day in the life (US, ${data.year})`,
      label: ds.label,
      subtitle: `A day in the life: ${ds.label.charAt(0).toLowerCase()}${ds.label.slice(1)}`,
      words: { state: 'Activity', states: 'Activities', active: 'People', journey: 'Their day' },
      // At 1×, one real second is ten minutes of the day; a day takes 2.4 minutes.
      timeScale: 600,
      defaultSpeed: 2,
      showDone: false,
      restartHint: 'Start the day again at 4am',
      credit: {
        text: `${people.length} of ${ds.respondents.toLocaleString()} people in the ${data.source.name} (${data.source.publisher})`,
        url: data.source.url,
      },
      startTime() {
        const start = new Date()
        start.setHours(0, data.dayStartMinutes, 0, 0)
        return start.getTime()
      },
      worldOptions: (random) => ({ ...options, random }),
      createFeed: (_seed, startTime) => new TimeUseFeed(people, startTime),
      setup: (world) => pinActivityCircle(world, data, people.length),
      startSettled: true,
      formatClock: timeOfDay,
      formatTimeOfDay: timeOfDay,
      bigClock: true,
      timeCaption: partOfDay,
      cycle: { lengthMs: DAY_MS, scale: ['4am', '10am', '4pm', '10pm', '4am'] },
    }
  })
}
