// Vitest setup: add jest-dom matchers and reset DOM between tests
import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver for Recharts ResponsiveContainer in jsdom
;(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

import { vi } from 'vitest'

// Безпечні заглушки навігації для jsdom
Object.defineProperty(window, 'location', {
  value: { ...window.location, assign: vi.fn(), replace: vi.fn(), href: '/' },
  writable: true,
})

// Не дозволяємо "клік" спричиняти навігацію у jsdom
vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

// Моки для URL.createObjectURL / revokeObjectURL (у jsdom їх може не бути)
if (typeof (URL as any).createObjectURL !== 'function') {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:mock')
} else {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
}

if (typeof (URL as any).revokeObjectURL !== 'function') {
  ;(URL as any).revokeObjectURL = vi.fn()
} else {
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
}

// На всяк випадок — вимикаємо window.open, якщо десь викликається
vi.spyOn(window, 'open').mockImplementation(() => null as any)
// Stub alert in jsdom environment
vi.spyOn(window, 'alert').mockImplementation(() => {})

// Provide non-zero layout sizes for Recharts in jsdom
// ResponsiveContainer relies on offsetWidth/offsetHeight
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() { return 800 },
})
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() { return 400 },
})

// Fallback for libraries that use getBoundingClientRect for size
// Return a consistent non-zero rect to keep ResponsiveContainer happy
HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    x: 0,
    y: 0,
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    right: 800,
    bottom: 400,
    toJSON() { return this }
  } as DOMRect
}
