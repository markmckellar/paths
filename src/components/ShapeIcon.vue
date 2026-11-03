<script setup lang="ts">
import type { WalkerShape } from '../engine/types'

withDefaults(defineProps<{ shape: WalkerShape; color: string; size?: number }>(), { size: 12 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 12 12" aria-hidden="true" class="shape">
    <circle v-if="shape === 'circle'" cx="6" cy="6" r="4.6" :fill="color" />
    <rect v-else-if="shape === 'square'" x="1.8" y="1.8" width="8.4" height="8.4" :fill="color" />
    <polygon v-else-if="shape === 'triangle'" points="6,1 11,10.4 1,10.4" :fill="color" />
    <polygon v-else points="6,0.8 11.2,6 6,11.2 0.8,6" :fill="color" />
  </svg>
</template>

<style scoped>
.shape {
  flex: none;
  display: inline-block;
  vertical-align: -1px;
}
.shape > * {
  stroke: var(--walker-stroke);
  stroke-width: 0.8;
}
</style>
