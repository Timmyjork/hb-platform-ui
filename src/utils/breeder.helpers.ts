import { listReviews } from '../state/reviews.store'
import type { BreederId } from '../types/breederProfile'

export function getBreederAggregateRating(breederId: BreederId): { ratingValue: number; reviewCount: number } | null {
  const rows = listReviews(breederId)
  const n = rows.length
  if (!n) return null
  const avg = rows.reduce((s,r)=> s + (Number(r.rating)||0), 0) / n
  return { ratingValue: Math.round(avg * 10) / 10, reviewCount: n }
}
