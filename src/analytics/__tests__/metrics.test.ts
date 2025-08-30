import { describe, it, expect } from 'vitest'
import { movingAvg, percentile } from '../metrics'

describe('metrics helpers', () => {
  it('movingAvg window=3', () => {
    expect(movingAvg([1,2,3,4], 3)).toEqual([1,1.5,2,3])
  })
  it('percentile handles empty and bounds', () => {
    expect(percentile([], 50)).toBe(0)
    expect(percentile([1,2,3,4], 0)).toBe(1)
    expect(percentile([1,2,3,4], 100)).toBe(4)
  })
})

