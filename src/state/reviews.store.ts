import type { BreederId, Review, ReviewId } from '../types/breederProfile'

const LS = 'hb.reviews'

function read(): Review[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Review[]: seed() } catch { return seed() } }
function write(rows: Review[]): Review[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listReviews(breederId: BreederId): Review[] { return read().filter(r=> r.breederId === breederId) }
export function addReview(r: Omit<Review,'id'|'createdAt'>): Review {
  const now = new Date().toISOString()
  const rating = Math.max(1, Math.min(5, Number(r.rating)))
  const row: Review = { ...r, id: `RV_${Math.random().toString(36).slice(2,8)}`, rating, createdAt: now }
  const rows = read(); rows.unshift(row); write(rows)
  return row
}
export function deleteReview(breederId: BreederId, reviewId: ReviewId): void {
  const rows = read().filter(r=> !(r.breederId===breederId && r.id===reviewId))
  write(rows)
}

function seed(): Review[] {
  const now = new Date().toISOString()
  const rows: Review[] = [
    { id:'RV1', breederId:'B1', authorUserId:'U1', authorDisplay:'Buyer 1', rating:5, text:'Дуже задоволений', createdAt: now, verifiedPurchase:true },
    { id:'RV2', breederId:'B1', authorUserId:'U2', authorDisplay:'Buyer 2', rating:4, text:'Гарна якість', createdAt: now },
    { id:'RV3', breederId:'B2', authorUserId:'U3', authorDisplay:'Buyer 3', rating:3, text:'Середньо', createdAt: now },
  ]
  return write(rows)
}
