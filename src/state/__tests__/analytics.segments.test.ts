import { describe, it, expect } from 'vitest'
import { uniqueValues, applySegments } from '../analytics'

type T = { breed?: string; status?: string }

describe('segments helpers', () => {
  it('uniqueValues returns sorted uniques', () => {
    const rows: T[] = [{ breed: 'A' }, { breed: 'B' }, { breed: 'A' }, {}]
    expect(uniqueValues(rows, 'breed')).toEqual(['A','B'])
  })

  it('applySegments filters by breed and status', () => {
    const rows: T[] = [
      { breed: 'A', status: 'Активна' },
      { breed: 'B', status: 'Архів' },
      { breed: 'A', status: 'Архів' },
    ]
    const out = applySegments(rows, { breeds: ['A'], statuses: ['Архів'] })
    expect(out.length).toBe(1)
    expect(out[0]).toEqual({ breed: 'A', status: 'Архів' })
  })
})

