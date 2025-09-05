import { audit, listAudit } from '../admin.audit.store'

describe('admin.audit.store', () => {
  beforeEach(() => localStorage.clear())
  it('appends and filters', () => {
    audit('review.moderate', { id:'R1' })
    audit('qa.publish', { id:'Q1' })
    const all = listAudit({})
    expect(all.total).toBe(2)
    const filtered = listAudit({ q: 'review' })
    expect(filtered.total).toBe(1)
  })
})

