import type { Order, LineItem, OrderStatus } from '../types/order.v22'

const LS = 'hb.orders.v22'

function read(): Order[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Order[]: [] } catch { return [] } }
function write(rows: Order[]): Order[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listAllOrders(): Order[] { return read() }
export function listOrdersByBuyer(buyerId: string): Order[] { return read().filter(o => o.buyerId === buyerId) }
export function listOrdersByBreeder(breederId: string): Order[] { return read().filter(o => o.items.some(i => i.breederId === breederId)) }

export function createDraftOrder(buyerId: string): Order {
  const now = new Date().toISOString()
  const order: Order = {
    id: `O22_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    createdAt: now, updatedAt: now,
    buyerId, status: 'draft', payment: { provider: 'mock', status: 'none' }, items: [],
    totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, currency: 'UAH' },
  }
  const rows = read(); rows.unshift(order); write(rows)
  return order
}

function recalc(o: Order): Order {
  const subtotal = o.items.reduce((s,i)=> s + i.price * i.qty, 0)
  const shipping = o.totals.shipping || 0
  const discount = o.totals.discount || 0
  const total = Math.max(0, subtotal - discount + shipping)
  return { ...o, totals: { ...o.totals, subtotal, total } }
}

export function addToOrder(orderId: string, line: LineItem): Order | null {
  const rows = read(); const i = rows.findIndex(o => o.id === orderId); if (i===-1) return null
  const merged = { ...rows[i], items: [...rows[i].items, line], updatedAt: new Date().toISOString() }
  rows[i] = recalc(merged); write(rows); return rows[i]
}

export function applyCoupon(orderId: string, code: string): Order | null {
  const rows = read(); const i = rows.findIndex(o => o.id === orderId); if (i===-1) return null
  let discount = 0
  if (code.toUpperCase() === 'WELCOME10') discount = Math.round(rows[i].totals.subtotal * 0.1)
  if (code.toUpperCase() === 'HONEY50') discount = 50
  const next = recalc({ ...rows[i], couponCode: code, totals: { ...rows[i].totals, discount } })
  rows[i] = { ...next, updatedAt: new Date().toISOString() }
  write(rows); return rows[i]
}

export function setOrderStatus(orderId: string, status: OrderStatus): void { const rows = read(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return; rows[i] = { ...rows[i], status, updatedAt: new Date().toISOString() }; write(rows) }
export function updatePayment(orderId: string, patch: Partial<Order['payment']>): void { const rows = read(); const i = rows.findIndex(o => o.id===orderId); if (i===-1) return; rows[i] = { ...rows[i], payment: { ...rows[i].payment, ...patch }, updatedAt: new Date().toISOString() }; write(rows) }

