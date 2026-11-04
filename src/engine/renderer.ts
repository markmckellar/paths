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
  drawWalkers(ctx, world, cam, view, theme, state, px)

  // Labels last so walkers in transit never cover them. Map-scaled labels are skipped when
  // too small to read; fixed-size labels (labels.screenPx) are always shown.
  const { placement } = world.labels
  const screenPx = fixedLabelPx(world, view)
  const fontPx = screenPx ? screenPx / z : LABEL_FONT_PX
  const scale = fontPx / LABEL_FONT_PX
  ctx.font = `${screenPx ? 700 : 600} ${fontPx}px ${theme.font}`
  const showLabels = screenPx !== null || LABEL_FONT_PX * z >= 6
  const middle = placement === 'outside' ? graphMiddle(world) : null
  for (const j of world.junctions.values()) {
    measureLabel(ctx, j, scale)
    j.labelRect = placement === 'outside' ? labelRect(j, scale, middle!) : null
  }
  if (placement === 'outside') separateLabels([...world.junctions.values()], middle!, fontPx)
  if (showLabels) for (const j of world.junctions.values()) drawLabel(ctx, j, theme, state.selected === j, scale)
}

/** Nudge outside labels that overlap a neighbour further outward until they're clear. */
function separateLabels(list: Junction[], middle: Vec, fontPx: number): void {
  const overlaps = (a: Junction, b: Junction) => {
    const p = a.labelRect!
    const q = b.labelRect!
    return p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h
  }
  const step = fontPx * 0.35
  for (let pass = 0; pass < 40; pass++) {
    let moved = false
    for (let i = 0; i < list.length; i++) {
      for (let k = i + 1; k < list.length; k++) {
        const a = list[i]
        const b = list[k]
        if (!a.labelRect || !b.labelRect || !overlaps(a, b)) continue
        // Move whichever label sits further from the middle; it has room to go further out.
        const far = Math.hypot(a.pos.x - middle.x, a.pos.y - middle.y) >= Math.hypot(b.pos.x - middle.x, b.pos.y - middle.y) ? a : b
        const d = unit(far.pos.x - middle.x, far.pos.y - middle.y)
        far.labelRect!.x += d.x * step
        far.labelRect!.y += d.y * step
        moved = true
      }
    }
    if (!moved) break
  }
}

/** On-screen size of fixed-size labels, a little smaller on narrow screens; null if labels scale. */
export function fixedLabelPx(world: World, view: Viewport): number | null {
  const px = world.labels.screenPx
  return px ? Math.max(9, Math.min(px, view.width / 40)) : null
}

/** Screen px fixed-size labels need beside and above/below the graph when fitting the view. */
export function labelMargin(world: World, zoom: number): { x: number; y: number } {
  let width = 0
  let height = 0
  for (const j of world.junctions.values()) {
    if (j.labelRect) {
      width = Math.max(width, j.labelRect.w)
      height = Math.max(height, j.labelRect.h)
    }
  }
  return { x: width * zoom + LABEL_GAP, y: height * zoom + LABEL_GAP }
}

