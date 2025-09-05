import { transferOwnership } from '../state/queens.store'
import { listAllOrders, setOrderStatus } from '../state/orders.v22.store'
import { deliverEmail } from '../analytics/transports'

export async function transferOwnershipForOrder(orderId:string): Promise<{moved:string[]}> {
  const orders = listAllOrders()
  const o = orders.find(x => x.id === orderId)
  if (!o) return { moved: [] }
  setOrderStatus(orderId, 'transferring')
  const moved: string[] = []
  for (const it of o.items) {
    const t = transferOwnership(it.queenId, o.buyerId)
    if (t) moved.push(t.id)
  }
  setOrderStatus(orderId, 'completed')
  void deliverEmail('buyer@example.com', `[HB] Замовлення №${orderId.slice(-6)}: права передані`, `Передано: ${moved.join(', ')}`)
  return { moved }
}

