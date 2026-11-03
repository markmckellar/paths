import { seededRandom } from '../engine/geometry'
import type { ExitRule, WalkerTypeDef, WorldOptions, WorldUpdate } from '../engine/types'
import { formatClock } from '../format'
import type { Scenario } from '../scenario'

/**
 * Demo: work items flowing through a delivery pipeline.
 *
 * Each type follows its own route through shared states, and some steps send items
 * back for rework, so the graph grows loops and two-way paths.
 */

export interface Step {
  state: string
  /** Optional rework: with probability `chance`, go back to `to` instead of moving on. */
  rework?: { to: string; chance: number }
  /**
   * Optional side trip: with probability `chance`, visit `state` (e.g. "On Hold") and then
   * come back and repeat this step.
   */
  detour?: { state: string; chance: number }
  /** How long this step takes compared with a normal one (default 1). */
  duration?: number
}

export interface Flow {
  type: WalkerTypeDef
  /** Relative arrival rate. */
  weight: number
  steps: Step[]
}

export const FLOWS: Flow[] = [
  {
    type: { key: 'bug', label: 'Bug', color: '#e5484d', shape: 'circle' },
    weight: 3,
    steps: [
      { state: 'Reported' },
      { state: 'Triage' },
      { state: 'In Progress' },
      { state: 'Code Review', rework: { to: 'In Progress', chance: 0.2 } },
      { state: 'QA', rework: { to: 'In Progress', chance: 0.15 } },
      { state: 'Verified' },
      { state: 'Closed' },
    ],
  },
  {
    type: { key: 'feature', label: 'Feature', color: '#3e8ef7', shape: 'square' },
    weight: 2,
    steps: [
      { state: 'Proposed' },
      { state: 'Design', rework: { to: 'Proposed', chance: 0.1 } },
      { state: 'In Progress' },
      { state: 'Code Review', rework: { to: 'In Progress', chance: 0.25 } },
      { state: 'QA', rework: { to: 'In Progress', chance: 0.1 } },
      { state: 'Docs' },
      { state: 'Released' },
    ],
  },
  {
    type: { key: 'chore', label: 'Chore', color: '#30a46c', shape: 'triangle' },
    weight: 2,
    steps: [
      { state: 'Backlog' },
      { state: 'In Progress' },
      { state: 'Code Review', rework: { to: 'In Progress', chance: 0.1 } },
      { state: 'Merged' },
    ],
  },
]

/** Items linger at their final state for a while, then leave. */
export function finalStateExits(flows: Flow[], afterMs = 12_000): ExitRule[] {
  const finals = [...new Set(flows.map((f) => f.steps[f.steps.length - 1].state))]
  return finals.map((junction) => ({ junction, afterMs }))
}

export function demoWorldOptions(random: () => number): WorldOptions {
  return { walkerTypes: FLOWS.map((f) => f.type), exits: finalStateExits(FLOWS), random }
}

/** Mean gap between new items, in simulated ms. */
const MEAN_ARRIVAL_MS = 900
const MIN_STEP_MS = 1_500
const MAX_STEP_MS = 7_000
/** Stop looping on rework after this many visits to the same state. */
const MAX_REWORK = 2

/** Optional timing for a feed. */
export interface FeedTiming {
  /** Mean gap between new items, before scaling by `unitMs` (default 900). */
  meanArrival?: number
  /**
   * Multiplies every time the feed makes. The default 1 gives steps of a few seconds; 1800 turns
   * them into hours, for a scenario whose clock runs that much faster.
   */
  unitMs?: number
}

/**
 * Generates an endless, reproducible stream of updates. Call `fill(until)` to make sure
 * every item arriving before `until` has had its whole journey generated.
 */
export class PipelineFeed {
  private readonly random: () => number
  private nextArrival: number
  private counters = new Map<string, number>()
  private readonly totalWeight: number
  private readonly unitMs: number
  private readonly meanArrivalMs: number

  constructor(
    seed: number,
    startTime: number,
    private readonly flows: Flow[] = FLOWS,
    timing: FeedTiming = {},
  ) {
    this.unitMs = timing.unitMs ?? 1
    this.meanArrivalMs = (timing.meanArrival ?? MEAN_ARRIVAL_MS) * this.unitMs
    this.random = seededRandom(seed)
    this.nextArrival = startTime
    this.totalWeight = flows.reduce((s, f) => s + f.weight, 0)
  }

  fill(until: number): WorldUpdate[] {
    const out: WorldUpdate[] = []
    while (this.nextArrival <= until) {
      out.push(...this.journey(this.pickFlow(), this.nextArrival))
      // Exponential gaps make arrivals bursty, like real work.
      this.nextArrival += -Math.log(1 - this.random()) * this.meanArrivalMs
    }
    return out
  }

  private pickFlow(): Flow {
    let r = this.random() * this.totalWeight
    for (const f of this.flows) {
      r -= f.weight
      if (r <= 0) return f
    }
    return this.flows[this.flows.length - 1]
  }

  private journey(flow: Flow, start: number): WorldUpdate[] {
    const n = (this.counters.get(flow.type.key) ?? 0) + 1
    this.counters.set(flow.type.key, n)
    const walker = `${flow.type.label} #${n}`
    const updates: WorldUpdate[] = []
    const visits = new Map<string, number>()
    let time = start
    let i = 0
    // Hard cap guards against a misconfigured flow looping forever.
    while (i < flow.steps.length && updates.length < 50) {
      const step = flow.steps[i]
      updates.push({ time, walker, walkerType: flow.type.key, junction: step.state })
      const seen = (visits.get(step.state) ?? 0) + 1
      visits.set(step.state, seen)
      time += this.stepMs(step.duration)

      const detour = step.detour
      if (detour && seen <= MAX_REWORK && this.random() < detour.chance) {
        updates.push({ time, walker, walkerType: flow.type.key, junction: detour.state })
        time += this.stepMs()
        continue // back to this step
      }

      const rework = step.rework
      if (rework && seen <= MAX_REWORK && this.random() < rework.chance) {
        const back = flow.steps.findIndex((s) => s.state === rework.to)
        if (back >= 0) {
          i = back
          continue
        }
      }
      i++
    }
    return updates
  }

  private stepMs(duration = 1): number {
    return (MIN_STEP_MS + this.random() * (MAX_STEP_MS - MIN_STEP_MS)) * duration * this.unitMs
  }
}

/** The original demo: bugs, features and chores moving through a delivery pipeline. */
export const pipelineScenario: Scenario = {
  key: 'pipeline',
  group: 'Work items',
  label: 'Delivery pipeline',
  subtitle: 'Work items flowing through a delivery pipeline',
  words: { state: 'State', states: 'States', active: 'In flight', journey: 'Journey' },
  timeScale: 1,
  defaultSpeed: 2,
  showDone: true,
  restartHint: 'Restart with new data',
  startTime() {
    // Start the clock at a fixed time of day so the displayed clock reads sensibly.
    const start = new Date()
    start.setHours(9, 0, 0, 0)
    return start.getTime()
  },
  worldOptions: demoWorldOptions,
  createFeed: (seed, startTime) => new PipelineFeed(seed, startTime),
  formatClock,
}
