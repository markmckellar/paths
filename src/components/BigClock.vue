<script setup lang="ts">
/**
 * A large clock to overlay on the graph. Optionally shows a caption (e.g. "Morning") and,
 * for data that repeats on a cycle, how far through the cycle it is, with scale labels
 * spread evenly under the bar.
 */
defineProps<{
  time: string
  caption?: string
  /** 0..100 through the current cycle; omit to hide the bar. */
  progress?: number
  /** Labels under the bar, spread evenly from start to end. */
  scale?: string[]
}>()
</script>

<template>
  <div class="big-clock" data-graph-overlay role="timer" aria-label="Clock">
    <div class="time">{{ time }}</div>
    <div v-if="caption" class="caption">{{ caption }}</div>
    <template v-if="progress !== undefined">
      <div class="bar" aria-hidden="true">
        <span class="fill" :style="{ width: `${progress}%` }" />
      </div>
      <div v-if="scale?.length" class="scale" aria-hidden="true">
        <span v-for="(s, i) in scale" :key="i">{{ s }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.big-clock {
  position: absolute;
  top: 16px;
  left: 16px;
  min-width: 190px;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  box-shadow: var(--shadow);
  pointer-events: none;
  z-index: 2;
}
.time {
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.caption {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}
.bar {
  position: relative;
  height: 6px;
  margin-top: 10px;
  border-radius: 3px;
  background: var(--surface-2);
  overflow: hidden;
}
.fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 3px;
  background: var(--accent);
}
.scale {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
  font-size: 10px;
  color: var(--text-muted);
}
@media (max-width: 560px) {
  .big-clock {
    top: 8px;
    left: 8px;
    min-width: 0;
    padding: 6px 10px;
  }
  .time {
    font-size: 28px;
  }
  .caption {
    font-size: 12px;
  }
  .bar,
  .scale {
    display: none;
  }
}
</style>
