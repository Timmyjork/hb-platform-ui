import { describe, it, expect, beforeEach } from 'vitest'
import { addObservation, listObservationsByQueen } from '../observations.store'

describe('observations.store', () => {
  beforeEach(() => { localStorage.clear() })

  it('adds and lists by queen', () => {
    const o = { queenId: 'UA.7.45.1.25.2025', observerId: 'U1', date: new Date().toISOString(), traits: { honey: 70 }, note: 'good' }
    addObservation(o)
    const rows = listObservationsByQueen('UA.7.45.1.25.2025')
    expect(rows).toHaveLength(1)
    expect(rows[0].note).toBe('good')
  })
})

