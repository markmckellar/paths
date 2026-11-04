<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import {
  type Camera,
  MIN_ZOOM,
  easeCamera,
  fitCamera,
  screenToWorld,
  worldToScreen,
  zoomAt,
} from '../engine/camera'
import type { Vec } from '../engine/geometry'
import { type Theme, labelMargin, render } from '../engine/renderer'
import type { Box, Path, World, WorldNode } from '../engine/world'
import type { Simulation } from '../simulation'
import NodePopover from './NodePopover.vue'

const props = defineProps<{ sim: Simulation }>()
const selected = defineModel<WorldNode | null>('selected', { required: true })
const autoFit = defineModel<boolean>('autoFit', { required: true })

const stage = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const size = ref({ width: 0, height: 0 })
const hovered = shallowRef<WorldNode | null>(null)
/** Screen position of the selected node, updated every frame for the popover. */
const anchor = ref<{ x: number; y: number; r: number } | null>(null)
const cursor = ref('default')
const hoverTip = ref<{ x: number; y: number; text: string } | null>(null)
/** Pixels at the bottom covered by the details sheet on small screens. */
const bottomInset = ref(0)

let camera: Camera = { x: 0, y: 0, zoom: 1 }
let dpr = 1
let theme: Theme
let raf = 0
let lastFrame = 0

/** Pixels the pointer may wander before a press becomes a drag instead of a click. */
const DRAG_THRESHOLD = 4
const FIT_PADDING = 56
/** Zoom the graph is shown at while it has room: labels at their natural size. */
const ROOM_ZOOM = 1
/** How quickly the view zooms out when the graph is cramped (and back in), per frame. */
const ROOM_ZOOM_OUT = 0.996
const ROOM_ZOOM_IN = 1.002

// ------------------------------------------------------------------ theme

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    canvas: v('--canvas'),
    junctionFill: v('--junction-fill'),
    junctionStroke: v('--junction-stroke'),
    path: v('--path'),
    accent: v('--accent'),
    labelBg: v('--label-bg'),
    labelBorder: v('--label-border'),
    labelText: v('--label-text'),
    labelMuted: v('--label-muted'),
    walkerStroke: v('--walker-stroke'),
    font: v('--font'),
  }
}

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const onSchemeChange = () => (theme = readTheme())

// ------------------------------------------------------------------ sizing

let resizeObserver: ResizeObserver | null = null

function resize(): void {
  const el = stage.value
  const c = canvas.value
  if (!el || !c) return
  dpr = window.devicePixelRatio || 1
  const { width, height } = el.getBoundingClientRect()
  size.value = { width, height }
  c.width = Math.round(width * dpr)
  c.height = Math.round(height * dpr)
  overlayReadIn = 0
}

// ------------------------------------------------------------------ frame loop

function frame(now: number): void {
  const dt = lastFrame ? now - lastFrame : 0
  lastFrame = now
  const { world } = props.sim
  props.sim.tick(dt)

  // On phones the details sheet covers the bottom; frame the graph in the space above it.
  const inset = selected.value ? bottomInset.value : 0
  const free = { width: size.value.width, height: Math.max(80, size.value.height - inset) }
  if (autoFit.value && world.fillView) {
    fillRoom(world, free, inset)
  } else if (autoFit.value) {
    const b = world.bounds()
    if (b) {
      // Fixed-size labels aren't in the bounds (see World.bounds); leave room for them on screen.
      const margin = world.labels.screenPx ? labelMargin(world, camera.zoom) : null
      const padding = margin ? { x: FIT_PADDING / 2 + margin.x, y: FIT_PADDING / 2 + margin.y } : FIT_PADDING
      const target = fitCamera(b, free, padding)
      target.y += inset / 2 / target.zoom
      // Jump straight there right after a (re)start; otherwise ease, so the view moves smoothly.
      const snap = snapFrames > 0 || world.junctions.size <= 2
      if (snapFrames > 0) snapFrames--
      camera = easeCamera(camera, target, snap ? 1 : 0.05)
    }
  } else if (inset > 0 && selected.value && !press) {
    // Keep the selected node visible above the sheet.
    const p = worldToScreen(camera, size.value, selected.value.pos)
    if (p.y > free.height - 24 || p.y < 24) {
      const target = { ...camera, x: selected.value.pos.x, y: selected.value.pos.y + inset / 2 / camera.zoom }
      camera = easeCamera(camera, target, 0.12)
    }
  }

  const ctx = canvas.value?.getContext('2d')
  if (ctx && size.value.width > 0) {
    render(ctx, world, camera, size.value, dpr, theme, {
      selected: selected.value,
      hovered: hovered.value,
      highlightPaths: highlightPaths(),
    })
  }

  anchor.value = selectedAnchor()
  raf = requestAnimationFrame(frame)
}

