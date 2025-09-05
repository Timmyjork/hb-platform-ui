import { describe, it, expect, beforeEach } from 'vitest'
import { normalizeCode, matchBreed, matchRegion } from '../dictionaries.helpers'
import { saveBreed, saveRegion } from '../../state/dictionaries.store'

describe('dictionaries.helpers', () => {
  beforeEach(() => { localStorage.clear() })
  it('normalizeCode', () => {
    expect(normalizeCode('  Car Ni ca  ')).toBe('car-ni-ca')
    expect(normalizeCode('carnica')).toBe('carnica')
    expect(normalizeCode('A_b@#')).toBe('a-b')
  })
  it('matchBreed and matchRegion are case-insensitive with synonyms', () => {
    saveBreed({ code:'carnica', label:'Карніка', synonyms:['krainka','країнка'], status:'active' })
    saveRegion({ code:'kyivska', label:'Київська область', status:'active' })
    expect(matchBreed('Країнка')).toBe('carnica')
    expect(matchBreed('CARNICA')).toBe('carnica')
    expect(matchRegion('UA-32')).toBe('kyivska')
    expect(matchRegion('Київська область')).toBe('kyivska')
  })
})
