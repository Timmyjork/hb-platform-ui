import type { Listing } from './types'

const LS = 'hb.listings'

function read(): Listing[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Listing[]: [] } catch { return [] } }
function write(rows: Listing[]): Listing[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listActive(): Listing[] { return seedIfEmpty(read()).filter(l => l.status === 'active' && l.qtyAvailable > 0) }
export function listByBreeder(breederId: string): Listing[] { return seedIfEmpty(read()).filter(l => l.breederId === breederId) }
export function get(id: string): Listing | undefined { return seedIfEmpty(read()).find(l => l.id === id) }

export function create(l: Omit<Listing,'id'|'createdAt'|'updatedAt'|'status'|'qtyAvailable'|'seoSlug'> & { qtyTotal: number }): Listing {
  const now = new Date().toISOString()
  const id = cryptoId()
  const seoSlug = buildSlug(l)
  const row: Listing = { ...l, id, createdAt: now, updatedAt: now, status: 'active', qtyAvailable: l.qtyTotal, seoSlug }
  const rows = read(); rows.unshift(row); write(rows)
  return row
}

export function update(id: string, patch: Partial<Listing>): Listing {
  const rows = read(); const idx = rows.findIndex(x => x.id === id); if (idx === -1) throw new Error('not found')
  rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() }
  if (rows[idx].qtyAvailable <= 0) rows[idx].status = 'sold_out'
  write(rows); return rows[idx]
}

export function reserve(id: string, qty: number): void {
  const l = get(id); if (!l) throw new Error('not found')
  if (l.qtyAvailable - qty < 0) throw new Error('insufficient')
  update(id, { qtyAvailable: l.qtyAvailable - qty })
}

export function release(id: string, qty: number): void {
  const l = get(id); if (!l) throw new Error('not found')
  update(id, { qtyAvailable: Math.min(l.qtyTotal, l.qtyAvailable + qty), status: 'active' })
}

function buildSlug(l: { breederId: string; breedCode: string; year: number }): string {
  return `${l.breedCode}-${l.year}-${l.breederId}`.toLowerCase()
}

function cryptoId(): string { try { return 'L_' + Math.random().toString(36).slice(2,8) } catch { return 'L_' + Date.now() } }

function seedIfEmpty(rows: Listing[]): Listing[] {
  if (rows.length) return rows
  const B = ['B1','B2','B3','B4']
  const breeds = ['carnica','carpatica','buckfast','ligustica']
  const regions = ['UA-32','UA-46','UA-51','UA-65']
  for (let i=0;i<8;i++) {
    const breederId = B[i%B.length]
    const motherId = `UA.${1+i%8}.${String(32 + (i%8)).replace(/^0+/,'')}.1.1.2025`
    const breedCode = breeds[i%breeds.length]
    const regionCode = regions[i%regions.length]
    const qtyTotal = 10 + (i%4)
    create({ breederId, motherId, breedCode, regionCode, year: 2025, priceUAH: 800 + i*50, qtyTotal })
  }
  return read()
}