/** Zoom the room is shown at; drops below ROOM_ZOOM only when the graph won't fit otherwise. */
let roomZoom = ROOM_ZOOM

/**
 * The window is the room the graph spreads out to fill; the clock, legend and tips drawn over
 * it are areas to keep clear. The camera just frames the room, zooming out only when the graph
 * is too big to fit even packed tight, and back in once it has room again.
 */
function fillRoom(world: World, free: { width: number; height: number }, inset: number): void {
  if (world.cramped) roomZoom = Math.max(MIN_ZOOM, roomZoom * ROOM_ZOOM_OUT)
  else if (roomZoom < ROOM_ZOOM && world.spread > 1.3) roomZoom = Math.min(ROOM_ZOOM, roomZoom * ROOM_ZOOM_IN)
  const { width, height } = size.value
  const toWorld = (x: number, y: number) => ({ x: (x - width / 2) / roomZoom, y: (y - height / 2) / roomZoom })
  const a = toWorld(0, 0)
  const b = toWorld(width, height)
  world.room = { minX: a.x, minY: a.y, maxX: b.x, maxY: b.y }
  world.keepOut = overlays().map((r) => {
    const p = toWorld(r.x, r.y)
    const q = toWorld(r.x + r.w, r.y + r.h)
    return { minX: p.x, minY: p.y, maxX: q.x, maxY: q.y } satisfies Box
  })
  // On phones the details sheet covers the bottom: fit the whole room into the space above it.
  const target = fitCamera(world.room, free, 0, roomZoom)
  target.y += inset / 2 / target.zoom
  const snap = snapFrames > 0
  if (snapFrames > 0) snapFrames--
  camera = easeCamera(camera, target, snap ? 1 : 0.05)
}

/** Frames between re-reading where the overlays are: reading layout every frame is costly. */
const OVERLAY_READ_FRAMES = 30
let overlayCache: { x: number; y: number; w: number; h: number }[] = []
let overlayReadIn = 0

/** Things drawn over the graph (clock, legend, tips), in canvas pixels. */
function overlays(): { x: number; y: number; w: number; h: number }[] {
  if (overlayReadIn-- > 0) return overlayCache
  overlayReadIn = OVERLAY_READ_FRAMES
  overlayCache = readOverlays()
  return overlayCache
}

function readOverlays(): { x: number; y: number; w: number; h: number }[] {
  const el = stage.value
  if (!el?.parentElement) return []
  const origin = el.getBoundingClientRect()
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (const o of el.parentElement.querySelectorAll('[data-graph-overlay]')) {
    const r = o.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    out.push({ x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height })
  }
  return out
}

/**
 * Where the popover points. Junctions anchor beyond their label so it stays readable. A walker
 * that has completed and left keeps its popover, anchored to the state it finished in.
 */
function selectedAnchor(): { x: number; y: number; r: number } | null {
  const s = selected.value
  if (!s) return null
  const { world } = props.sim
  let target: WorldNode = s
  if (s.kind === 'walker' && !world.walkers.has(s.name)) {
    if (!s.junction) return null
    target = s.junction
  }
  const p = worldToScreen(camera, size.value, target.pos)
  const r =
    target.kind === 'junction'
      ? Math.max(target.radius, target.labelWidth / 2)
      : world.layout.walkerRadius
  return { x: p.x, y: p.y, r: r * camera.zoom }
}

