import { describe, it, expect } from 'vitest'
import { filterByDate } from '../analytics'

describe('filterByDate', () => {
  const mk = (d: string) => ({ date: new Date(d) })

  it('includes boundaries', () => {
    const rows = [mk('2025-01-01'), mk('2025-01-15'), mk('2025-01-31')]
    const out = filterByDate(rows, new Date('2025-01-01'), new Date('2025-01-31'))
    expect(out.length).toBe(3)
  })

  it('from-only works', () => {
    const rows = [mk('2025-01-01'), mk('2025-02-01')]
    const out = filterByDate(rows, new Date('2025-02-01'))
    expect(out.length).toBe(1)
  })

  it('to-only works', () => {
    const rows = [mk('2025-01-01'), mk('2025-02-01')]
    const out = filterByDate(rows, undefined, new Date('2025-01-15'))
    expect(out.length).toBe(1)
  })

  it('empty when nothing matches', () => {
    const rows = [mk('2025-01-01')]
    const out = filterByDate(rows, new Date('2026-01-01'), new Date('2026-12-31'))
    expect(out.length).toBe(0)
  })
})

