import type { Directive } from 'vue'

/**
 * `v-steady-width="key"`: the element may grow but never shrinks, so a box whose text changes all
 * the time (a clock, counts in a legend) doesn't twitch as words and numbers change width. It
 * forgets its width, and fits its content again, when `key` changes (e.g. a new data set) or the
 * window is resized.
 */
interface State {
  key: string
  widest: number
  observer: ResizeObserver
  onResize: () => void
}

const states = new WeakMap<HTMLElement, State>()

function reset(el: HTMLElement, state: State): void {
  state.widest = 0
  el.style.minWidth = ''
}

export const vSteadyWidth: Directive<HTMLElement, unknown> = {
  mounted(el, binding) {
    const state: State = {
      key: JSON.stringify(binding.value ?? null),
      widest: 0,
      observer: new ResizeObserver(() => {
        // Assumes border-box sizing (set globally), so min-width matches the measured width.
        const w = el.getBoundingClientRect().width
        if (w > state.widest + 0.5) {
          state.widest = w
          el.style.minWidth = `${Math.ceil(w)}px`
        }
      }),
      onResize: () => reset(el, state),
    }
    states.set(el, state)
    state.observer.observe(el)
    window.addEventListener('resize', state.onResize)
  },
  updated(el, binding) {
    const state = states.get(el)
    const key = JSON.stringify(binding.value ?? null)
    if (!state || key === state.key) return
    state.key = key
    reset(el, state)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    state.observer.disconnect()
    window.removeEventListener('resize', state.onResize)
    states.delete(el)
  },
}
