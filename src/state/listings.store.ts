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

// ——— V18 Listings API (separate storage)
import type { ShopListingV18 as Listing, ListingStatus } from '../types/shop'
import { normalize as slugify } from '../utils/slug'

const LS_V18 = 'hb.v18.listings'
function readV18(): Listing[] { try { const raw = localStorage.getItem(LS_V18); return raw? JSON.parse(raw) as Listing[]: [] } catch { return [] } }
function writeV18(rows: Listing[]): Listing[] { localStorage.setItem(LS_V18, JSON.stringify(rows)); return rows }

export function v18_listListings(filter?: Partial<{ status: ListingStatus; breedCode: string; regionCode: string; q: string }>): Listing[] {
  let rows = readV18()
  if (filter?.status) rows = rows.filter(r => r.status === filter.status)
  if (filter?.breedCode) rows = rows.filter(r => r.breedCode === filter.breedCode)
  if (filter?.regionCode) rows = rows.filter(r => r.regionCode === filter.regionCode)
  if (filter?.q) { const q = filter.q.toLowerCase(); rows = rows.filter(r => r.title.toLowerCase().includes(q) || r.seoSlug.includes(q)) }
  return rows
}
export function v18_getListing(id: string): Listing | null { const row = readV18().find(r => r.id === id || r.seoSlug === id); return row || null }
export function v18_saveListing(l: Listing): void { const rows = readV18(); const i = rows.findIndex(r => r.id===l.id); const now = new Date().toISOString(); const next = { ...l, updatedAt: now, createdAt: l.createdAt || now }; if (i>=0) rows[i]=next; else rows.unshift(next); writeV18(rows) }
export function v18_createListing(input: Omit<Listing,'id'|'createdAt'|'updatedAt'|'seoSlug'|'status'> & { status?: ListingStatus }): Listing {
  const now = new Date().toISOString()
  const id = `L_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
  const status: ListingStatus = input.status || 'active'
  const seoSlug = slugify(`${input.title}-${id.slice(-4)}`)
  const row: Listing = { ...input, id, status, seoSlug, createdAt: now, updatedAt: now }
  const rows = readV18(); rows.unshift(row); writeV18(rows); return row
}
export function v18_updateStock(id: string, delta: number): void { const rows = readV18(); const i = rows.findIndex(r => r.id===id); if (i===-1) return; rows[i] = { ...rows[i], stock: Math.max(0, rows[i].stock + delta), updatedAt: new Date().toISOString(), status: Math.max(0, rows[i].stock + delta)===0? 'soldout': rows[i].status }; writeV18(rows) }
export function v18_pauseListing(id: string): void { const rows = readV18(); const i = rows.findIndex(r => r.id===id); if (i===-1) return; rows[i] = { ...rows[i], status: 'paused', updatedAt: new Date().toISOString() }; writeV18(rows) }
export function v18_archiveListing(id: string): void { const rows = readV18(); const i = rows.findIndex(r => r.id===id); if (i===-1) return; rows[i] = { ...rows[i], status: 'archived', updatedAt: new Date().toISOString() }; writeV18(rows) }
export function v18_seedDemoListings(): void { if (readV18().length) return; const base: Array<Omit<Listing,'id'|'createdAt'|'updatedAt'|'seoSlug'|'status'>> = [
  { breederId:'B1', queenMotherId:'UA.7.45.1.1.2025', title:'Карніка доньки', priceUAH:1200, stock:8, year:2025, breedCode:'1', regionCode:'UA-32' },
  { breederId:'B2', queenMotherId:'UA.2.46.2.1.2025', title:'Карпатка доньки', priceUAH:1000, stock:5, year:2025, breedCode:'2', regionCode:'UA-46' },
]; for (const x of base) v18_createListing(x) }
