export interface Vec {
  x: number
  y: number
}

export const TAU = Math.PI * 2

export function vec(x = 0, y = 0): Vec {
  return { x, y }
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Linear interpolation from `a` toward `b` by fraction `t` (0 = a, 1 = b). */
export function lerp(a: Vec, b: Vec, t: number): Vec {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function mean(points: readonly Vec[]): Vec {
  let x = 0
  let y = 0
  for (const p of points) {
    x += p.x
    y += p.y
  }
  return { x: x / points.length, y: y / points.length }
}

/**
 * The point `distance` away from `anchor`, on the ray from `anchor` toward `from`.
 * This is the "relaxed" position a spring anchored at `anchor` wants `from` to sit at.
 * When the points coincide, `jitter` picks a direction so nodes can separate.
 */
export function pointAtDistance(anchor: Vec, from: Vec, distance: number, jitter: () => number): Vec {
  let dx = from.x - anchor.x
  let dy = from.y - anchor.y
  let len = Math.hypot(dx, dy)
  if (len < 1e-9) {
    const angle = jitter() * TAU
    dx = Math.cos(angle)
    dy = Math.sin(angle)
    len = 1
  }
  return { x: anchor.x + (dx / len) * distance, y: anchor.y + (dy / len) * distance }
}

/** Normalise an angle into [0, 2π). */
export function normAngle(a: number): number {
  const r = a % TAU
  return r < 0 ? r + TAU : r
}

export interface Sector {
  center: Vec
  radius: number
  /** Radians, measured clockwise in canvas space (y down). */
  start: number
  end: number
}

export function sectorSpan(s: Sector): number {
  return s.end - s.start
}

export function sectorArea(s: Sector): number {
  return (sectorSpan(s) * s.radius * s.radius) / 2
}

export function sectorContains(s: Sector, p: Vec): boolean {
  const dx = p.x - s.center.x
  const dy = p.y - s.center.y
  if (dx * dx + dy * dy > s.radius * s.radius) return false
  const span = sectorSpan(s)
  if (span >= TAU - 1e-9) return true
  return normAngle(Math.atan2(dy, dx) - s.start) <= span
}

/** Centre of mass of a circular sector. A full circle's centroid is its centre. */
export function sectorCentroid(s: Sector): Vec {
  const span = sectorSpan(s)
  if (span <= 1e-9 || span >= TAU - 1e-9) return { ...s.center }
  const d = (4 * s.radius * Math.sin(span / 2)) / (3 * span)
  const mid = s.start + span / 2
  return { x: s.center.x + Math.cos(mid) * d, y: s.center.y + Math.sin(mid) * d }
}

/** Deterministic PRNG (mulberry32) so demos and tests are reproducible. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
