import { describe, it, expect, beforeEach } from 'vitest'
import { addReview, listByBreeder, updateStatus } from '../store'

describe('reviews store', () => {
  beforeEach(() => { localStorage.clear() })
  it('adds review and auto-moderates', () => {
    const r = addReview({ breederId:'B1', authorId:'U1', rating:5, text:'Чудово!' })
    const list = listByBreeder('B1')
    expect(list.some(x=> x.id === r.id)).toBe(true)
    expect(['published','needs_review']).toContain(r.status)
  })
  it('updates status', () => {
    const r = addReview({ breederId:'B1', authorId:'U1', rating:4, text:'ok' })
    updateStatus(r.id, 'removed')
    expect(listByBreeder('B1').some(x=> x.id === r.id)).toBe(false)
  })
})

