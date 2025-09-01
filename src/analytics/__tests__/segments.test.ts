import { describe, it, expect } from 'vitest'
import { buildSegments } from '../segments'

describe('buildSegments', () => {
  const rows = [
    { date: new Date('2025-01-01'), breed: 'A', status: 'Активна', source: 'hive' },
    { date: new Date('2025-01-02'), breed: 'A', status: 'Активна', source: 'phenotypes' },
    { date: new Date('2025-02-01'), breed: 'B', status: 'Архів', source: 'hive' },
  ] as Array<{date: Date; breed?: string; status?: string; source: 'hive'|'phenotypes'}>

  it('groups by single dimension', () => {
    const segs = buildSegments(rows, { groupBy: ['breed'] })
    expect(segs.find(s=>s.key==='A')).toBeTruthy()
  })
  it('groups by multiple dimensions', () => {
    const segs = buildSegments(rows, { groupBy: ['breed','status'] })
    expect(segs.find(s=>s.key==='A / Активна')).toBeTruthy()
  })
})
