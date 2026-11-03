import type { WorldOptions, WorldUpdate } from './engine/types'
import type { World } from './engine/world'

/** An endless source of updates; `fill(until)` returns everything due up to `until` not returned before. */
export interface Feed {
  fill(until: number): WorldUpdate[]
}

/** Words the UI uses for things in this scenario. */
export interface ScenarioWords {
  /** What a junction is, e.g. "State" or "Activity". */
  state: string
  /** Plural, for the toolbar count. */
  states: string
  /** Toolbar label for items currently in the world, e.g. "In flight" or "People". */
  active: string
  /** Heading over a walker's history, e.g. "Journey" or "Their day". */
  journey: string
}

/** Where the data came from, shown under the legend. */
export interface Credit {
  text: string
  url: string
}

/**
 * One data set the demo can show: where its updates come from, how fast its clock runs,
 * and how the UI should describe it.
 */
export interface Scenario {
  key: string
  /** Heading the scenario is listed under in the picker. */
  group: string
  /** Name in the picker. */
  label: string
  /** Line under the app title. */
  subtitle: string
  words: ScenarioWords
  /** Simulated ms per real ms at 1× speed. */
  timeScale: number
  /** Speed (multiplier of `timeScale`) to start at. */
  defaultSpeed: number
  /** Whether items finish and leave, so a "Done" count makes sense. */
  showDone: boolean
  /** What the Restart button does, for its tooltip. */
  restartHint: string
  credit?: Credit
  /** Simulated time the world starts at. */
  startTime(): number
  worldOptions(random: () => number): WorldOptions
  createFeed(seed: number, startTime: number): Feed
  /** Called on a fresh world before it runs, e.g. to pin junctions in place. */
  setup?(world: World): void
  /**
   * Start with everything due at the start time already applied and the layout settled, so
   * items begin where they are instead of spilling out of their first state.
   */
  startSettled?: boolean
  /** Toolbar clock (also used by the big clock). */
  formatClock(ms: number): string
  /** Show the big on-graph clock by default (users can still toggle it). */
  bigClock?: boolean
  /** Caption under the big clock, e.g. "Morning". */
  timeCaption?(ms: number): string
  /**
   * For data that repeats on a cycle (such as a day): the cycle length, shown as progress under
   * the big clock, with these labels spread evenly beneath it.
   */
  cycle?: { lengthMs: number; scale: string[] }
  /** If set, a walker's history shows these times instead of time since it appeared. */
  formatTimeOfDay?(ms: number): string
}
