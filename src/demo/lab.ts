import type { WorldOptions } from '../engine/types'
import type { Scenario } from '../scenario'
import { type Flow, finalStateExits, PipelineFeed } from './pipeline'

/**
 * Demo: patient samples moving through a genetic testing lab, from arrival to signed-out report.
 *
 * Made-up data with a generic, textbook lab workflow. Different sample types share the core
 * steps (extraction, library prep, sequencing, analysis, review), so the map shows where they
 * converge and queue up. QC failures send samples back a step, and side trips show holds:
 * a requisition missing information, or a tumor sample that needs more tissue.
 */

/** One unit of the feed's base timing is 30 minutes, so most steps take one to a few hours. */
const UNIT_MS = 1800

const ON_HOLD = 'On Hold: Missing Info'
const MORE_TISSUE = 'More Tissue Requested'

const DNA_CORE: Flow['steps'] = [
  { state: 'DNA Extraction' },
  { state: 'Library Prep', rework: { to: 'DNA Extraction', chance: 0.06 } },
  // Sequencing runs are long, so samples pile up here.
  { state: 'Sequencing', duration: 4, rework: { to: 'Library Prep', chance: 0.08 } },
  { state: 'Analysis' },
  { state: 'Variant Review', duration: 1.5, rework: { to: 'Analysis', chance: 0.1 } },
  { state: 'Report Sign-off', rework: { to: 'Variant Review', chance: 0.05 } },
  { state: 'Reported' },
]

export const LAB_FLOWS: Flow[] = [
  {
    type: { key: 'blood', label: 'Blood (DNA panel)', color: '#e5484d', shape: 'circle' },
    weight: 4,
    steps: [{ state: 'Received' }, { state: 'Accessioning', detour: { state: ON_HOLD, chance: 0.1 } }, ...DNA_CORE],
  },
  {
    type: { key: 'saliva', label: 'Saliva (DNA panel)', color: '#f5a623', shape: 'diamond' },
    weight: 1,
    steps: [{ state: 'Received' }, { state: 'Accessioning', detour: { state: ON_HOLD, chance: 0.18 } }, ...DNA_CORE],
  },
  {
    type: { key: 'tumor', label: 'Tumor tissue (DNA)', color: '#3e8ef7', shape: 'square' },
    weight: 2,
    steps: [
      { state: 'Received' },
      { state: 'Accessioning', detour: { state: ON_HOLD, chance: 0.08 } },
      { state: 'Pathology Review', duration: 1.5, detour: { state: MORE_TISSUE, chance: 0.15 } },
      ...DNA_CORE,
    ],
  },
  {
    type: { key: 'rna', label: 'Tumor tissue (RNA expression)', color: '#30a46c', shape: 'triangle' },
    weight: 2,
    steps: [
      { state: 'Received' },
      { state: 'Accessioning', detour: { state: ON_HOLD, chance: 0.08 } },
      { state: 'Pathology Review', duration: 1.5, detour: { state: MORE_TISSUE, chance: 0.1 } },
      { state: 'RNA Extraction' },
      { state: 'qPCR', duration: 2, rework: { to: 'RNA Extraction', chance: 0.1 } },
      { state: 'Score Calculation' },
      { state: 'Report Sign-off' },
      { state: 'Reported' },
    ],
  },
]

export function labWorldOptions(random: () => number): WorldOptions {
  return {
    walkerTypes: LAB_FLOWS.map((f) => f.type),
    exits: finalStateExits(LAB_FLOWS, 12_000 * UNIT_MS),
    random,
  }
}

const WEEK_MS = 7 * 24 * 3600_000

/** Which lab shift is on: day 7am-3pm, evening 3pm-11pm, night 11pm-7am. */
function labShift(ms: number): string {
  const hour = new Date(ms).getHours()
  if (hour >= 7 && hour < 15) return 'Day shift'
  if (hour >= 15 && hour < 23) return 'Evening shift'
  return 'Night shift'
}

function formatLabClock(ms: number): string {
  return new Date(ms).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

export const labScenario: Scenario = {
  key: 'lab',
  group: 'Work items',
  label: 'Lab samples',
  subtitle: 'Samples moving through a genetic testing lab (made-up data)',
  words: { state: 'Step', states: 'Steps', active: 'In the lab', journey: 'Sample history' },
  timeScale: UNIT_MS,
  defaultSpeed: 2,
  showDone: true,
  restartHint: 'Restart with new samples',
  startTime() {
    // Start on a Monday morning.
    const start = new Date()
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    start.setHours(7, 0, 0, 0)
    return start.getTime()
  },
  worldOptions: labWorldOptions,
  createFeed: (seed, startTime) => new PipelineFeed(seed, startTime, LAB_FLOWS, { meanArrival: 700, unitMs: UNIT_MS }),
  formatClock: formatLabClock,
  bigClock: true,
  timeCaption: labShift,
  // The run starts Monday 7am, so the bar shows how far through the lab's week it is.
  cycle: { lengthMs: WEEK_MS, scale: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'] },
}
