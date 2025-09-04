import { describe, it, expect } from 'vitest'
import { traitsToSI_BV } from '../traits'

describe('traitsToSI_BV', () => {
  it('produces reasonable si/bv', () => {
    const { si, bv } = traitsToSI_BV({
      honey:80, winter:60, temperament:60, calmOnFrames:60, swarming:60,
      hygienic:70, varroaResist:60, springBuildUp:60, colonyStrength:60, broodFrames:6
    })
    expect(si).toBeGreaterThan(0)
    expect(bv).toBeTypeOf('number')
  })
})
