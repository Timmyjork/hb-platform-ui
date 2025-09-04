import { describe, it, expect } from 'vitest'
import { aggregateBreeders, decayWeight, zScoreClip, type SourceMeasure } from '../ratings'

describe('ratings core', () => {
  it('stable inputs -> correct averages', () => {
    const rows: SourceMeasure[] = []
    const baseDate = new Date().toISOString()
    for (let i=0;i<10;i++) rows.push({ breederId: 'B1', beekeeperId: `K${i%5}`, date: baseDate, si: 80, bv: 1 })
    const out = aggregateBreeders(rows, { minRecords: 8, minSources: 3 })
    expect(out.length).toBe(1)
    expect(out[0].si_avg).toBeCloseTo(80, 5)
    expect(out[0].bv_avg).toBeCloseTo(1, 5)
  })

  it('recency decay gives more weight to newer', () => {
    const now = new Date()
    const old = new Date(now.getTime() - 200*24*3600*1000).toISOString()
    const recent = now.toISOString()
    const rows: SourceMeasure[] = [
      { breederId: 'B2', beekeeperId: 'K1', date: old, si: 50, bv: 0 },
      { breederId: 'B2', beekeeperId: 'K2', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K3', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K4', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K5', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K6', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K7', date: recent, si: 90, bv: 2 },
      { breederId: 'B2', beekeeperId: 'K8', date: recent, si: 90, bv: 2 },
    ]
    const out = aggregateBreeders(rows, { minRecords: 8, minSources: 3, recencyHalfLifeDays: 120 })
    expect(out[0].si_avg).toBeGreaterThan(80)
  })

  it('outliers reduce score when penaltyOutliers = true', () => {
    const baseDate = new Date().toISOString()
    const normal: SourceMeasure[] = Array.from({length: 10}).map((_,i)=> ({ breederId: 'B3', beekeeperId: `K${i}`, date: baseDate, si: 80, bv: 1 }))
    const withOutlier: SourceMeasure[] = [...normal.slice(0,9), { breederId: 'B3', beekeeperId: 'Kx', date: baseDate, si: 5, bv: -3 }]
    const out1 = aggregateBreeders(normal, { minRecords: 8, minSources: 3 })[0]
    const out2 = aggregateBreeders(withOutlier, { minRecords: 8, minSources: 3, penaltyOutliers: true })[0]
    expect(out2.score).toBeLessThan(out1.score)
  })

  it('thresholds minRecords and minSources', () => {
    const baseDate = new Date().toISOString()
    const few: SourceMeasure[] = [
      { breederId: 'B4', beekeeperId: 'K1', date: baseDate, si: 70, bv: 0 },
      { breederId: 'B4', beekeeperId: 'K1', date: baseDate, si: 70, bv: 0 },
      { breederId: 'B4', beekeeperId: 'K2', date: baseDate, si: 70, bv: 0 },
    ]
    const out = aggregateBreeders(few, { minRecords: 5, minSources: 3 })
    expect(out.length).toBe(0)
  })

  it('decayWeight and zScoreClip helpers', () => {
    expect(decayWeight(0, 120)).toBeCloseTo(1, 5)
    expect(decayWeight(120, 120)).toBeCloseTo(0.5, 2)
    expect(zScoreClip(100, 50, 10, 2)).toBeCloseTo(70, 5)
  })
})

