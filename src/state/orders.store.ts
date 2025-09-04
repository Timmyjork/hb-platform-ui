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
