import type { BreederProfile } from '../types/breederProfile'

export function breederProfileToJSONLD(p: BreederProfile, opts?: { ratingAggregate?: { ratingValue: number; reviewCount: number } | null }): object {
  const rating = opts?.ratingAggregate
  const out: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: p.displayName,
    url: (import.meta as any).env?.PUBLIC_BASE_URL || '',
    areaServed: p.regionCode,
    brand: p.breedDefault,
  }
  if (rating && rating.reviewCount > 0) out.aggregateRating = { '@type': 'AggregateRating', ratingValue: rating.ratingValue, reviewCount: rating.reviewCount }
  return out
}
