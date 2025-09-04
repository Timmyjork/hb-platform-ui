import { describe, it, expect } from 'vitest'
import { matchBreed } from '../../constants/breeds'

describe('breed matching', () => {
  it('matches common names and slugs', () => {
    expect(matchBreed('карпатка')).toBe('carpatica')
    expect(matchBreed('Карніка')).toBe('carnica')
    expect(matchBreed('buckfast')).toBe('buckfast')
  })
})

