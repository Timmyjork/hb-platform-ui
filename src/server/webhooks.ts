import { append as auditAppend } from '../audit/log'
import { markPaymentFailed, markPaid } from '../shop/orders.store'
import { processPaidOrder } from '../shop/flow'

type WebhookEvent = { id: string; type: string; data: any }

const LS = 'hb.webhook_events'

function seen(id: string): boolean { try { const raw = localStorage.getItem(LS); const set = raw? new Set<string>(JSON.parse(raw)): new Set<string>(); return set.has(id) } catch { return false } }
function remember(id: string) { try { const raw = localStorage.getItem(LS); const arr: string[] = raw? JSON.parse(raw): []; if (!arr.includes(id)) arr.push(id); localStorage.setItem(LS, JSON.stringify(arr)) } catch (_e) { void 0 } }

export async function handlePaymentsWebhook(body: WebhookEvent, headers: Record<string,string>): Promise<{ ok: boolean }> {
  const secret = (import.meta as any).env?.PAYMENTS_WEBHOOK_SECRET || ''
  const sig = headers['x-signature'] || headers['stripe-signature'] || ''
  if (secret && sig !== secret) return { ok: false }
  if (seen(body.id)) return { ok: true }
  remember(body.id)
  auditAppend({ type:'payment.status', paymentId: String(body.data?.intentId||''), status: body.type, at: new Date().toISOString() })
  const type = body.type
  const orderId = body.data?.orderId
  if (!orderId) return { ok: true }
  if (type === 'payment_intent.succeeded') {
    markPaid(orderId)
    await processPaidOrder({ id: orderId, buyerId: body.data?.buyerId, items: body.data?.items, subtotalUAH: 0, status: 'paid', payment: { status: 'succeeded', method: 'mock' }, passports: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any)
  } else if (type === 'payment_intent.payment_failed') {
    markPaymentFailed(orderId, 'failed')
  }
  return { ok: true }
}
