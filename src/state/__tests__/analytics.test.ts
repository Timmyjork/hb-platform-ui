import { describe, it, expect } from 'vitest'
import { calcPhenotypeKPI, calcHiveKPI, seriesByMonth, type PhenotypeEntry, type HiveCardEntry } from '../analytics'

describe('analytics aggregates', () => {
  it('calcPhenotypeKPI handles empty', () => {
    const k = calcPhenotypeKPI([])
    expect(k.countQueens).toBe(0)
    expect(k.avgEggsPerDay).toBe(0)
  })

  it('calcHiveKPI averages correctly', () => {
    const items: HiveCardEntry[] = [
      { id: 'a', colonyId: 'C1', date: new Date('2025-01-10'), framesOccupied: 8, broodOpen: 2, broodCapped: 2 },
      { id: 'b', colonyId: 'C1', date: new Date('2025-01-20'), framesOccupied: 10, broodOpen: 3, broodCapped: 1 },
    ]
    const k = calcHiveKPI(items)
    expect(k.countColonies).toBe(1)
    expect(k.avgFramesOccupied).toBeCloseTo(9)
  })

  it('seriesByMonth groups by YYYY-MM', () => {
    const items: PhenotypeEntry[] = [
      { id: 'p1', queenId: 'Q1', date: new Date('2025-03-01'), eggsPerDay: 1000 },
      { id: 'p2', queenId: 'Q2', date: new Date('2025-03-15'), eggsPerDay: 1500 },
      { id: 'p3', queenId: 'Q3', date: new Date('2025-04-01'), eggsPerDay: 2000 },
    ]
    const s = seriesByMonth(items, (e) => e.date, { eggs: (arr) => arr.reduce((a, e) => a + (e.eggsPerDay ?? 0), 0) })
    expect(s.length).toBe(2)
    expect(s[0].month).toBe('2025-03')
  })
})

