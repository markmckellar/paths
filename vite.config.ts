import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Relative base so the built demo can be hosted from any sub-path.
  base: './',
  plugins: [vue()],
  test: {
    environment: 'node',
  },
})
