import { describe, it, expect, beforeEach } from 'vitest'
import { fromFlat, list, upsertMany, clearAll, type PhenotypeRecord } from '../phenotypes'

describe('phenotypes import', () => {
  beforeEach(() => {
    clearAll()
  })

  it('fromFlat creates nested structure', () => {
    const rec = fromFlat({
      id: 'ph_1',
      'morphology.lengthMm': '10',
      'behavior.hygienicPct': '80',
      'productivity.eggsPerDay': '1000',
    })
    expect(rec.id).toBe('ph_1')
    expect(rec.morphology.lengthMm).toBe(10)
    expect(rec.behavior.hygienicPct).toBe(80)
    expect(rec.productivity.eggsPerDay).toBe(1000)
  })

  it('upsertMany adds and updates by id', () => {
    const a: PhenotypeRecord = fromFlat({ id: 'ph_a', 'morphology.lengthMm': 7 })
    const b: PhenotypeRecord = fromFlat({ id: 'ph_b', 'morphology.lengthMm': 8 })
    const res1 = upsertMany([a, b])
    expect(res1.added).toBe(2)
    expect(list().length).toBe(2)

    const updatedA: PhenotypeRecord = { ...a, morphology: { ...a.morphology, lengthMm: 12 } }
    const res2 = upsertMany([updatedA])
    expect(res2.updated).toBe(1)
    const found = list().find((r) => r.id === 'ph_a')!
    expect(found.morphology.lengthMm).toBe(12)
  })
})

