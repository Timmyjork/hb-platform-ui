import type { Order, Payment } from '../types/shop'
import { createPayment, updateOrderStatus } from '../state/shop.store'
import { transferAfterPayment } from '../services/transfer'

export async function initPayment(order: Order): Promise<Payment> {
  const amount = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  const payment = createPayment(order.orderId, amount, 'stub')
  // Stub succeeds immediately; mark paid and transfer
  updateOrderStatus(order.orderId, 'paid')
  await transferAfterPayment(order.orderId)
  return payment
}

