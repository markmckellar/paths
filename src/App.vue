<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import GraphCanvas from './components/GraphCanvas.vue'
import BigClock from './components/BigClock.vue'
import ShapeIcon from './components/ShapeIcon.vue'
import { labScenario } from './demo/lab'
import { pipelineScenario } from './demo/pipeline'
import { timeUseScenarios } from './demo/timeuse'
import type { WorldNode, WorldStats } from './engine/world'
import type { Scenario } from './scenario'
import { Simulation } from './simulation'

const SPEEDS = [0.5, 1, 2, 4, 8]
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SCENARIOS: Scenario[] = [pipelineScenario, labScenario, ...timeUseScenarios()]
/** Picker entries grouped under their headings, in order. */
const scenarioGroups = [...new Set(SCENARIOS.map((s) => s.group))].map((group) => ({
  group,
  items: SCENARIOS.filter((s) => s.group === group),
}))
/** Shown when the link names no data set. */
const DEFAULT_SCENARIO = SCENARIOS.find((s) => s.key === 'life-weekday') ?? pipelineScenario
/** The data set named in the link: `#lab`, or `?demo=lab` for sites that drop the `#` part (e.g. LinkedIn). */
const scenarioFromHash = (): Scenario => {
  const key = location.hash.slice(1) || new URLSearchParams(location.search).get('demo') || ''
  return SCENARIOS.find((s) => s.key === key) ?? DEFAULT_SCENARIO
}

const sim = markRaw(new Simulation(scenarioFromHash()))
// Respect reduced-motion: start paused and let the user press play.
sim.world.playing = !reducedMotion
const scenario = shallowRef<Scenario>(sim.scenario)

const graph = ref<InstanceType<typeof GraphCanvas>>()
const selected = shallowRef<WorldNode | null>(null)
const autoFit = ref(true)
const playing = ref(sim.world.playing)
const speed = ref(sim.speedMultiplier)
const clock = ref('')
/** Big on-graph clock: on by default where the scenario asks for it; the toolbar toggles it. */
const showBigClock = ref(sim.scenario.bigClock ?? false)
const bigClock = ref<{ time: string; caption?: string; progress?: number; scale?: string[] }>({ time: '' })
const stats = ref<WorldStats>(sim.world.stats())
const typeCounts = ref<Record<string, number>>({})
const showHelp = ref(true)
/** The legend starts folded away on phones, where it would cover much of the graph. */
const legendOpen = ref(window.innerWidth > 560)

// The world isn't reactive; sample what the chrome shows a few times a second.
function sample(): void {
  clock.value = sim.scenario.formatClock(sim.world.simTime)
  const sc = sim.scenario
  const t = sim.world.simTime
  bigClock.value = {
    time: sc.formatClock(t),
    caption: sc.timeCaption?.(t),
    progress: sc.cycle ? (((t - sim.startedAt) % sc.cycle.lengthMs) / sc.cycle.lengthMs) * 100 : undefined,
    scale: sc.cycle?.scale,
  }
  stats.value = sim.world.stats()
  const counts: Record<string, number> = {}
  for (const w of sim.world.walkers.values()) if (!w.exiting) counts[w.type] = (counts[w.type] ?? 0) + 1
  typeCounts.value = counts
}

function togglePlay(): void {
  sim.world.playing = !sim.world.playing
  playing.value = sim.world.playing
}

function setSpeed(s: number): void {
  sim.speedMultiplier = s
  speed.value = s
}

/** Switch data set from the picker (or a #link), and remember it in the address bar. */
function selectScenario(next: Scenario): void {
  if (next.key !== sim.scenario.key) {
    sim.setScenario(next)
    scenario.value = next
    showBigClock.value = next.bigClock ?? false
    selected.value = null
    autoFit.value = true
    graph.value?.snapToFit()
    sample()
  }
  if (location.hash !== `#${next.key}`) history.replaceState(null, '', `#${next.key}`)
}

function onPick(e: Event): void {
  const key = (e.target as HTMLSelectElement).value
  const next = SCENARIOS.find((s) => s.key === key)
  if (next) selectScenario(next)
}

function onHashChange(): void {
  selectScenario(scenarioFromHash())
}

function restart(): void {
  sim.restart()
  selected.value = null
  graph.value?.snapToFit()
  sample()
}

function fit(): void {
  autoFit.value = true
}

function onKey(e: KeyboardEvent): void {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const target = e.target as HTMLElement
  // Let buttons handle Space/Enter themselves.
  if (target.closest('button, input, select, textarea')) {
    if (e.key === ' ' || e.key === 'Enter') return
  }
  switch (e.key) {
    case ' ':
      e.preventDefault()
      togglePlay()
      break
    case 'Escape':
      selected.value = null
      break
    case 'f':
    case 'F':
      fit()
      break
    case '+':
    case '=':
      graph.value?.zoomBy(1.25)
      break
    case '-':
    case '_':
      graph.value?.zoomBy(0.8)
      break
  }
}

