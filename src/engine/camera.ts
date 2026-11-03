import type { Vec } from './geometry'

/** `x`,`y` is the world point at the centre of the viewport. */
export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface Viewport {
  width: number
  height: number
}

export const MIN_ZOOM = 0.15
export const MAX_ZOOM = 4

export function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
}

export function worldToScreen(cam: Camera, view: Viewport, p: Vec): Vec {
  return { x: (p.x - cam.x) * cam.zoom + view.width / 2, y: (p.y - cam.y) * cam.zoom + view.height / 2 }
}

export function screenToWorld(cam: Camera, view: Viewport, p: Vec): Vec {
  return { x: (p.x - view.width / 2) / cam.zoom + cam.x, y: (p.y - view.height / 2) / cam.zoom + cam.y }
}

/** Zoom by `factor` keeping the world point under `screenPoint` fixed. */
export function zoomAt(cam: Camera, view: Viewport, screenPoint: Vec, factor: number): Camera {
  const before = screenToWorld(cam, view, screenPoint)
  const zoom = clampZoom(cam.zoom * factor)
  const next = { ...cam, zoom }
  const after = screenToWorld(next, view, screenPoint)
  return { x: next.x + before.x - after.x, y: next.y + before.y - after.y, zoom }
}

/** Camera that fits `bounds` into the viewport with `padding` screen pixels around it. */
export function fitCamera(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  view: Viewport,
  padding: number,
  maxZoom = 1.4,
): Camera {
  const w = Math.max(1, bounds.maxX - bounds.minX)
  const h = Math.max(1, bounds.maxY - bounds.minY)
  const zoom = clampZoom(
    Math.min((view.width - padding * 2) / w, (view.height - padding * 2) / h, maxZoom),
  )
  return { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2, zoom }
}

/** Ease `cam` toward `target`; zoom eases in log space so it feels even in both directions. */
export function easeCamera(cam: Camera, target: Camera, t: number): Camera {
  const logZ = Math.log(cam.zoom) + (Math.log(target.zoom) - Math.log(cam.zoom)) * t
  return { x: cam.x + (target.x - cam.x) * t, y: cam.y + (target.y - cam.y) * t, zoom: Math.exp(logZ) }
}
