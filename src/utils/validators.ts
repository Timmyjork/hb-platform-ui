import { matchBreed as matchBreedDict, matchRegion as matchRegionDict } from '../utils/dictionaries.helpers'

export function isNonEmpty(s?: string): boolean { return !!(s && s.trim().length > 0) }
export function isIntInRange(v: unknown, min: number, max: number): boolean {
  const n = Number(v)
  return Number.isInteger(n) && n >= min && n <= max
}
export const matchBreed = matchBreedDict
export const matchRegion = matchRegionDict

