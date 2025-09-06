import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path for GitHub Pages (or custom) deploys
  base: (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BASE || '/',
  define: {
    __BUILD_SHA__: JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_SHA?.slice(0, 7)) || ''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_SHA) || ((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_GIT_SHA) || ''),
    'import.meta.env.VITE_BUILD_NUM': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_RUN_NUMBER) || ((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BUILD_NUM) || ''),
    'import.meta.env.VITE_BUILD_AT': JSON.stringify(((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BUILD_AT) || new Date().toISOString()),
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