let timer = 0
onMounted(() => {
  sample()
  timer = window.setInterval(sample, 250)
  window.addEventListener('keydown', onKey)
  window.addEventListener('hashchange', onHashChange)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('hashchange', onHashChange)
})

const walkerTypes = computed(() => {
  void scenario.value
  return [...sim.world.walkerTypes.values()]
})
</script>

<template>
  <div class="app">
    <header class="bar">
      <div class="brand">
        <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M8 24 16 9l8 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="8" cy="24" r="4" fill="currentColor" />
          <circle cx="16" cy="9" r="4" fill="currentColor" />
          <circle cx="24" cy="24" r="4" fill="currentColor" />
        </svg>
        <div>
          <h1>Paths</h1>
          <p>{{ scenario.subtitle }}</p>
        </div>
      </div>

      <div class="controls">
        <label class="picker">
          <span class="visually-hidden">Data set</span>
          <select :value="scenario.key" title="Choose a data set" @change="onPick">
            <optgroup v-for="g in scenarioGroups" :key="g.group" :label="g.group">
              <option v-for="s in g.items" :key="s.key" :value="s.key">{{ s.label }}</option>
            </optgroup>
          </select>
        </label>

        <button
          type="button"
          class="btn primary"
          :aria-pressed="playing"
          :title="playing ? 'Pause (Space)' : 'Play (Space)'"
          @click="togglePlay"
        >
          <svg v-if="playing" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" />
            <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M4 2.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L4.9 1.7a.6.6 0 0 0-.9.5z" fill="currentColor" />
          </svg>
          <span class="btn-label">{{ playing ? 'Pause' : 'Play' }}</span>
        </button>

        <div class="segmented" role="group" aria-label="Simulation speed">
          <button
            v-for="s in SPEEDS"
            :key="s"
            type="button"
            :class="{ active: speed === s }"
            :aria-pressed="speed === s"
            @click="setSpeed(s)"
          >
            {{ s === 0.5 ? '½' : s }}&times;
          </button>
        </div>

        <button
          type="button"
          class="btn icon"
          :class="{ active: showBigClock }"
          :aria-pressed="showBigClock"
          :title="showBigClock ? 'Hide the big clock' : 'Show a big clock on the graph'"
          aria-label="Big clock"
          @click="showBigClock = !showBigClock"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button type="button" class="btn" :title="scenario.restartHint" @click="restart">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2.5 7a4.5 4.5 0 1 0 1.4-3.3M2.5 2v2.8h2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="btn-label">Restart</span>
        </button>

        <div class="zoom" role="group" aria-label="View">
          <button type="button" class="btn icon" title="Zoom out (−)" aria-label="Zoom out" @click="graph?.zoomBy(0.8)">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
          <button
            type="button"
            class="btn icon"
            :class="{ active: autoFit }"
            title="Fit to view (F). Stays fitted until you pan or zoom."
            aria-label="Fit to view"
            :aria-pressed="autoFit"
            @click="fit"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" class="btn icon" title="Zoom in (+)" aria-label="Zoom in" @click="graph?.zoomBy(1.25)">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M7 3v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
        </div>
      </div>

      <dl class="readout" aria-live="off">
        <div>
          <dt>Clock</dt>
          <dd class="mono">{{ clock }}</dd>
        </div>
        <div>
          <dt>{{ scenario.words.active }}</dt>
          <dd>{{ stats.activeWalkers }}</dd>
        </div>
        <div v-if="scenario.showDone">
          <dt>Done</dt>
          <dd>{{ stats.completed }}</dd>
        </div>
        <div>
          <dt>{{ scenario.words.states }}</dt>
          <dd>{{ stats.junctions }}</dd>
        </div>
      </dl>
    </header>

    <main class="main">
      <GraphCanvas ref="graph" v-model:selected="selected" v-model:auto-fit="autoFit" :sim="sim" />

      <BigClock
        v-if="showBigClock"
        :time="bigClock.time"
        :caption="bigClock.caption"
        :progress="bigClock.progress"
        :scale="bigClock.scale"
      />

      <aside class="legend" data-graph-overlay :class="{ folded: !legendOpen }" aria-label="Legend">
        <button
          type="button"
          class="legend-toggle"
          :aria-expanded="legendOpen"
          @click="legendOpen = !legendOpen"
        >
          {{ legendOpen ? 'Hide key' : `Key · ${walkerTypes.length} ${walkerTypes.length === 1 ? 'type' : 'types'}` }}
        </button>
        <ul v-show="legendOpen">
          <li v-for="t in walkerTypes" :key="t.key">
            <ShapeIcon :shape="t.shape" :color="t.color" />
            <span>{{ t.label }}</span>
            <span class="count">{{ typeCounts[t.key] ?? 0 }}</span>
          </li>
        </ul>
        <p v-if="scenario.credit" v-show="legendOpen" class="credit">
          Data: <a :href="scenario.credit.url" target="_blank" rel="noopener">{{ scenario.credit.text }}</a>
        </p>
      </aside>

      <aside v-if="showHelp" class="help" data-graph-overlay>
        <ul>
          <li><strong>Click</strong> a state or item for details</li>
          <li><strong>Drag</strong> a state to pin it &middot; <strong>double-click</strong> to release</li>
          <li><strong>Drag</strong> empty space to pan &middot; <strong>scroll</strong> to zoom</li>
          <li><kbd>Space</kbd> play/pause &middot; <kbd>F</kbd> fit &middot; <kbd>Esc</kbd> close</li>
        </ul>
        <button type="button" class="dismiss" aria-label="Hide tips" title="Hide tips" @click="showHelp = false">
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </aside>

      <div v-if="!playing && stats.junctions === 0" class="start">
        <button type="button" class="btn primary large" @click="togglePlay">Start simulation</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.picker select {
  height: 32px;
  max-width: 240px;
  padding: 0 28px 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}
