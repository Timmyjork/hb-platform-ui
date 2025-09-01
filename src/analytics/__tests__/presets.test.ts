import { describe, it, expect } from 'vitest'
import { loadPresets, savePreset, deletePreset } from '../presets'

describe('analytics presets', () => {
  it('saves and deletes presets', () => {
    localStorage.clear()
    const p = savePreset({ name: 'Test', fromMonth: '2025-01', toMonth: '2025-02', sources: { phenotypes: true, hivecards: false } })
    expect(loadPresets().length).toBe(1)
    deletePreset(p.id)
    expect(loadPresets().length).toBe(0)
  })
})

