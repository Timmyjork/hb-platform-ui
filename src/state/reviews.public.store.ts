import type { Review } from '../types/review.v23'

const LS = 'hb.reviews.public'

function read(): Review[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Review[]: [] } catch { return [] } }
function write(rows: Review[]): Review[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listReviews(breederId: string, filter?: { status?: 'approved'|'pending' }): Review[] {
  let rows = read().filter(r => r.breederId === breederId)
  if (filter?.status) rows = rows.filter(r => r.status === filter.status)
  return rows
}
export function addReview(r: Omit<Review,'id'|'createdAt'|'status'>): Review { const now = new Date().toISOString(); const row: Review = { ...r, id: `RV_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, createdAt: now, status: 'pending' }; const rows = read(); rows.unshift(row); write(rows); return row }
export function moderate(reviewId: string, status: Review['status']): void { const rows = read(); const i = rows.findIndex(r => r.id===reviewId); if (i>=0) { rows[i] = { ...rows[i], status }; write(rows) } }
export function avgRating(breederId: string): number { const rows = listReviews(breederId, { status: 'approved' }); if (!rows.length) return 0; return rows.reduce((s,r)=>s+r.rating,0)/rows.length }

export function bulkModerate(ids: string[], status: Review['status']): number {
  const rows = read()
  let changed = 0
  for (let i = 0; i < rows.length; i++) {
    if (ids.includes(rows[i].id)) { rows[i] = { ...rows[i], status }; changed++ }
  }
  write(rows)
  return changed
}

export function listAll(filter?: { status?: Review['status']; breederId?: string; q?: string; limit?: number; offset?: number; sort?: 'date_desc'|'date_asc'|'rating_desc'|'rating_asc' }): { rows: Review[]; total: number } {
  let rows = read()
  if (filter?.breederId) rows = rows.filter(r => r.breederId === filter.breederId)
  if (filter?.status) rows = rows.filter(r => r.status === filter.status)
  if (filter?.q) {
    const s = filter.q.trim().toLowerCase()
    rows = rows.filter(r => r.text.toLowerCase().includes(s))
  }
  const sort = filter?.sort || 'date_desc'
  rows = [...rows].sort((a,b) => {
    if (sort === 'rating_desc') return (b.rating||0) - (a.rating||0)
    if (sort === 'rating_asc') return (a.rating||0) - (b.rating||0)
    if (sort === 'date_asc') return a.createdAt.localeCompare(b.createdAt)
    return b.createdAt.localeCompare(a.createdAt)
  })
  const total = rows.length
  const offset = filter?.offset || 0
  const limit = filter?.limit || 20
  return { rows: rows.slice(offset, offset + limit), total }
}
