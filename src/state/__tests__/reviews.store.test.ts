import { describe, it, expect, beforeEach } from 'vitest'
import { addReview, listReviews, setReviewStatus } from '../reviews.store'

describe('state/reviews.store', () => {
  beforeEach(() => { localStorage.clear() })
  it('adds review with pending status by default', () => {
    const r = addReview({ breederId:'B1', authorUserId:'U1', rating:5, text:'ok' })
    expect(r.status).toBe('pending')
    const list = listReviews('B1', 'pending')
    expect(list.some(x=> x.id===r.id)).toBe(true)
  })
  it('updates status and filters by status', () => {
    const r = addReview({ breederId:'B1', authorUserId:'U1', rating:4, text:'ok' })
    setReviewStatus('B1', r.id, 'approved')
    expect(listReviews('B1', 'approved').some(x=> x.id===r.id)).toBe(true)
    expect(listReviews('B1', 'pending').some(x=> x.id===r.id)).toBe(false)
  })
})

