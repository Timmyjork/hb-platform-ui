import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path for GitHub Pages (or custom) deploys
  base: (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BASE || '/',
  plugins: [react()],
  // Vitest config
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: { reporter: ['text', 'lcov'] },
  },
})
