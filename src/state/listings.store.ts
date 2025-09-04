import type { TenTraits, QueenId } from '../types/queen'
import { listQueens, addQueensBatch, transferOwnership } from './queens.store'

export type QueenListing = {
  listingId: string
  breederUserId: string
  motherId: QueenId
  stock: number
  price: number
  breedCode: number
  unionCode: number
  year: number
  traits?: TenTraits
  createdAt: string
  active: boolean
}

const LS_KEY = 'hb.listings'

function read(): QueenListing[] {
  try { const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) as QueenListing[]: [] } catch { return [] }
}
function write(rows: QueenListing[]): QueenListing[] { localStorage.setItem(LS_KEY, JSON.stringify(rows)); return rows }

export function listListings(): QueenListing[] { return read() }

export function createListing(l: Omit<QueenListing, 'listingId'|'createdAt'|'active'>): QueenListing {
  const now = new Date().toISOString()
  const listing: QueenListing = { ...l, listingId: `L${Date.now()}`, createdAt: now, active: true }
  const rows = read(); rows.unshift(listing); write(rows)
  return listing
}

export function fulfillListing(listingId: string, buyerUserId: string, qty: number): string[] {
  const q = listQueens()
  const listing = read().find(x => x.listingId === listingId)
  if (!listing) return []
  // Find daughters of motherId without owner
  const available = q.filter(x => x.motherId === listing.motherId && !x.ownerUserId)
  const taken: string[] = []
  let remaining = qty
  for (const d of available) {
    if (remaining <= 0) break
    const t = transferOwnership(d.id, buyerUserId)
    if (t) { taken.push(t.id); remaining-- }
  }
  if (remaining > 0) {
    // Create missing daughters and transfer immediately
    const baseParts = { country: 'UA' as const, breedCode: String(listing.breedCode), unionCode: String(listing.unionCode), breederNo: '1', year: listing.year }
    const created = addQueensBatch({ count: remaining, startQueenNo: 2, country: 'UA', breedCode: baseParts.breedCode, unionCode: baseParts.unionCode, breederNo: baseParts.breederNo, year: baseParts.year, baseTraits: listing.traits || { honey:60,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, breederId: listing.breederUserId, motherId: listing.motherId, status: 'listed' })
    for (const c of created) {
      const t = transferOwnership(c.id, buyerUserId)
      if (t) taken.push(t.id)
    }
  }
  return taken
}

