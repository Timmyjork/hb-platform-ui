export type Listing = {
  id: string; queenId: string; breederId: string;
  price: number; currency:'UAH'|'EUR';
  availableQty: number; active: boolean; title?: string;
}

const LS = 'hb.listings.v22'

function read(): Listing[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Listing[]: [] } catch { return [] } }
function write(rows: Listing[]): Listing[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listListings(): Listing[] { return read() }
export function listActiveListings(): Listing[] { return read().filter(l => l.active && l.availableQty > 0) }
export function createListing(l: Omit<Listing,'id'>): Listing { const now = Date.now(); const row: Listing = { ...l, id: `L22_${now}_${Math.random().toString(36).slice(2,6)}` }; const rows = read(); rows.unshift(row); write(rows); return row }
export function updateListing(l: Listing): void { const rows = read(); const i = rows.findIndex(x => x.id === l.id); if (i>=0) rows[i]=l; else rows.unshift(l); write(rows) }
export function decrementStock(listingId: string, qty: number): void { const rows = read(); const i = rows.findIndex(x => x.id === listingId); if (i===-1) return; const left = Math.max(0, (rows[i].availableQty||0) - Math.max(0, qty)); rows[i] = { ...rows[i], availableQty: left }; write(rows) }

