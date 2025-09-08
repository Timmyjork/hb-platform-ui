import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Ensure trailing slash for base
const BASE = ((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BASE || '/').replace(/\/?$/, '/')

export default defineConfig({
  // Base path for GitHub Pages (or custom) deploys
  base: BASE,
  define: {
    __BUILD_SHA__: JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_SHA?.slice(0, 7)) || ''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_APP_VERSION) || ''),
    'import.meta.env.VITE_APP_PROGRESS': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_APP_PROGRESS) || ''),
    'import.meta.env.VITE_APP_CHANNEL': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_APP_CHANNEL) || ''),
    'import.meta.env.VITE_APP_COMMIT': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_APP_COMMIT) || ''),
    'import.meta.env.VITE_APP_BUILT_AT': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_APP_BUILT_AT) || new Date().toISOString()),
  },
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
