import type { Order, CartItem } from './types'
import { get as getListing } from './listings.store'

const LS = 'hb.orders'

function read(): Order[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Order[]: [] } catch { return [] } }
function write(rows: Order[]): Order[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

function priceOf(listingId: string): number { const l = getListing(listingId); return l? l.priceUAH : 0 }

export function createDraft(buyerId: string, items: CartItem[]): Order {
  const now = new Date().toISOString()
  const priced = items.map(i => ({ listingId: i.listingId, qty: i.qty, priceUAH: priceOf(i.listingId) }))
  const subtotal = priced.reduce((s,i)=> s + i.qty * i.priceUAH, 0)
  const order: Order = { id: `O_${Math.random().toString(36).slice(2,8)}`, buyerId, items: priced, subtotalUAH: subtotal, status: 'draft', payment: { status: 'pending', method: 'mock' }, passports: [], createdAt: now, updatedAt: now }
  const rows = read(); rows.unshift(order); write(rows)
  return order
}

export function place(orderId: string): Order { const rows = read(); const i = rows.findIndex(o=>o.id===orderId); if (i===-1) throw new Error('not found'); rows[i].status='placed'; rows[i].updatedAt=new Date().toISOString(); write(rows); return rows[i] }
export function payMock(orderId: string, succeed: boolean): Order { const rows = read(); const i = rows.findIndex(o=>o.id===orderId); if (i===-1) throw new Error('not found'); rows[i].payment.status = succeed? 'succeeded':'failed'; if (succeed) rows[i].status = 'paid'; rows[i].updatedAt=new Date().toISOString(); write(rows); return rows[i] }
export function markTransferred(orderId: string, queenIds: string[]): Order { const rows = read(); const i = rows.findIndex(o=>o.id===orderId); if (i===-1) throw new Error('not found'); rows[i].status='transferred'; rows[i].passports = queenIds; rows[i].updatedAt=new Date().toISOString(); write(rows); return rows[i] }
export function markPaid(orderId: string, _intentId: string): Order { const rows = read(); const i = rows.findIndex(o=>o.id===orderId); if (i===-1) throw new Error('not found'); rows[i].status='paid'; rows[i].payment.status='succeeded'; rows[i].updatedAt=new Date().toISOString(); write(rows); return rows[i] }
export function markPaymentFailed(orderId: string, _reason: string): Order { const rows = read(); const i = rows.findIndex(o=>o.id===orderId); if (i===-1) throw new Error('not found'); rows[i].payment.status='failed'; rows[i].status='placed'; rows[i].updatedAt=new Date().toISOString(); write(rows); return rows[i] }

export function listOrdersByBuyer(buyerId: string): any[] { return (JSON.parse(localStorage.getItem('hb.orders') || '[]')).filter((o:any)=> o.buyerId===buyerId) }
