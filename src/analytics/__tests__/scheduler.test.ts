import { describe, it, expect } from 'vitest'
import { isDue, nextRunAt } from '../scheduler'

describe('scheduler', () => {
  it('daily due at 09:00', () => {
    const now = new Date('2025-01-02T09:00:00')
    expect(isDue(undefined, 'daily', now)).toBe(true)
    expect(isDue(now.toISOString(), 'daily', now)).toBe(false)
  })
  it('weekly due Monday 09:00', () => {
    const mon = new Date('2025-01-06T09:00:00')
    expect(isDue(undefined, 'weekly', mon)).toBe(true)
  })
  it('monthly due 1st 09:00', () => {
    const first = new Date('2025-02-01T09:00:00')
    expect(isDue(undefined, 'monthly', first)).toBe(true)
  })
  it('nextRunAt advances', () => {
    const now = new Date('2025-01-02T09:00:00')
    expect(nextRunAt(undefined, 'daily', now).getDate()).toBe(3)
  })
})