/** The selected walker's route, or every path touching the selected junction. */
function highlightPaths(): Set<Path> {
  const s = selected.value
  const out = new Set<Path>()
  if (!s) return out
  const { world } = props.sim
  if (s.kind === 'junction') {
    for (const p of s.incoming) out.add(p)
    for (const p of s.outgoing) out.add(p)
    return out
  }
  for (let i = 1; i < s.history.length; i++) {
    const p = world.paths.get(`${s.history[i - 1].junction}→${s.history[i].junction}`)
    if (p) out.add(p)
  }
  return out
}

// ------------------------------------------------------------------ pointer input

interface Press {
  id: number
  start: Vec
  last: Vec
  /** What a click selects. */
  node: WorldNode | null
  /** What a drag moves; null means the drag pans the view. */
  dragTarget: WorldNode | null
  /** World-space offset from the pointer to the drag target's centre, so it doesn't jump. */
  grab: Vec
  dragging: boolean
}

/**
 * Dragging a walker that sits in a state moves the state: that's what people reach for, and a
 * walker pulled loose would just glide back. Dragging a walker in transit pans instead.
 */
function dragTargetFor(node: WorldNode | null): WorldNode | null {
  if (node?.kind !== 'walker') return node
  const j = node.junction
  return j && Math.hypot(node.pos.x - j.pos.x, node.pos.y - j.pos.y) <= j.radius ? j : null
}

let press: Press | null = null
const touches = new Map<number, Vec>()
let pinch: { dist: number; mid: Vec } | null = null

function localPoint(e: PointerEvent | WheelEvent | MouseEvent): Vec {
  const r = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function hit(p: Vec): WorldNode | null {
  const w = screenToWorld(camera, size.value, p)
  // Keep tiny walkers easy to grab when zoomed out: at least ~9px on screen.
  const slop = Math.max(2, 9 / camera.zoom - props.sim.world.layout.walkerRadius)
  return props.sim.world.hitTest(w, slop)
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  canvas.value!.setPointerCapture(e.pointerId)
  const p = localPoint(e)
  touches.set(e.pointerId, p)

  if (touches.size === 2) {
    // Second finger: switch from drag/pan to pinch.
    endPress(false)
    const [a, b] = [...touches.values()]
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
    return
  }
  const node = hit(p)
  const dragTarget = dragTargetFor(node)
  const w = screenToWorld(camera, size.value, p)
  press = {
    id: e.pointerId,
    start: p,
    last: p,
    node,
    dragTarget,
    grab: dragTarget ? { x: dragTarget.pos.x - w.x, y: dragTarget.pos.y - w.y } : { x: 0, y: 0 },
    dragging: false,
  }
  hoverTip.value = null
  cursor.value = 'grabbing'
}

function onPointerMove(e: PointerEvent): void {
  const p = localPoint(e)
  if (touches.has(e.pointerId)) touches.set(e.pointerId, p)

  if (pinch && touches.size === 2) {
    const [a, b] = [...touches.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    camera = zoomAt(camera, size.value, mid, d / pinch.dist)
    camera = { ...camera, x: camera.x - (mid.x - pinch.mid.x) / camera.zoom, y: camera.y - (mid.y - pinch.mid.y) / camera.zoom }
    pinch = { dist: d, mid }
    autoFit.value = false
    return
  }

  if (!press || press.id !== e.pointerId) {
    updateHover(p)
    return
  }

  if (!press.dragging && Math.hypot(p.x - press.start.x, p.y - press.start.y) > DRAG_THRESHOLD) {
    press.dragging = true
    if (press.dragTarget) press.dragTarget.dragging = true
    autoFit.value = false
  }
  if (!press.dragging) return

  if (press.dragTarget) {
    const w = screenToWorld(camera, size.value, p)
    props.sim.world.dragNode(press.dragTarget, { x: w.x + press.grab.x, y: w.y + press.grab.y })
  } else {
    camera = { ...camera, x: camera.x - (p.x - press.last.x) / camera.zoom, y: camera.y - (p.y - press.last.y) / camera.zoom }
  }
  press.last = p
}

function onPointerUp(e: PointerEvent): void {
  touches.delete(e.pointerId)
  if (touches.size < 2) pinch = null
  if (press && press.id === e.pointerId) endPress(e.type === 'pointerup')
  updateHover(localPoint(e))
}

/** Finish a press. A press that never moved is a click: select what's under it, or clear. */
function endPress(isRelease: boolean): void {
  if (!press) return
  const { node, dragTarget, dragging } = press
  if (dragTarget) {
    dragTarget.dragging = false
    // Junctions stay where you drop them; double-click releases them back to the layout.
    if (dragging && dragTarget.kind === 'junction') {
      dragTarget.pinned = true
      dragTarget.anchored = false // moved by hand now, so show it as pinned
    }
  }
  if (isRelease && !dragging) selected.value = node
  press = null
}

function updateHover(p: Vec): void {
  if (press) return
  const node = hit(p)
  hovered.value = node
  cursor.value = node ? 'grab' : 'default'
  // Walkers are tiny, so name them on hover. Junctions already carry a label.
  if (node?.kind === 'walker' && node !== selected.value) {
    const where = node.junction ? ` · ${node.junction.name}` : ''
    hoverTip.value = { x: p.x, y: p.y, text: node.name + where }
  } else {
    hoverTip.value = null
  }
}

function onPointerLeave(): void {
  if (press) return
  hovered.value = null
  hoverTip.value = null
}

/** Double-click a pinned state to release it; double-click empty space to fit the view. */
function onDoubleClick(e: MouseEvent): void {
  const p = localPoint(e)
  const junction = props.sim.world.junctionAt(screenToWorld(camera, size.value, p))
  if (junction?.pinned) junction.pinned = false
  else if (!hit(p)) autoFit.value = true
}

function onWheel(e: WheelEvent): void {
  e.preventDefault()
  // Trackpad pinch arrives as ctrl+wheel with small deltas; scale those up.
  const delta = e.ctrlKey ? e.deltaY * 8 : e.deltaY
  camera = zoomAt(camera, size.value, localPoint(e), Math.exp(-delta * 0.0015))
  autoFit.value = false
}

// ------------------------------------------------------------------ public API

function zoomBy(factor: number): void {
  camera = zoomAt(camera, size.value, { x: size.value.width / 2, y: size.value.height / 2 }, factor)
  autoFit.value = false
}

/** Jump straight to a fitted view (used after restart). */
/** Frames left in which the auto-fit jumps instead of easing (labels are measured on the first). */
let snapFrames = 3

function snapToFit(): void {
  camera = { x: 0, y: 0, zoom: 1 }
  roomZoom = ROOM_ZOOM
  overlayReadIn = 0
  autoFit.value = true
  snapFrames = 3
}

defineExpose({ zoomBy, snapToFit })

// Dev-only hook for automated UI checks; stripped from production builds.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__paths = {
    sim: props.sim,
    toScreen: (p: Vec) => worldToScreen(camera, size.value, p),
    camera: () => camera,
  }
}

