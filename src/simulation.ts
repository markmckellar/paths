import { seededRandom } from './engine/geometry'
import { World } from './engine/world'
import type { Feed, Scenario } from './scenario'

/** How far ahead of the clock the feed keeps the queue filled, in real ms of playback. */
const FEED_HORIZON_REAL_MS = 30_000
/** Longest frame we simulate; avoids a burst of catch-up after the tab was in the background. */
const MAX_FRAME_MS = 100

/**
 * Owns the world and its data feed for the current scenario. Deliberately not reactive:
 * the world mutates every frame, so the UI samples it instead of tracking it.
 */
export class Simulation {
  world!: World
  seed = 0
  /** Simulated time the current run started at. */
  startedAt = 0
  private feed!: Feed

  constructor(
    public scenario: Scenario,
    seed = Date.now(),
  ) {
    this.restart(seed)
  }

  /** Switch data set. Keeps play/pause and the chosen speed multiplier. */
  setScenario(scenario: Scenario): void {
    const multiplier = this.world.speed / this.scenario.timeScale
    this.scenario = scenario
    this.restart(this.seed + 1)
    this.world.speed = multiplier * scenario.timeScale
  }

  restart(seed = this.seed + 1): void {
    const playing = this.world?.playing ?? true
    const speed = this.world?.speed ?? this.scenario.defaultSpeed * this.scenario.timeScale
    this.seed = seed
    const start = this.scenario.startTime()
    this.startedAt = start
    this.world = new World(this.scenario.worldOptions(seededRandom(seed ^ 0x9e3779b9)), start)
    this.scenario.setup?.(this.world)
    this.world.playing = playing
    this.world.speed = speed
    this.feed = this.scenario.createFeed(seed, start)
    if (this.scenario.startSettled) {
      this.world.enqueue(this.feed.fill(start))
      this.world.processDue()
      this.world.settle()
    }
  }

  /** Speed as the UI shows it: a multiple of the scenario's normal pace. */
  get speedMultiplier(): number {
    return this.world.speed / this.scenario.timeScale
  }

  set speedMultiplier(m: number) {
    this.world.speed = m * this.scenario.timeScale
  }

  tick(realDtMs: number): void {
    const dt = Math.min(Math.max(realDtMs, 0), MAX_FRAME_MS)
    if (this.world.playing) {
      this.world.enqueue(this.feed.fill(this.world.simTime + FEED_HORIZON_REAL_MS * this.scenario.timeScale))
    }
    this.world.advance(dt)
  }
}
