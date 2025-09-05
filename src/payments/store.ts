import type { PaymentIntent, PaymentProvider, PaymentStatus, Invoice } from './types'
import { MockDriver } from './drivers/mock'
import { StripeDriver } from './drivers/stripe'
import { WayForPayDriver } from './drivers/wayforpay'

const LS_PI = 'hb.payments.intents'
const LS_INV = 'hb.payments.invoices'

function readPI(): PaymentIntent[] { try { const raw = localStorage.getItem(LS_PI); return raw? JSON.parse(raw) as PaymentIntent[]: [] } catch { return [] } }
function writePI(rows: PaymentIntent[]): PaymentIntent[] { localStorage.setItem(LS_PI, JSON.stringify(rows)); return rows }
function readInv(): Invoice[] { try { const raw = localStorage.getItem(LS_INV); return raw? JSON.parse(raw) as Invoice[]: [] } catch { return [] } }
function writeInv(rows: Invoice[]): Invoice[] { localStorage.setItem(LS_INV, JSON.stringify(rows)); return rows }

function driver(p?: PaymentProvider) {
  const prov = p || 'mock'
  if (prov === 'mock') return MockDriver
  if (prov === 'stripe') return StripeDriver
  return WayForPayDriver
}

export function createPaymentIntent(orderId: string, amountUAH: number, provider: PaymentProvider='mock'): PaymentIntent {
  const now = new Date().toISOString()
  const dr = driver(provider)
  const created = { id: `pi_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, clientSecret: `secret_${Math.random().toString(36).slice(2,6)}` }
  try { /* best-effort call */ void dr.create(amountUAH, orderId) } catch (_e) { /* noop */ }
  const pi: PaymentIntent = { id: created.id, provider, orderId, amountUAH, currency: 'UAH', status: 'created', clientSecret: created.clientSecret, createdAt: now, updatedAt: now }
  const rows = readPI(); rows.unshift(pi); writePI(rows)
  return pi
}

export function updatePaymentStatus(id: string, status: PaymentStatus, patch?: Partial<PaymentIntent>): void {
  const rows = readPI(); const i = rows.findIndex(p => p.id === id); if (i===-1) return
  rows[i] = { ...rows[i], ...patch, status, updatedAt: new Date().toISOString() }
  writePI(rows)
}

export function getPaymentByOrder(orderId: string): PaymentIntent | null { return readPI().find(p => p.orderId === orderId) || null }

function nextInvoiceId(): string {
  const rows = readInv()
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`
  const seq = rows.filter(i => i.id.startsWith(prefix)).length + 1
  return `${prefix}${String(seq).padStart(6,'0')}`
}

export function issueInvoice(orderId: string, amountUAH: number): Invoice {
  const inv: Invoice = { id: nextInvoiceId(), orderId, amountUAH, issuedAt: new Date().toISOString(), status: 'issued' }
  const rows = readInv(); rows.unshift(inv); writeInv(rows)
  return inv
}
export function markInvoicePaid(invoiceId: string): void { const rows = readInv(); const i = rows.findIndex(x=>x.id===invoiceId); if (i===-1) return; rows[i] = { ...rows[i], status:'paid', paidAt: new Date().toISOString() }; writeInv(rows) }
export function cancelInvoice(invoiceId: string): void { const rows = readInv(); const i = rows.findIndex(x=>x.id===invoiceId); if (i===-1) return; rows[i] = { ...rows[i], status:'cancelled', cancelledAt: new Date().toISOString() }; writeInv(rows) }
export function getInvoiceByOrder(orderId: string): Invoice | null { return readInv().find(x => x.orderId===orderId) || null }
