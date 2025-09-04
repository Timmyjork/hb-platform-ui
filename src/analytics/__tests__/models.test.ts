import { describe, it, expect } from 'vitest'
import { forecastBVSI, clamp, type PhenotypeInput, type WhatIfParams } from '../models'

describe('forecastBVSI', () => {
  it('stable forecast without noise', () => {
    const input: PhenotypeInput = {
      honey_kg: 15,
      egg_day: 1400,
      hygienic_pct: 85,
      aggression: 2,
      swarming: 2,
      wintering: 4,
      spring_speed: 4,
      brood_density: 4,
      winter_feed_kg: 6,
    }
    const params: WhatIfParams = { noise: 0 }
    const out = forecastBVSI(input, params)
    expect(out.conf).toBe(1)
    expect(out.si).toBeGreaterThan(40)
    expect(out.bv).toBeGreaterThan(-3)
    expect(out.bv).toBeLessThan(3)
  })

  it('weights and env factors influence result', () => {
    const base: PhenotypeInput = { honey_kg: 10, egg_day: 1200, hygienic_pct: 80, winter_feed_kg: 8, spring_speed: 3, wintering: 3 }
    const noEnv = forecastBVSI(base, { noise: 0.1 })
    const betterFlow = forecastBVSI(base, { env: { nectar_flow: 1.2 }, noise: 0.1 })
    expect(betterFlow.si).toBeGreaterThanOrEqual(noEnv.si)

    const moreHygWeight = forecastBVSI(base, { weights: { hygienic_pct: 1 }, noise: 0.1 })
    const lessHygWeight = forecastBVSI(base, { weights: { hygienic_pct: 0 }, noise: 0.1 })
    expect(moreHygWeight.si).toBeGreaterThanOrEqual(lessHygWeight.si)
  })

  it('clamp boundaries', () => {
    expect(clamp(5, 0, 1)).toBe(1)
    expect(clamp(-5, 0, 1)).toBe(0)
    expect(clamp(0.5, 0, 1)).toBe(0.5)
  })
})
