import { describe, it, expect } from 'vitest'
import { selectFilteredRows, buildCohorts } from '../selectors'

function seed() {
  const phenos = [
    { id: 'p1', queenId: 'Q1', date: '2025-01-10', behavior: { hygienicPct: 80 }, productivity: { eggsPerDay: 1000 }, breed: 'A', status: 'Активна' },
  ]
  localStorage.setItem('phenotypes:data', JSON.stringify(phenos))
  const hives = [
    { id: 'h1', colonyId: 'C1', date: '2025-01-05', framesOccupied: 8, broodOpen: 2, broodCapped: 2, breed: 'A', status: 'Активна' },
    { id: 'h2', colonyId: 'C2', date: '2025-02-05', framesOccupied: 10, broodOpen: 3, broodCapped: 1, breed: 'B', status: 'Архів' },
  ]
  localStorage.setItem('hivecards:data', JSON.stringify(hives))
}

describe('selectors', () => {
  it('selectFilteredRows filters by breeds and sources', () => {
    localStorage.clear(); seed()
    const rows = selectFilteredRows({ breeds: ['A'], statuses: ['Активна'], sources: { phenotypes: true, hivecards: true } })
    expect(rows.length).toBeGreaterThan(0)
    const breeds = new Set(rows.map(r=>r.breed))
    expect(breeds.has('A')).toBe(true)
  })

  it('buildCohorts by breed', () => {
    localStorage.clear(); seed()
    const rows = selectFilteredRows({})
    const cohorts = buildCohorts(rows, 'breed')
    expect(cohorts.length).toBeGreaterThan(0)
  })
})

