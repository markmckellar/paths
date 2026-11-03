<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { WalkerTypeDef } from '../engine/types'
import type { Junction, Path, Walker, World, WorldNode } from '../engine/world'
import { formatDuration } from '../format'
import ShapeIcon from './ShapeIcon.vue'

const props = defineProps<{
  node: WorldNode
  world: World
  anchor: { x: number; y: number; r: number }
  viewport: { width: number; height: number }
}>()

const emit = defineEmits<{
  select: [node: WorldNode]
  close: []
  /** Height covered at the bottom of the canvas when shown as a sheet (0 otherwise). */
  inset: [px: number]
}>()

// The world isn't reactive, so refresh the details a few times a second.
const tick = ref(0)
let timer = 0
onMounted(() => (timer = window.setInterval(() => tick.value++, 250)))
onBeforeUnmount(() => clearInterval(timer))

const el = ref<HTMLElement>()
const box = ref({ width: 280, height: 200 })
let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver(() => {
    if (el.value) box.value = { width: el.value.offsetWidth, height: el.value.offsetHeight }
  })
  observer.observe(el.value!)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  emit('inset', 0)
})

const GAP = 14
const EDGE = 12
const SHEET_BELOW = 560

const sheet = computed(() => props.viewport.width < SHEET_BELOW)
watch([sheet, () => box.value.height], ([isSheet, h]) => emit('inset', isSheet ? h : 0), { immediate: true })

/** Sit beside the node, on whichever side has room; never leave the viewport. */
const position = computed(() => {
  if (sheet.value) return {}
  const { x, y, r } = props.anchor
  const { width, height } = box.value
  let left = x + r + GAP
  if (left + width > props.viewport.width - EDGE) left = x - r - GAP - width
  left = Math.min(Math.max(left, EDGE), props.viewport.width - width - EDGE)
  const top = Math.min(Math.max(y - 28, EDGE), props.viewport.height - height - EDGE)
  return { transform: `translate(${Math.round(left)}px, ${Math.round(top)}px)` }
})

function typeOf(key: string): WalkerTypeDef {
  return props.world.walkerTypes.get(key) ?? { key, label: key, color: 'var(--text-muted)', shape: 'circle' }
}

interface Flow {
  junction: Junction
  count: number
}

function flows(paths: Set<Path>, pick: (p: Path) => Junction): Flow[] {
  return [...paths]
    .map((p) => ({ junction: pick(p), count: p.count }))
    .sort((a, b) => b.count - a.count || a.junction.name.localeCompare(b.junction.name))
}

const junction = computed(() => {
  void tick.value
  if (props.node.kind !== 'junction') return null
  const j: Junction = props.node
  const total = j.count
  const byType = [...j.occupants.entries()]
    .map(([type, set]) => ({ type: typeOf(type), count: set.size }))
    .sort((a, b) => b.count - a.count)
  const incoming = flows(j.incoming, (p) => p.from)
  const outgoing = flows(j.outgoing, (p) => p.to)
  const maxFlow = Math.max(1, ...incoming.map((f) => f.count), ...outgoing.map((f) => f.count))
  return {
    j,
    total,
    byType,
    incoming,
    outgoing,
    maxFlow,
    visits: j.visits,
    avgDwell: j.departures ? formatDuration(j.averageDwell) : '—',
  }
})

const walker = computed(() => {
  void tick.value
  if (props.node.kind !== 'walker') return null
  const w: Walker = props.node
  const start = w.history[0]?.time ?? props.world.simTime
  return {
    w,
    type: typeOf(w.type),
    current: w.junction,
    inState: formatDuration(props.world.simTime - w.enteredAt),
    age: formatDuration(props.world.simTime - start),
    journey: w.history.map((v, i) => ({
      key: `${i}-${v.junction}`,
      name: v.junction,
      at: `+${formatDuration(v.time - start)}`,
      current: i === w.history.length - 1 && !w.exiting,
    })),
  }
})

// Keep the latest step of a long journey in view.
const journeyList = ref<HTMLElement>()
watch(
  () => [props.node, walker.value?.journey.length],
  () => nextTick(() => journeyList.value?.scrollTo({ top: journeyList.value.scrollHeight })),
  { immediate: true },
)

function selectJunction(name: string): void {
  const j = props.world.junctions.get(name)
  if (j) emit('select', j)
}

function release(j: Junction): void {
  j.pinned = false
  tick.value++
}
</script>

