import type { CartItem } from './types'

function key(buyerId: string) { return `hb.cart.${buyerId}` }

export function getCart(buyerId: string): CartItem[] { try { const raw = localStorage.getItem(key(buyerId)); return raw? JSON.parse(raw) as CartItem[]: [] } catch { return [] } }
function write(buyerId: string, rows: CartItem[]): CartItem[] { localStorage.setItem(key(buyerId), JSON.stringify(rows)); return rows }

export function add(buyerId: string, listingId: string, qty: number) {
  const rows = getCart(buyerId)
  const i = rows.findIndex(r => r.listingId === listingId)
  if (i>=0) rows[i].qty += qty; else rows.push({ listingId, qty })
  write(buyerId, rows)
}
export function remove(buyerId: string, listingId: string) { write(buyerId, getCart(buyerId).filter(r => r.listingId !== listingId)) }
export function setQty(buyerId: string, listingId: string, qty: number) { const rows = getCart(buyerId); const i = rows.findIndex(r=>r.listingId===listingId); if (i>=0) { rows[i].qty = Math.max(0, qty) }; write(buyerId, rows) }
export function clear(buyerId: string) { localStorage.removeItem(key(buyerId)) }

