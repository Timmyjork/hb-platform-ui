import type { BreederId, Review, ReviewId } from '../types/breederProfile'

const LS = 'hb.reviews'

function read(): Review[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Review[]: seed() } catch { return seed() } }
function write(rows: Review[]): Review[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listReviews(breederId: BreederId, status?: Review['status']): Review[] {
  const rows = read().filter(r=> r.breederId === breederId)
  return status ? rows.filter(r => r.status === status) : rows
}
export function addReview(r: Omit<Review,'id'|'createdAt'|'status'>): Review {
  const now = new Date().toISOString()
  const rating = Math.max(1, Math.min(5, Number(r.rating)))
  const row: Review = { ...r, id: `RV_${Math.random().toString(36).slice(2,8)}`, rating, createdAt: now, status: 'pending' }
  const rows = read(); rows.unshift(row); write(rows)
  return row
}
export function deleteReview(breederId: BreederId, reviewId: ReviewId): void {
  const rows = read().filter(r=> !(r.breederId===breederId && r.id===reviewId))
  write(rows)
}
export function setReviewStatus(breederId: BreederId, reviewId: ReviewId, status: Review['status']): void {
  const rows = read()
  const idx = rows.findIndex(r=> r.breederId===breederId && r.id===reviewId)
  if (idx===-1) return
  rows[idx] = { ...rows[idx], status }
  write(rows)
}

function seed(): Review[] {
  const now = new Date().toISOString()
  const rows: Review[] = [
    { id:'RV1', breederId:'B1', authorUserId:'U1', authorDisplay:'Buyer 1', rating:5, text:'Дуже задоволений', createdAt: now, verifiedPurchase:true, status:'approved' },
    { id:'RV2', breederId:'B1', authorUserId:'U2', authorDisplay:'Buyer 2', rating:4, text:'Гарна якість', createdAt: now, status:'pending' },
    { id:'RV3', breederId:'B2', authorUserId:'U3', authorDisplay:'Buyer 3', rating:3, text:'Середньо', createdAt: now, status:'approved' },
  ]
  return write(rows)
}