<template>
  <section
    ref="el"
    class="popover"
    :class="{ sheet }"
    :style="position"
    role="dialog"
    :aria-label="`Details for ${node.name}`"
    @pointerdown.stop
    @wheel.stop
  >
    <header>
      <div class="title">
        <template v-if="walker">
          <ShapeIcon :shape="walker.type.shape" :color="walker.type.color" :size="14" />
          <h2>{{ walker.w.name }}</h2>
        </template>
        <template v-else-if="junction">
          <span class="state-dot" />
          <h2>{{ junction.j.name }}</h2>
        </template>
      </div>
      <button class="icon-btn" type="button" aria-label="Close details" title="Close (Esc)" @click="emit('close')">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </header>

    <!-- Junction / state -->
    <template v-if="junction">
      <p class="kind">
        State
        <span v-if="junction.j.pinned" class="pill">
          Pinned
          <button type="button" class="link" @click="release(junction.j)">Release</button>
        </span>
      </p>

      <dl class="stats">
        <div>
          <dt>Here now</dt>
          <dd>{{ junction.total }}</dd>
        </div>
        <div>
          <dt>Visits</dt>
          <dd>{{ junction.visits }}</dd>
        </div>
        <div>
          <dt>Avg. stay</dt>
          <dd>{{ junction.avgDwell }}</dd>
        </div>
      </dl>

      <template v-if="junction.total > 0">
        <div class="bar" role="img" :aria-label="junction.byType.map((t) => `${t.count} ${t.type.label}`).join(', ')">
          <span
            v-for="t in junction.byType"
            :key="t.type.key"
            :style="{ flexGrow: t.count, background: t.type.color }"
          />
        </div>
        <ul class="types">
          <li v-for="t in junction.byType" :key="t.type.key">
            <ShapeIcon :shape="t.type.shape" :color="t.type.color" />
            {{ t.type.label }}
            <span class="num">{{ t.count }}</span>
          </li>
        </ul>
      </template>

      <div v-if="junction.incoming.length || junction.outgoing.length" class="flows">
        <div v-for="group in [
          { title: 'Arrives from', items: junction.incoming },
          { title: 'Moves on to', items: junction.outgoing },
        ]" :key="group.title">
          <h3>{{ group.title }}</h3>
          <p v-if="!group.items.length" class="empty">Nothing yet</p>
          <ul v-else>
            <li v-for="f in group.items" :key="f.junction.name">
              <button type="button" class="row" @click="emit('select', f.junction)">
                <span class="name">{{ f.junction.name }}</span>
                <span class="meter"><span :style="{ width: `${(f.count / junction.maxFlow) * 100}%` }" /></span>
                <span class="num">{{ f.count }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- Walker / work item -->
    <template v-else-if="walker">
      <p class="kind">{{ walker.type.label }}</p>
      <dl class="stats walker-stats">
        <div>
          <dt>State</dt>
          <dd v-if="walker.current && !walker.w.exiting">
            <button type="button" class="link strong" @click="selectJunction(walker.current.name)">
              {{ walker.current.name }}
            </button>
          </dd>
          <dd v-else class="done">Completed</dd>
        </div>
        <div>
          <dt>For</dt>
          <dd>{{ walker.inState }}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{{ walker.age }}</dd>
        </div>
      </dl>
      <h3>Journey</h3>
      <ol ref="journeyList" class="journey">
        <li v-for="step in walker.journey" :key="step.key" :class="{ current: step.current }">
          <button type="button" class="row" @click="selectJunction(step.name)">
            <span class="name">{{ step.name }}</span>
            <span class="num">{{ step.at }}</span>
          </button>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.popover {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  max-height: calc(100% - 24px);
  overflow: auto;
  padding: 12px 14px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
  font-size: 13px;
  z-index: 5;
}

.popover.sheet {
  top: auto;
  bottom: 0;
  width: 100%;
  max-height: 46%;
  border-radius: 14px 14px 0 0;
  border-bottom: 0;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h3 {
  margin: 12px 0 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.state-dot {
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--junction-stroke);
  background: var(--junction-fill);
}

.kind {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 10px;
  color: var(--text-muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
}

.icon-btn {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.icon-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent);
  cursor: pointer;
  font-weight: 500;
}
.link:hover {
  text-decoration: underline;
}
.link.strong {
  color: var(--text);
  font-weight: 600;
  text-align: left;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
}
/* State names are longer than durations; give them the room. */
.walker-stats {
  grid-template-columns: 1.8fr 1fr 1fr;
}
.stats > div {
  padding: 7px 9px;
  border-radius: 8px;
  background: var(--surface-2);
  min-width: 0;
}
dt {
  font-size: 11px;
  color: var(--text-muted);
}
dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar {
  display: flex;
  gap: 2px;
  height: 6px;
  margin: 12px 0 6px;
  border-radius: 3px;
  overflow: hidden;
}
.bar > span {
  min-width: 3px;
}

.types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.types li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.num {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.flows {
  display: grid;
  gap: 0 14px;
}

ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  margin: 0 -6px;
  width: calc(100% + 12px);
  border: 0;
  border-radius: 6px;
  background: none;
  text-align: left;
  cursor: pointer;
}
.row:hover {
  background: var(--surface-2);
}
.row .name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meter {
  flex: none;
  width: 56px;
  height: 4px;
  border-radius: 2px;
  background: var(--surface-2);
  overflow: hidden;
}
.meter > span {
  display: block;
  height: 100%;
  background: var(--accent);
  opacity: 0.7;
}

.done {
  color: var(--accent);
}

.empty {
  margin: 0;
  color: var(--text-muted);
}

.journey {
  position: relative;
  max-height: 220px;
  overflow: auto;
}
.journey li {
  position: relative;
  padding-left: 16px;
}
.journey li::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 50%;
  width: 7px;
  height: 7px;
  margin-top: -3.5px;
  border-radius: 50%;
  background: var(--path);
}
.journey li:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 6px;
  top: calc(50% + 4px);
  height: calc(100% - 8px);
  border-left: 1px solid var(--path);
}
.journey li.current::before {
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.journey li.current .name {
  font-weight: 600;
}
</style>
