import { addReview, listAll, bulkModerate } from '../reviews.public.store'

describe('reviews.public.store moderation', () => {
  beforeEach(() => localStorage.clear())
  it('filters, paginates and bulk moderates', () => {
    for (let i=0;i<30;i++) addReview({ breederId: 'B1', author:{ name:'x' }, rating: (i%5+1) as any, text: 't'+i })
    const page1 = listAll({ breederId:'B1', limit: 20, offset: 0 })
    expect(page1.rows.length).toBe(20)
    const ids = page1.rows.slice(0,5).map(r=> r.id)
    const n = bulkModerate(ids, 'approved')
    expect(n).toBe(5)
    const approved = listAll({ breederId:'B1', status:'approved' }).total
    expect(approved).toBe(5)
  })
})

