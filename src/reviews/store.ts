import type { Review, ReviewStatus } from './types'
import { autoModerate } from './moderation'

const LS_KEY = 'hb.reviews'

function read(): Review[] { try { const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) as Review[]: [] } catch { return [] } }
function write(rows: Review[]): Review[] { localStorage.setItem(LS_KEY, JSON.stringify(rows)); return rows }

export function listAll(): Review[] { return seedIfEmpty(read()) }
export function listByBreeder(breederId: string): Review[] { return listAll().filter(r => r.breederId === breederId && r.status !== 'removed') }
export function listByQueen(queenId: string): Review[] { return listAll().filter(r => r.queenId === queenId && r.status !== 'removed') }

export function addReview(r: Omit<Review,'id'|'createdAt'|'status'>): Review {
  const now = new Date().toISOString()
  const status = autoModerate({ ...(r as any), createdAt: now, id: 'tmp' } as Omit<Review,'status'>)
  const row: Review = { ...r, id: `R${Date.now()}_${Math.random().toString(36).slice(2,6)}`, createdAt: now, status }
  const rows = read(); rows.unshift(row); write(rows)
  return row
}

export function updateStatus(id: string, status: ReviewStatus): void {
  const rows = read(); const idx = rows.findIndex(r => r.id === id); if (idx===-1) return; rows[idx].status = status; write(rows)
}

function seedIfEmpty(rows: Review[]): Review[] {
  if (rows.length) return rows
  const now = new Date().toISOString()
  const seed: Review[] = []
  for (let i=0;i<12;i++) seed.push({ id:`R${i}`, breederId: ['B1','B2','B3'][i%3], queenId: undefined, authorId:`U${i}`, rating: (1 + (i%5)) as 1|2|3|4|5, text:`Відгук ${i}`, createdAt: now, status:'published' })
  return write(seed)
}
