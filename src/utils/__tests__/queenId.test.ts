import { describe, it, expect } from 'vitest'
import { buildQueenId, parseQueenId, normalizeId } from '../../utils/queenId'

describe('queenId utils', () => {
  it('builds and parses id', () => {
    const id = buildQueenId({ country:'UA', breedCode:'7', unionCode:'45', breederNo:'1', queenNo:'25', year: 2025 })
    expect(id).toBe('UA.7.45.1.25.2025')
    const parts = parseQueenId(id)!
    expect(parts).toEqual({ country:'UA', breedCode:'7', unionCode:'45', breederNo:'1', queenNo:'25', year: 2025 })
  })

  it('fails when any component missing or out of range', () => {
    expect(parseQueenId('UA.7.45.1.0.2025')).toBeNull() // queenNo >=1
    expect(parseQueenId('UA.0.45.1.25.2025')).toBeNull() // lineage 1..99
    expect(parseQueenId('UA.7.0.1.25.2025')).toBeNull() // union 1..9999
    expect(parseQueenId('UA.7.45.0.25.2025')).toBeNull() // breeder 1..9999
    expect(parseQueenId('UA.7.45.1.25.99')).toBeNull() // year must be YYYY
    expect(parseQueenId('PL.7.45.1.25.2025')).toBeNull() // only UA
    expect(parseQueenId('UA.07.45.1.25.2025')).toBeNull() // no leading zeros
    expect(parseQueenId('UA.7.045.1.25.2025')).toBeNull()
    expect(parseQueenId('UA.7.45.01.25.2025')).toBeNull()
    expect(parseQueenId('UA.7.45.1.025.2025')).toBeNull()
    expect(parseQueenId('UA.7.45.1.25  .2025')).toBeNull() // spaces forbidden
  })

  it('round-trips build/parse/normalize', () => {
    const messy = ' ua.7.45.1.25.2025 '\n    const norm = normalizeId(messy)
    expect(norm).toBe('UA.7.45.1.25.2025')
    const parts = parseQueenId(norm)
    expect(parts?.queenNo).toBe('25')
    const rebuilt = buildQueenId(parts!)
    expect(rebuilt).toBe('UA.7.45.1.25.2025')
  })
})
