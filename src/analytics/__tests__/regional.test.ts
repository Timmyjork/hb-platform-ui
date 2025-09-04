import { describe, it, expect } from 'vitest'
import { aggregateByRegion, compareToBenchmark, type RegionalMeasure } from '../regional'

describe('regional core', () => {
  it('aggregates with filters and thresholds', () => {
    const now = new Date().toISOString()
    const rows: RegionalMeasure[] = []
    for (let i=0;i<5;i++) rows.push({ regionId: 'R1', beekeeperId: `K${i}`, date: now, si: 80, bv: 1 })
    for (let i=0;i<5;i++) rows.push({ regionId: 'R2', beekeeperId: `K${i}`, date: now, si: 70, bv: 0 })
    const out = aggregateByRegion(rows, { minRecords: 6, minSources: 3 })
    expect(out.find(r=>r.regionId==='R1')).toBeUndefined()
    const out2 = aggregateByRegion(rows, { minRecords: 5, minSources: 3 })
    expect(out2.find(r=>r.regionId==='R1')?.si_avg).toBeCloseTo(80, 5)
  })

  it('half-life influences weights', () => {
    const now = new Date()
    const old = new Date(now.getTime() - 200*24*3600*1000).toISOString()
    const recent = now.toISOString()
    const rows: RegionalMeasure[] = [
      { regionId: 'R', beekeeperId: 'K1', date: old, si: 50, bv: 0 },
      { regionId: 'R', beekeeperId: 'K2', date: recent, si: 90, bv: 2 },
      { regionId: 'R', beekeeperId: 'K3', date: recent, si: 90, bv: 2 },
      { regionId: 'R', beekeeperId: 'K4', date: recent, si: 90, bv: 2 },
      { regionId: 'R', beekeeperId: 'K5', date: recent, si: 90, bv: 2 },
      { regionId: 'R', beekeeperId: 'K6', date: recent, si: 90, bv: 2 },
    ]
    const out = aggregateByRegion(rows, { recencyHalfLifeDays: 120, minRecords: 6, minSources: 3 })
    expect(out[0].si_avg).toBeGreaterThan(80)
  })

  it('compareToBenchmark computes deltas', () => {
    const r = { regionId:'R', n_sources:3, m_records:6, si_avg:85, bv_avg:1.2, confidence:0.8, recency_days:30 } as any
    const b = { regionId:'All', n_sources:10, m_records:50, si_avg:80, bv_avg:1.0, confidence:0.9, recency_days:20 } as any
    const d = compareToBenchmark(r, b)
    expect(d.si_delta).toBeCloseTo(5,1)
    expect(d.bv_delta).toBeCloseTo(0.2,1)
    expect(d.score_delta).toBeGreaterThan(0)
  })
})

