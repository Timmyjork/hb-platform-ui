export type Order = {
  orderId: string
  buyerUserId: string
  items: { listingId: string; qty: number; price: number }[]
  status: 'new'|'paid'|'transferred'|'cancelled'
  createdAt: string
}

const LS_KEY = 'hb.orders'

function read(): Order[] { try { const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) as Order[]: [] } catch { return [] } }
function write(rows: Order[]): Order[] { localStorage.setItem(LS_KEY, JSON.stringify(rows)); return rows }

export function listOrders(): Order[] { return read() }

export function placeOrder(buyerUserId: string, items: Order['items']): Order {
  const now = new Date().toISOString()
  const order: Order = { orderId: `O${Date.now()}`, buyerUserId, items, status: 'new', createdAt: now }
  const rows = read(); rows.unshift(order); write(rows)
  return order
}

import { fulfillListing } from './listings.store'
import { sendTransferEmail } from '../analytics/transports'

export function payOrder(orderId: string): { transferred: string[] } {
  const rows = read()
  const idx = rows.findIndex(o => o.orderId === orderId)
  if (idx === -1) return { transferred: [] }
  rows[idx].status = 'paid'
  write(rows)
  const order = rows[idx]
  const transferred: string[] = []
  for (const it of order.items) {
    const ids = fulfillListing(it.listingId, order.buyerUserId, it.qty)
    transferred.push(...ids)
  }
  // send stub email per transferred queen
  for (const id of transferred) {
    void sendTransferEmail('art1991tj@gmail.com', { queenId: id, seller: 'breeder', buyer: order.buyerUserId })
  }
  rows[idx].status = 'transferred'
  write(rows)
  return { transferred }
}

// ——— V18 API (separate keys to avoid breaking legacy)
import type { Order as V18Order, OrderStatus } from '../types/order'
import { getCart as getCartByUser, clearCartByUser } from './cart.store'
import { listListings as listLegacy, reduceStock as reduceStockLegacy } from './shop.store'
import { issueInvoice, getInvoiceByOrder, createPaymentIntent } from '../payments/store'
import { append as auditAppend } from '../audit/log'
import { deliverEmail } from '../analytics/transports'

const LS_V18 = 'hb.orders.v18'
function readV18(): V18Order[] { try { const raw = localStorage.getItem(LS_V18); return raw? JSON.parse(raw) as V18Order[]: [] } catch { return [] } }
function writeV18(rows: V18Order[]): V18Order[] { localStorage.setItem(LS_V18, JSON.stringify(rows)); return rows }

export function listOrdersByBuyer(buyerId: string): V18Order[] { return readV18().filter(o => o.buyerId===buyerId) }
export function listOrdersByBreeder(breederId: string): V18Order[] { return readV18().filter(o => o.breederId===breederId) }
export function getOrder(id: string): V18Order | null { return readV18().find(o => o.id===id) || null }

export function createOrderFromCart(userId: string): V18Order {
  const cart = getCartByUser(userId)
  // derive seller from first listing
  const listings = listLegacy()
  const first = listings.find(l => l.listingId === cart[0]?.listingId)
  const breederId = first?.sellerId || 'B1'
  // check stock and reserve
  for (const it of cart) { reduceStockLegacy(it.listingId, it.qty) }
  const now = new Date().toISOString()
  const items = cart.map(it => ({ listingId: it.listingId, quantity: it.qty, unitPriceUAH: it.price }))
  const subtotal = items.reduce((s,it)=> s + (Number(it.unitPriceUAH)||0) * (Number(it.quantity)||0), 0)
  const order: V18Order & { reserveExpiresAt?: string } = { id:`O_${Date.now()}`, buyerId: userId, breederId, items, subtotalUAH: subtotal, status:'awaiting_payment', createdAt: now, updatedAt: now, reserveExpiresAt: new Date(Date.now()+30*60*1000).toISOString() }
  const rows = readV18(); rows.unshift(order); writeV18(rows)
  clearCartByUser(userId)
  auditAppend({ type:'order.created', orderId: order.id, by: userId, at: now })
  auditAppend({ type:'stock.reserve', orderId: order.id, items: items.map(i=>({ listingId:i.listingId, qty:i.quantity })), ttlSec: 1800, at: now })
  // Notify buyer/seller (mock)
  void deliverEmail('buyer@example.com', `[HB] Замовлення №${order.id.slice(-6)}: створено`, `Створено замовлення ${order.id}`)
  void deliverEmail('seller@example.com', `[HB] Замовлення №${order.id.slice(-6)}: створено`, `Нове замовлення ${order.id}`)
  return order
}

export function markPaid(orderId: string): void { setStatus(orderId,'paid') }
export function transferOrder(orderId: string): void {
  const rows = readV18(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return
  // perform transfer using legacy fulfill to generate and transfer daughters with basic lock
  const order = rows[i]
  auditAppend({ type:'ownership.transfer.requested', orderId, by: order.buyerId, at: new Date().toISOString() })
  const lockKey = `hb.lock.${order.breederId}`
  let attempts = 0
  while (localStorage.getItem(lockKey) && attempts < 5) { attempts++; }
  localStorage.setItem(lockKey, String(Date.now()+2000))
  for (const it of order.items) { fulfillListing(it.listingId, order.buyerId, it.quantity) }
  localStorage.removeItem(lockKey)
  rows[i] = { ...rows[i], status:'transferred', updatedAt: new Date().toISOString() }
  writeV18(rows)
  const queenIds: string[] = [] // omitted detailed list in this mock; transfer service already sends emails per ID
  auditAppend({ type:'ownership.transfer.completed', orderId, queenIds, to: order.buyerId, at: new Date().toISOString() })
}
export function cancelOrder(orderId: string): void {
  const rows = readV18(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return
  // return stock
  for (const it of rows[i].items) { reduceStockLegacy(it.listingId, -it.quantity) }
  rows[i] = { ...rows[i], status:'cancelled', updatedAt: new Date().toISOString() }
  writeV18(rows)
}

function setStatus(orderId: string, status: OrderStatus) { const rows = readV18(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return; rows[i] = { ...rows[i], status, updatedAt: new Date().toISOString() }; writeV18(rows) }

export function expireReserves(): void {
  const rows = readV18()
  const now = Date.now()
  for (let i=0;i<rows.length;i++) {
    const o: any = rows[i]
    if (o.status === 'awaiting_payment' && o.reserveExpiresAt && Date.parse(o.reserveExpiresAt) < now) {
      for (const it of o.items) reduceStockLegacy(it.listingId, -it.quantity)
      rows[i] = { ...rows[i], status:'cancelled', updatedAt: new Date().toISOString() }
      auditAppend({ type:'stock.release', orderId: o.id, reason: 'expired', at: new Date().toISOString() })
    }
  }
  writeV18(rows)
}

export function startPayment(orderId: string, provider: 'mock'|'stripe'|'wayforpay'='mock'): { clientSecret?: string } {
  const rows = readV18(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return {}
  const o = rows[i]
  void (getInvoiceByOrder(orderId) || issueInvoice(orderId, o.subtotalUAH))
  const pi = createPaymentIntent(orderId, o.subtotalUAH, provider)
  return { clientSecret: pi.clientSecret }
}
