import type { PaymentProvider } from './types'
import { updatePaymentStatus, markInvoicePaid, getInvoiceByOrder } from './store'
import { markPaid as orders_markPaid } from '../state/orders.store'
import { append as auditAppend } from '../audit/log'
import { deliverEmail, deliverSMS, deliverWebhook } from '../analytics/transports'

export function handleWebhook(_provider: PaymentProvider, event: { type: string; data: any }): void {
  const type = event?.type || ''
  const data = event?.data || {}
  if (type === 'payment_intent.succeeded') {
    const id = String(data.id || data.paymentIntentId || data.payment_intent_id || '')
    // noop
    updatePaymentStatus(id, 'captured')
    const orderId = String(data.orderId || '')
    const inv = getInvoiceByOrder(orderId); if (inv) markInvoicePaid(inv.id)
    if (orderId) {
      orders_markPaid(orderId)
      auditAppend({ type:'order.paid', orderId, paymentId: id, at: new Date().toISOString() })
      // simple notifications
      void deliverEmail('buyer@example.com', `[HB] Замовлення №${orderId.slice(-6)}: оплачено`, `Оплата замовлення ${orderId} отримана`)
      void deliverEmail('seller@example.com', `[HB] Замовлення №${orderId.slice(-6)}: оплачено`, `Покупець сплатив замовлення ${orderId}`)
      void deliverSMS('+380000000000', `HB: Замовлення ${orderId.slice(-6)} оплачено. Перевірте кабінет.`)
      void deliverWebhook('https://example.com/webhook', { event:'order.paid', orderId })
    }
  } else if (type === 'payment_intent.payment_failed') {
    const id = String(data.id || data.paymentIntentId || '')
    updatePaymentStatus(id, 'failed')
    auditAppend({ type:'payment.status', paymentId: id, status: 'failed', at: new Date().toISOString() })
  }
}
