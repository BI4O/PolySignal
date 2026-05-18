import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    env: {
      NEXT_PUBLIC_LANGGRAPH_GRAPH_ID: 'test-graph',
      NEXT_PUBLIC_LANGGRAPH_HOST: 'localhost',
      NEXT_PUBLIC_LANGGRAPH_PORT: '2024',
    },
  },
})
