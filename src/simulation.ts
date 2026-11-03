import { PipelineFeed, demoWorldOptions } from './demo/pipeline'
import { seededRandom } from './engine/geometry'
import { World } from './engine/world'

/** How far ahead of the clock the feed keeps the queue filled, in simulated ms. */
const FEED_HORIZON_MS = 30_000
/** Longest frame we simulate; avoids a burst of catch-up after the tab was in the background. */
const MAX_FRAME_MS = 100

/**
 * Owns the world and its data feed. Deliberately not reactive: the world mutates every
 * frame, so the UI samples it instead of tracking it.
 */
export class Simulation {
  world!: World
  seed = 0
  private feed!: PipelineFeed

  constructor(seed = Date.now()) {
    this.restart(seed)
  }

  restart(seed = this.seed + 1): void {
    const playing = this.world?.playing ?? true
    const speed = this.world?.speed ?? 1
    this.seed = seed
    // Start the clock at a fixed time of day so the displayed clock reads sensibly.
    const start = new Date()
    start.setHours(9, 0, 0, 0)
    this.world = new World(demoWorldOptions(seededRandom(seed ^ 0x9e3779b9)), start.getTime())
    this.world.playing = playing
    this.world.speed = speed
    this.feed = new PipelineFeed(seed, start.getTime())
  }

  tick(realDtMs: number): void {
    const dt = Math.min(Math.max(realDtMs, 0), MAX_FRAME_MS)
    if (this.world.playing) this.world.enqueue(this.feed.fill(this.world.simTime + FEED_HORIZON_MS))
    this.world.advance(dt)
  }
}