/** Centre of the graph's bounding box, which outside labels point away from. */
function graphMiddle(world: World): Vec {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const j of world.junctions.values()) {
    minX = Math.min(minX, j.pos.x)
    maxX = Math.max(maxX, j.pos.x)
    minY = Math.min(minY, j.pos.y)
    maxY = Math.max(maxY, j.pos.y)
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

/**
 * Box for a label that sits just outside its junction, on the side facing away from the
 * middle of the graph. A junction at the middle itself gets its label below.
 */
function labelRect(j: Junction, scale: number, middle: Vec): { x: number; y: number; w: number; h: number } {
  const w = j.labelWidth
  const h = LABEL_HEIGHT * scale
  const gap = LABEL_GAP * scale
  const dx = j.pos.x - middle.x
  const dy = j.pos.y - middle.y
  const d = Math.hypot(dx, dy)
  const dir = d < 1 ? { x: 0, y: 1 } : { x: dx / d, y: dy / d }
  // The point on the circle facing outward, then grow the box outward from it.
  const px = j.pos.x + dir.x * (j.radius + gap)
  const py = j.pos.y + dir.y * (j.radius + gap)
  return { x: px - w / 2 + (dir.x * w) / 2, y: py - h / 2 + (dir.y * h) / 2, w, h }
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

  // Recent-traffic mode: busy paths are bold, quiet ones fade away.
  let traffic = path.count
  let alpha = 1
  if (world.pathMemoryMs) {
    traffic = world.recentTraffic(path)
    if (traffic < 0.3 && !highlighted) return
    alpha = highlighted ? 1 : Math.min(1, 0.2 + traffic / 8)
  }
  const width = 1.4 + Math.log2(1 + traffic) * 0.9
  const arrow = 5 + width * 1.6

  // Two-way traffic: bow each direction to its own side so both arrows are visible.
  const curved = path.reverse !== null
  const nx = -dy / len
  const ny = dx / len
  const bow = curved ? Math.min(28, len * 0.18) : 0
  const ctrl: Vec = { x: (a.pos.x + b.pos.x) / 2 + nx * bow, y: (a.pos.y + b.pos.y) / 2 + ny * bow }

  const start = towards(a.pos, ctrl, a.radius + 1)
  const tip = towards(b.pos, ctrl, b.radius + 2)
  const dir = unit(tip.x - ctrl.x, tip.y - ctrl.y)
  const shaftEnd = { x: tip.x - dir.x * arrow * 0.8, y: tip.y - dir.y * arrow * 0.8 }

  ctx.globalAlpha = alpha
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
  ctx.globalAlpha = 1
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

  if (j.pinned && !j.anchored) {
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

/**
 * Walkers are the most numerous thing drawn (hundreds in the time-use data), so they're batched:
 * one path per type, filled and stroked once, instead of a fill and stroke each. Walkers off
 * screen are skipped. Fading (exiting) walkers have their own opacity, so they're drawn singly.
 */
function drawWalkers(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  view: Viewport,
  theme: Theme,
  state: RenderState,
  px: number,
): void {
  const r = world.layout.walkerRadius
  // Visible area in world units, with a walker's width to spare.
  const halfW = view.width / 2 / cam.zoom + r * 2
  const halfH = view.height / 2 / cam.zoom + r * 2
  const visible = (w: Walker) => Math.abs(w.pos.x - cam.x) <= halfW && Math.abs(w.pos.y - cam.y) <= halfH

  const byType = new Map<string, Walker[]>()
  const fading: Walker[] = []
  for (const w of world.walkers.values()) {
    if (!visible(w)) continue
    if (w.exitProgress !== null) fading.push(w)
    else {
      const list = byType.get(w.type)
      if (list) list.push(w)
      else byType.set(w.type, [w])
    }
  }

  ctx.lineWidth = 0.8
  ctx.strokeStyle = theme.walkerStroke
  for (const [type, list] of byType) {
    const def = world.walkerTypes.get(type)
    const shape = def?.shape ?? 'circle'
    ctx.beginPath()
    for (const w of list) traceShape(ctx, shape, w.pos.x, w.pos.y, r, false)
    ctx.fillStyle = def?.color ?? theme.path
    ctx.fill()
    ctx.stroke()
  }
  for (const w of fading) {
    const def = world.walkerTypes.get(w.type)
    ctx.globalAlpha = 1 - w.exitProgress!
    traceShape(ctx, def?.shape ?? 'circle', w.pos.x, w.pos.y, r)
    ctx.fillStyle = def?.color ?? theme.path
    ctx.fill()
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  for (const w of [state.selected, state.hovered]) {
    if (w?.kind !== 'walker' || w.exiting) continue
    ctx.beginPath()
    ctx.arc(w.pos.x, w.pos.y, r + 3.5 * px + 1, 0, TAU)
    ctx.lineWidth = (state.selected === w ? 2.5 : 1.5) * px
    ctx.strokeStyle = theme.accent
    ctx.stroke()
  }
}

/** Add a walker shape to the current path; `fresh` starts a new path first. */
export function traceShape(
  ctx: CanvasRenderingContext2D,
  shape: WalkerShape,
  x: number,
  y: number,
  r: number,
  fresh = true,
): void {
  if (fresh) ctx.beginPath()
  switch (shape) {
    case 'circle':
      // Start each circle at its own edge, so batched circles aren't joined by stray lines.
      ctx.moveTo(x + r, y)
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

/**
 * Text widths per pixel of font size, by font and text. Labels change rarely and measuring every
 * frame adds up. Width grows in step with font size, so one measurement serves every size, even
 * while fixed-size labels change size in map units as the view zooms.
 */
const textWidths = new Map<string, number>()

function textWidth(ctx: CanvasRenderingContext2D, text: string): number {
  const size = parseFloat(ctx.font.split(' ')[1]) || LABEL_FONT_PX
  const key = ctx.font.replace(/[\d.]+px/, '') + '|' + text
  let perPx = textWidths.get(key)
  if (perPx === undefined) {
    if (textWidths.size > 2000) textWidths.clear()
    perPx = ctx.measureText(text).width / size
    textWidths.set(key, perPx)
  }
  return perPx * size
}

function measureLabel(ctx: CanvasRenderingContext2D, j: Junction, scale = 1): void {
  j.labelWidth = textWidth(ctx, j.name + labelCount(j)) + LABEL_PAD_X * 2 * scale
}

function drawLabel(ctx: CanvasRenderingContext2D, j: Junction, theme: Theme, selected: boolean, scale = 1): void {
  const w = j.labelWidth
  const h = LABEL_HEIGHT * scale
  const r = j.labelRect
  const x = r ? r.x : j.pos.x - w / 2
  const y = r ? r.y : j.pos.y + j.radius + LABEL_GAP * scale
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, h / 2)
  ctx.fillStyle = theme.labelBg
  ctx.fill()
  ctx.lineWidth = (selected ? 1.5 : 1) * scale
  ctx.strokeStyle = selected ? theme.accent : theme.labelBorder
  ctx.stroke()

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const ty = y + h / 2 + 0.5 * scale
  ctx.fillStyle = theme.labelText
  ctx.fillText(j.name, x + LABEL_PAD_X * scale, ty)
  const count = labelCount(j)
  if (count) {
    ctx.fillStyle = theme.labelMuted
    ctx.fillText(count, x + LABEL_PAD_X * scale + textWidth(ctx, j.name), ty)
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
