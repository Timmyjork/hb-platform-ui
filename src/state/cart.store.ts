export type CartItem = { listingId: string; qty: number; price: number }

const LS_KEY = 'hb.cart'

function read(): CartItem[] { try { const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) as CartItem[]: [] } catch { return [] } }
function write(rows: CartItem[]): CartItem[] { localStorage.setItem(LS_KEY, JSON.stringify(rows)); return rows }

export function listCart(): CartItem[] { return read() }
export function addToCart(item: CartItem): CartItem[] {
  const rows = read()
  const idx = rows.findIndex(i => i.listingId === item.listingId)
  if (idx >= 0) rows[idx] = { ...rows[idx], qty: rows[idx].qty + item.qty }
  else rows.push(item)
  return write(rows)
}
export function clearCart() { write([]) }
export function updateQty(listingId: string, qty: number) { const rows = read(); const i = rows.findIndex(r=>r.listingId===listingId); if (i>=0) { rows[i].qty = Math.max(0, qty); write(rows) } }
export function remove(listingId: string) { write(read().filter(r=> r.listingId !== listingId)) }
