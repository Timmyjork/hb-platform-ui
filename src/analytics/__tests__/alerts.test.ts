import { describe, it, expect } from 'vitest'
import { detectAnomalies, movingAverage, zScore, decayWeight, type AlertRule } from '../alerts'

function mkSeries(vals: number[]) {
  const now = new Date()
  return vals.map((v,i)=> ({ at: new Date(now.getFullYear(), now.getMonth(), now.getDate()-(vals.length-i)).toISOString(), value: v }))
}

describe('alerts core', () => {
  it('threshold triggers', () => {
    const s = mkSeries([10, 20, 29, 30, 31])
    const rule: AlertRule = { id:'r1', title:'t', scope:'global', metric:'si', mode:'threshold', threshold: 30, enabled: true }
    const out = detectAnomalies(s, rule)
    expect(out.some(x=> x.kind==='critical')).toBe(true)
  })

  it('zscore triggers with large deviation', () => {
    const s = mkSeries([10, 10, 11, 9, 50])
    const rule: AlertRule = { id:'r2', title:'t', scope:'global', metric:'si', mode:'zscore', z: 2, minRecords: 3, enabled: true }
    const out = detectAnomalies(s, rule)
    expect(out.length).toBeGreaterThan(0)
  })

  it('moving average delta triggers', () => {
    const s = mkSeries([10, 10, 10, 10, 30])
    const rule: AlertRule = { id:'r3', title:'t', scope:'global', metric:'si', mode:'ma-delta', maWindow: 3, deltaPct: 50, minRecords: 3, enabled: true }
    const out = detectAnomalies(s, rule)
    expect(out.length).toBeGreaterThan(0)
  })

  it('half-life affects weighting and minRecords blocks noise', () => {
    const s = mkSeries([10])
    const rule: AlertRule = { id:'r4', title:'t', scope:'global', metric:'si', mode:'zscore', z: 1, minRecords: 3, halfLifeDays: 90, enabled: true }
    const out = detectAnomalies(s, rule)
    expect(out.length).toBe(0)
    expect(decayWeight(90, 90)).toBeCloseTo(0.5, 2)
    expect(Number.isFinite(zScore(1, 1, 0))).toBe(true)
    const ma = movingAverage(mkSeries([1,2,3,4]), 2)
    expect(ma[3].value).toBeCloseTo(3.5, 1)
  })
})