.picker select:hover {
  background: var(--surface-2);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.credit {
  max-width: 230px;
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-muted);
}
.credit a {
  color: inherit;
}

.app {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent);
  margin-right: auto;
}
.brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text);
}
.brand p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.btn:hover {
  background: var(--surface-2);
}
.btn.primary {
  min-width: 92px;
  justify-content: center;
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-contrast);
}
.btn.primary:hover {
  filter: brightness(1.08);
}
.btn.icon {
  width: 32px;
  padding: 0;
  justify-content: center;
}
.btn.active {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: transparent;
}
.btn.large {
  height: 42px;
  padding: 0 20px;
  font-size: 15px;
}

.segmented,
.zoom {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-2);
}
.zoom .btn {
  height: 28px;
  border: 0;
  background: transparent;
}
.zoom .btn:hover {
  background: var(--surface);
}
.zoom .btn.active {
  background: var(--accent-soft);
}
.segmented button {
  min-width: 34px;
  height: 28px;
  padding: 0 6px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
.segmented button:hover {
  color: var(--text);
}
.segmented button.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 2px #0000001f;
}

.readout {
  display: flex;
  gap: 18px;
  margin: 0;
}
.readout dt {
  font-size: 11px;
  color: var(--text-muted);
}
.readout dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.mono {
  font-family: var(--mono);
  font-size: 13px;
}

.main {
  position: relative;
  min-height: 0;
}

.legend,
.help {
  position: absolute;
  bottom: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow);
  font-size: 12px;
}
.legend {
  left: 12px;
  padding: 8px 12px;
}
.legend ul,
.help ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 22px;
}
.legend-toggle {
  display: none;
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
}
.legend .count {
  margin-left: auto;
  padding-left: 16px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.help {
  right: 12px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 6px 8px 12px;
  color: var(--text-muted);
}
.help li {
  line-height: 20px;
}
.help strong {
  color: var(--text);
  font-weight: 600;
}
kbd {
  padding: 0 4px;
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--surface-2);
  font: 11px var(--mono);
  color: var(--text);
}
.dismiss {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.dismiss:hover {
  background: var(--surface-2);
  color: var(--text);
}

.start {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.start .btn {
  pointer-events: auto;
}

@media (max-width: 760px) {
  .readout {
    width: 100%;
    justify-content: space-between;
  }
  .help {
    display: none;
  }
}

@media (max-width: 560px) {
  .legend-toggle {
    display: block;
  }
  .legend:not(.folded) .legend-toggle {
    margin-bottom: 4px;
  }
  .picker {
    flex: 1 1 100%;
  }
  .picker select {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .bar {
    gap: 8px;
    padding: 8px 16px;
  }
  .brand {
    gap: 6px;
  }
  .brand p,
  .btn-label,
  .zoom {
    /* Pinch to zoom on touch screens; double-tap empty space to fit. */
    display: none;
  }
  .controls {
    /* the data-set picker takes its own row; the buttons fit on the row below */
    flex-wrap: wrap;
    gap: 6px;
  }
  .btn.primary {
    min-width: 0;
    width: 36px;
    padding: 0;
  }
  .btn {
    padding: 0 9px;
  }
  .segmented button {
    min-width: 0;
    padding: 0 5px;
  }
  .readout {
    gap: 8px;
  }
  .readout > div {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .readout dd {
    font-size: 13px;
  }
}
</style>
