import type { Review } from './types'

const STOP_WORDS = ['spam','fake','scam','лайно']

export function autoModerate(r: Omit<Review,'status'>): Review['status'] {
  const t = (r.text||'').toLowerCase()
  if (!t || t.length < 3) return 'needs_review'
  if (t.length > 2000) return 'flagged'
  if (STOP_WORDS.some(w=> t.includes(w))) return 'flagged'
  return 'published'
}
