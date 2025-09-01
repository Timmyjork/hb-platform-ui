import { describe, it, expect } from 'vitest'
import { parseURL, toURL, loadFilters, saveFilters, defaultFilters } from '../filters'

describe('filters url parse/serialize', () => {
  it('parses and serializes', () => {
    const params = '?from=2025-01-01&to=2025-02-01&breeds=A,B&statuses=Активна&sources=phenotypes'
    const f = parseURL(params)
    const qs = toURL(f)
    expect(qs).toContain('from=2025-01-01')
    expect(qs).toContain('breeds=A%2CB')
  })
})

describe('filters localStorage', () => {
  it('saves and loads', () => {
    localStorage.clear()
    const f = defaultFilters(); f.breeds = ['A']; saveFilters(f)
    const loaded = loadFilters()
    expect(loaded.breeds).toEqual(['A'])
  })
})

