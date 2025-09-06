import type { Listing } from './types'

export type CartItem = {
  listingId: string
  title: string
  priceUAH: number
  sellerId: string
  qty: number
  max: number
}

export type CartState = {
  items: CartItem[]
  add(l: Omit<CartItem, 'qty'>, qty?: number): void
  setQty(listingId: string, qty: number): void
  remove(listingId: string): void
  clear(): void
  totalUAH(): number
}

const LS = 'hb.cart'

function read(): CartItem[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as CartItem[]: [] } catch { return [] } }
function write(rows: CartItem[]): CartItem[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }
function emitChanged() { try { window.dispatchEvent(new CustomEvent('cart:changed')) } catch { /* noop */ } }

export function getCart(): CartItem[] { return read() }

export const cart: CartState = {
  get items() { return read() },
  add(l, qty = 1) {
    const rows = read()
    const i = rows.findIndex(r => r.listingId === l.listingId)
    const nextQty = Math.max(1, Math.min(l.max, (i>=0? rows[i].qty: 0) + qty))
    const next: CartItem = { ...l, qty: nextQty }
    if (i>=0) rows[i] = next; else rows.push(next)
    write(rows); emitChanged()
  },
  setQty(listingId, qty) {
    const rows = read(); const i = rows.findIndex(r=>r.listingId===listingId)
    if (i>=0) {
      const clamped = Math.max(0, Math.min(rows[i].max, qty))
      if (clamped === 0) rows.splice(i,1); else rows[i].qty = clamped
      write(rows); emitChanged()
    }
  },
  remove(listingId) { write(read().filter(r=> r.listingId !== listingId)); emitChanged() },
  clear() { write([]); emitChanged() },
  totalUAH() { return read().reduce((s,r)=> s + r.qty * (Number(r.priceUAH)||0), 0) },
}

// Helper to build CartItem payload from Listing
export function toCartItem(l: Listing): Omit<CartItem,'qty'> {
  const title = `${l.breedCode.toUpperCase()} • ${l.year}`
  return { listingId: l.id, title, priceUAH: l.priceUAH, sellerId: l.breederId, max: l.qtyAvailable }
}