watch(selected, () => (hoverTip.value = null))

const popoverNode = computed(() => (anchor.value ? selected.value : null))

onMounted(() => {
  theme = readTheme()
  darkQuery.addEventListener('change', onSchemeChange)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage.value!)
  resize()
  // Non-passive so wheel zoom doesn't also scroll the page.
  canvas.value!.addEventListener('wheel', onWheel, { passive: false })
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  darkQuery.removeEventListener('change', onSchemeChange)
  canvas.value?.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <div ref="stage" class="stage">
    <canvas
      ref="canvas"
      :style="{ cursor }"
      role="img"
      aria-label="Graph of process states and the work items moving between them"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave"
      @dblclick="onDoubleClick"
    />
    <div
      v-if="hoverTip"
      class="tip"
      :style="{ transform: `translate(${hoverTip.x + 14}px, ${hoverTip.y + 14}px)` }"
    >
      {{ hoverTip.text }}
    </div>
    <NodePopover
      v-if="popoverNode && anchor"
      :node="popoverNode"
      :world="sim.world"
      :words="sim.scenario.words"
      :format-time-of-day="sim.scenario.formatTimeOfDay"
      :anchor="anchor"
      :viewport="size"
      @select="(n) => (selected = n)"
      @close="selected = null"
      @inset="(px) => (bottomInset = px)"
    />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--canvas);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
}

.tip {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--text);
  color: var(--bg);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: var(--shadow);
}
</style>
