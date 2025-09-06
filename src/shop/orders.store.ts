import type { Order as V2Order, OrderItem as V2Item, OrderStatus } from './orders.types'
import type { Order as FlowOrder } from './types'
import { reserve as reserveListing } from './listings.store'
import { getCart as getCartStore, cart as cartStore } from './cart.store'
import { processPaidOrder } from './flow'

const LS = 'hb.shop.orders.v2'

function read(): V2Order[] {
  try { const raw = localStorage.getItem(LS); return raw ? (JSON.parse(raw) as V2Order[]) : [] } catch { return [] }
}
function write(rows: V2Order[]): V2Order[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

function totalOf(items: V2Item[]): number { return items.reduce((s,i)=> s + i.qty * i.price, 0) }

export function listBuyerOrders(buyerId: string): V2Order[] { return read().filter(o=> o.buyerId===buyerId) }
export function listBreederOrders(breederId: string): V2Order[] { return read().filter(o => o.items.some(it => it.breederId === breederId)) }

export function createOrderFromCart(buyerId: string, contact: V2Order['contact']): V2Order {
  const cart = getCartStore()
  const items: V2Item[] = cart.map((c, idx) => ({
    id: `I${Date.now()}_${idx}`,
    listingId: c.listingId,
    title: c.title,
    price: Number((c as any).priceUAH ?? (c as any).price ?? 0),
    qty: c.qty,
    breederId: (c as any).sellerId || (c as any).breederId || 'B1',
  }))
  const now = new Date().toISOString()
  const order: V2Order = { id: `ORD_${Date.now()}`, buyerId, status: 'pending', items, total: totalOf(items), contact, createdAt: now }
  const rows = read(); rows.unshift(order); write(rows)
  cartStore.clear()
  return order
}

export function markPaid(orderId: string): V2Order | null {
  const rows = read(); const i = rows.findIndex(o=> o.id===orderId); if (i===-1) return null
  const now = new Date().toISOString(); rows[i] = { ...rows[i], status:'paid' as OrderStatus, paidAt: now }
  write(rows); return rows[i]
}

export async function transferOrder(orderId: string): Promise<V2Order | null> {
  const rows = read(); const i = rows.findIndex(o=> o.id===orderId); if (i===-1) return null
  // Build flow order for passport issuance and transfer
  const flow: FlowOrder = {
    id: rows[i].id,
    buyerId: rows[i].buyerId,
    items: rows[i].items.map(it => ({ listingId: it.listingId, qty: it.qty, priceUAH: it.price })),
    subtotalUAH: rows[i].total,
    status: 'paid',
    payment: { status: 'succeeded', method: 'mock' },
    passports: [],
    createdAt: rows[i].createdAt,
    updatedAt: new Date().toISOString(),
  }
  const issued = await processPaidOrder(flow)
  // Reduce stock on transfer for MVP safety
  for (const it of rows[i].items) { try { reserveListing(it.listingId, it.qty) } catch (_e) { /* ignore */ } }
  // Attach queenIds
  const perItem: Record<string,string[]> = {}
  for (const q of issued) {
    const anyItem = rows[i].items[0]
    const key = anyItem?.listingId || 'X'
    perItem[key] = perItem[key] || []; perItem[key].push(q)
  }
  rows[i] = { ...rows[i], status:'transferred', transferredAt: new Date().toISOString(), items: rows[i].items.map(it => ({ ...it, queenIds: perItem[it.listingId] || it.queenIds })) }
  write(rows)
  return rows[i]
}

// Back-compat shims (used by older flows/tests). Keep minimal implementations.
export function listOrdersByBuyer(buyerId: string): any[] { return listBuyerOrders(buyerId) as unknown as any[] }
export function markPaidLegacy(orderId: string, _intentId: string): any { return markPaid(orderId) as any }
export function markPaymentFailed(_orderId: string, _reason: string): any { return null }
