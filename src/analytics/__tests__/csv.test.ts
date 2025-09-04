import { describe, it, expect, vi } from 'vitest'
import { toCsvRow, downloadCsv } from '../csv'

describe('csv utils', () => {
  it('toCsvRow escapes fields', () => {
    const row = toCsvRow({
      input: { breed: 'A,B"C', honey_kg: 10 },
      params: { noise: 0.2, env: { nectar_flow: 1, disease_risk: 1, winter_severity: 1 }, weights: { honey_kg: 0.5 } },
      out: { si: 80.5, bv: 1.2, conf: 0.8, notes: ['ok'] },
    })
    expect(row).toContain('"A,B""C"')
  })

  it('downloadCsv builds a blob via export util', () => {
    if (typeof URL.createObjectURL !== 'function') {
      // @ts-expect-error polyfill for jsdom
      URL.createObjectURL = (() => 'blob://mock') as any
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      // @ts-expect-error polyfill for jsdom
      URL.revokeObjectURL = (() => {}) as any
    }
    const createURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test')
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const append = vi.spyOn(document.body, 'appendChild')
    const a = document.createElement('a')
    const createEl = vi.spyOn(document, 'createElement').mockReturnValue(a as any)
    downloadCsv(['a,b', '1,2'], 't.csv')
    expect(createURL).toHaveBeenCalled()
    expect(revokeURL).toHaveBeenCalled()
    expect(append).toHaveBeenCalled()
    createURL.mockRestore(); revokeURL.mockRestore(); append.mockRestore(); createEl.mockRestore()
  })
})
