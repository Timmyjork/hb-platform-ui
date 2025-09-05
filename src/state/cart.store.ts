export type CartItem = { listingId: string; qty: number; price: number }

const LS_KEY = 'hb.cart'

// Legacy global cart (kept for compatibility)
function readGlobal(): CartItem[] { try { const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) as CartItem[]: [] } catch { return [] } }
function writeGlobal(rows: CartItem[]): CartItem[] { localStorage.setItem(LS_KEY, JSON.stringify(rows)); return rows }
export function listCart(): CartItem[] { return readGlobal() }
export function addToCart(item: CartItem): CartItem[] {
  const rows = readGlobal()
  const idx = rows.findIndex(i => i.listingId === item.listingId)
  if (idx >= 0) rows[idx] = { ...rows[idx], qty: rows[idx].qty + item.qty }
  else rows.push(item)
  return writeGlobal(rows)
}
export function clearCart() { writeGlobal([]) }
export function updateQty(listingId: string, qty: number) { const rows = readGlobal(); const i = rows.findIndex(r=>r.listingId===listingId); if (i>=0) { rows[i].qty = Math.max(0, qty); writeGlobal(rows) } }
export function remove(listingId: string) { writeGlobal(readGlobal().filter(r=> r.listingId !== listingId)) }

// V18 per-user cart API
function keyFor(userId: string) { return `${LS_KEY}.${userId}` }
function read(userId: string): CartItem[] { try { const raw = localStorage.getItem(keyFor(userId)); return raw? JSON.parse(raw) as CartItem[]: [] } catch { return [] } }
function write(userId: string, rows: CartItem[]): CartItem[] { localStorage.setItem(keyFor(userId), JSON.stringify(rows)); return rows }

export function getCart(userId: string): CartItem[] { return read(userId) }
export function addToCartByUser(userId: string, listingId: string, qty: number): void {
  const rows = read(userId)
  const i = rows.findIndex(r => r.listingId === listingId)
  if (i>=0) rows[i].qty = rows[i].qty + qty; else rows.push({ listingId, qty, price: 0 })
  write(userId, rows)
}
export function setQty(userId: string, listingId: string, qty: number): void {
  const rows = read(userId)
  const i = rows.findIndex(r => r.listingId === listingId)
  if (i>=0) { if (qty<=0) rows.splice(i,1); else rows[i].qty = qty; write(userId, rows) }
}
export function clearCartByUser(userId: string): void { write(userId, []) }
