/** One state change: at `time`, walker `walker` (of type `walkerType`) arrives at junction `junction`. */
export interface WorldUpdate {
  time: number
  walker: string
  walkerType: string
  junction: string
}

export type WalkerShape = 'circle' | 'square' | 'triangle' | 'diamond'

export interface WalkerTypeDef {
  key: string
  label: string
  color: string
  shape: WalkerShape
}

/** A walker that has sat at a matching junction for `afterMs` of simulated time leaves the world. */
export interface ExitRule {
  junction: string | RegExp
  afterMs: number
}

/**
 * Re-routing rule matched against the walker's current and next junction names
 * (an empty string stands for "no current junction").
 *
 * - Teleport: the walker jumps to junction `name` with no path drawn, then walks on to its target.
 * - Endpoint mod: the target junction is replaced by `name`.
 */
export interface RerouteRule {
  name: string
  from: string | RegExp
  to: string | RegExp
}

export interface LayoutOptions {
  /** Extra gap junctions try to keep from each other, beyond their radii. */
  junctionSpacing: number
  /** Rest length of a path spring, beyond the radii of the junctions it joins. */
  pathLength: number
  walkerRadius: number
  minJunctionRadius: number
  /** Fraction of the way a junction moves toward its spacing target each step. */
  spacerElasticity: number
  /** Fraction of the way a junction moves toward its path-spring target each step. */
  pathElasticity: number
  /** Fraction of the way a walker moves toward its slice each step while outside it. */
  walkerSeekElasticity: number
  /** Fraction of the way a walker moves when spreading out inside its slice. */
  walkerSpreadElasticity: number
}

/** How junction labels are drawn. */
export interface LabelOptions {
  /** 'below' each junction (default), or 'outside': pointing away from the middle of the graph. */
  placement: 'below' | 'outside'
  /** Draw labels at this fixed on-screen size in px, at any zoom. Unset: they scale with the map. */
  screenPx: number | null
}

export interface WorldOptions {
  walkerTypes: WalkerTypeDef[]
  exits?: ExitRule[]
  teleports?: RerouteRule[]
  endpointMods?: RerouteRule[]
  layout?: Partial<LayoutOptions>
  /**
   * If set, paths show recent traffic instead of all-time traffic: each one fades out over
   * about this much simulated time after it was last used. Good for cyclic data such as a
   * daily routine, where all-time paths soon connect everything to everything.
   */
  pathMemoryMs?: number
  labels?: Partial<LabelOptions>
  /**
   * Move junctions now and then so fewer paths cross (default on). Only clear improvements are
   * made, with growing pauses between moves, so the layout never flips back and forth.
   */
  untangle?: boolean
  /**
   * Spread the layout out to fill `World.room` (the window, set by the UI), keeping clear of
   * `World.keepOut` (default on). Turn it off for fixed layouts.
   */
  fillView?: boolean
  /** Random source used for placement and jitter; inject a seeded one for determinism. */
  random?: () => number
}

export const DEFAULT_LAYOUT: LayoutOptions = {
  junctionSpacing: 150,
  pathLength: 80,
  walkerRadius: 4.5,
  minJunctionRadius: 12,
  spacerElasticity: 0.025,
  pathElasticity: 0.975,
  walkerSeekElasticity: 0.04,
  walkerSpreadElasticity: 0.5,
}
