import type { Camera, Viewport } from './camera'
import { TAU, type Vec } from './geometry'
import type { WalkerShape } from './types'
import { type Junction, LABEL_GAP, LABEL_HEIGHT, type Path, type Walker, type World, type WorldNode } from './world'

export interface Theme {
  canvas: string
  junctionFill: string
  junctionStroke: string
  path: string
  accent: string
  labelBg: string
  labelBorder: string
  labelText: string
  labelMuted: string
  walkerStroke: string
  font: string
}

export interface RenderState {
  selected: WorldNode | null
  hovered: WorldNode | null
  /** Paths to emphasise, e.g. the selected walker's route. */
  highlightPaths: Set<Path>
}

const LABEL_FONT_PX = 12
const LABEL_PAD_X = 7

/** Draw the whole world. All geometry is in world units; the camera transform does the rest. */
export function render(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  view: Viewport,
  dpr: number,
  theme: Theme,
  state: RenderState,
): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = theme.canvas
  ctx.fillRect(0, 0, view.width, view.height)

  const z = cam.zoom
  ctx.setTransform(
    dpr * z,
    0,
    0,
    dpr * z,
    dpr * (view.width / 2 - cam.x * z),
    dpr * (view.height / 2 - cam.y * z),
  )

  // Line widths that should look the same on screen at any zoom.
  const px = 1 / z

  for (const path of world.paths.values()) drawPath(ctx, world, path, theme, state.highlightPaths.has(path), px)
  for (const j of world.junctions.values()) drawJunction(ctx, world, j, theme, state, px)
  for (const w of world.walkers.values()) drawWalker(ctx, world, w, theme, state, px)

  // Labels last so walkers in transit never cover them. Skip when too small to read.
  ctx.font = `600 ${LABEL_FONT_PX}px ${theme.font}`
  const showLabels = LABEL_FONT_PX * z >= 6
  for (const j of world.junctions.values()) {
    measureLabel(ctx, j)
    if (showLabels) drawLabel(ctx, j, theme, state.selected === j)
  }
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  world: World,
  path: Path,
  theme: Theme,
  highlighted: boolean,
  px: number,
): void {
  const a = path.from
  const b = path.to
  const dx = b.pos.x - a.pos.x
  const dy = b.pos.y - a.pos.y
  const len = Math.hypot(dx, dy)
  if (len < a.radius + b.radius + 2) return

  const width = 1.4 + Math.log2(1 + path.count) * 0.9
  const arrow = 5 + width * 1.6

  // Two-way traffic: bow each direction to its own side so both arrows are visible.
  const curved = world.hasPath(b, a)
  const nx = -dy / len
  const ny = dx / len
  const bow = curved ? Math.min(28, len * 0.18) : 0
  const ctrl: Vec = { x: (a.pos.x + b.pos.x) / 2 + nx * bow, y: (a.pos.y + b.pos.y) / 2 + ny * bow }

  const start = towards(a.pos, ctrl, a.radius + 1)
  const tip = towards(b.pos, ctrl, b.radius + 2)
  const dir = unit(tip.x - ctrl.x, tip.y - ctrl.y)
  const shaftEnd = { x: tip.x - dir.x * arrow * 0.8, y: tip.y - dir.y * arrow * 0.8 }

  ctx.strokeStyle = highlighted ? theme.accent : theme.path
  ctx.fillStyle = ctx.strokeStyle
  ctx.lineWidth = highlighted ? width + 2 * px : width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  if (curved) ctx.quadraticCurveTo(ctrl.x, ctrl.y, shaftEnd.x, shaftEnd.y)
  else ctx.lineTo(shaftEnd.x, shaftEnd.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(tip.x - dir.x * arrow - dir.y * arrow * 0.55, tip.y - dir.y * arrow + dir.x * arrow * 0.55)
  ctx.lineTo(tip.x - dir.x * arrow + dir.y * arrow * 0.55, tip.y - dir.y * arrow - dir.x * arrow * 0.55)
  ctx.closePath()
  ctx.fill()
}

function drawJunction(
  ctx: CanvasRenderingContext2D,
  world: World,
  j: Junction,
  theme: Theme,
  state: RenderState,
  px: number,
): void {
  const { x, y } = j.pos
  ctx.beginPath()
  ctx.arc(x, y, j.radius, 0, TAU)
  ctx.fillStyle = theme.junctionFill
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = theme.junctionStroke
  ctx.stroke()

  // One tinted slice per walker type currently here.
  for (const s of j.slices) {
    const color = world.walkerTypes.get(s.type)?.color ?? theme.path
    ctx.beginPath()
    if (j.slices.length > 1) ctx.moveTo(x, y)
    ctx.arc(x, y, s.radius + 1, s.start, s.end)
    ctx.closePath()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 0.45
    ctx.lineWidth = px
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (state.selected === j || state.hovered === j) {
    ctx.beginPath()
    ctx.arc(x, y, j.radius + 4 * px + 1, 0, TAU)
    ctx.lineWidth = (state.selected === j ? 2.5 : 1.5) * px
    ctx.strokeStyle = theme.accent
    ctx.globalAlpha = state.selected === j ? 1 : 0.6
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (j.pinned) {
    const a = -Math.PI / 4
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * j.radius, y + Math.sin(a) * j.radius, Math.max(3, 4 * px), 0, TAU)
    ctx.fillStyle = theme.accent
    ctx.fill()
    ctx.lineWidth = 1.5 * px
    ctx.strokeStyle = theme.canvas
    ctx.stroke()
  }
}

function drawWalker(
  ctx: CanvasRenderingContext2D,
  world: World,
  w: Walker,
  theme: Theme,
  state: RenderState,
  px: number,
): void {
  const def = world.walkerTypes.get(w.type)
  const r = world.layout.walkerRadius
  ctx.globalAlpha = w.exitProgress === null ? 1 : 1 - w.exitProgress
  traceShape(ctx, def?.shape ?? 'circle', w.pos.x, w.pos.y, r)
  ctx.fillStyle = def?.color ?? theme.path
  ctx.fill()
  ctx.lineWidth = 0.8
  ctx.strokeStyle = theme.walkerStroke
  ctx.stroke()

  if (state.selected === w || state.hovered === w) {
    ctx.beginPath()
    ctx.arc(w.pos.x, w.pos.y, r + 3.5 * px + 1, 0, TAU)
    ctx.lineWidth = (state.selected === w ? 2.5 : 1.5) * px
    ctx.strokeStyle = theme.accent
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function traceShape(ctx: CanvasRenderingContext2D, shape: WalkerShape, x: number, y: number, r: number): void {
  ctx.beginPath()
  switch (shape) {
    case 'circle':
      ctx.arc(x, y, r, 0, TAU)
      break
    case 'square': {
      const s = r * 0.88
      ctx.rect(x - s, y - s, s * 2, s * 2)
      break
    }
    case 'triangle': {
      const s = r * 1.2
      ctx.moveTo(x, y - s)
      ctx.lineTo(x + s * 0.94, y + s * 0.62)
      ctx.lineTo(x - s * 0.94, y + s * 0.62)
      ctx.closePath()
      break
    }
    case 'diamond': {
      const s = r * 1.2
      ctx.moveTo(x, y - s)
      ctx.lineTo(x + s, y)
      ctx.lineTo(x, y + s)
      ctx.lineTo(x - s, y)
      ctx.closePath()
      break
    }
  }
}

function labelCount(j: Junction): string {
  const n = j.count
  return n > 0 ? `  ${n}` : ''
}

function measureLabel(ctx: CanvasRenderingContext2D, j: Junction): void {
  j.labelWidth = ctx.measureText(j.name + labelCount(j)).width + LABEL_PAD_X * 2
}

function drawLabel(ctx: CanvasRenderingContext2D, j: Junction, theme: Theme, selected: boolean): void {
  const w = j.labelWidth
  const x = j.pos.x - w / 2
  const y = j.pos.y + j.radius + LABEL_GAP
  ctx.beginPath()
  ctx.roundRect(x, y, w, LABEL_HEIGHT, LABEL_HEIGHT / 2)
  ctx.fillStyle = theme.labelBg
  ctx.fill()
  ctx.lineWidth = selected ? 1.5 : 1
  ctx.strokeStyle = selected ? theme.accent : theme.labelBorder
  ctx.stroke()

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const ty = y + LABEL_HEIGHT / 2 + 0.5
  ctx.fillStyle = theme.labelText
  ctx.fillText(j.name, x + LABEL_PAD_X, ty)
  const count = labelCount(j)
  if (count) {
    ctx.fillStyle = theme.labelMuted
    ctx.fillText(count, x + LABEL_PAD_X + ctx.measureText(j.name).width, ty)
  }
}


function unit(x: number, y: number): Vec {
  const l = Math.hypot(x, y) || 1
  return { x: x / l, y: y / l }
}

function towards(from: Vec, to: Vec, distance: number): Vec {
  const u = unit(to.x - from.x, to.y - from.y)
  return { x: from.x + u.x * distance, y: from.y + u.y * distance }
}
