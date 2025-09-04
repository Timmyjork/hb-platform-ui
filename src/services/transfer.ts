import { listListings, reduceStock, listOrdersByBuyer, listOrdersBySeller } from '../state/shop.store'
import { addQueensBatch, transferOwnership, nextAvailableQueenNo } from '../state/queens.store'
import { sendTransferEmail } from '../analytics/transports'

export async function transferAfterPayment(orderId: string): Promise<{ transferred: string[] }> {
  // naive: search order across buyers/sellers (demo-only)
  const orders = listOrdersByBuyer('Buyer-1').concat(listOrdersBySeller('B1'))
  const order = orders.find(o => o.orderId === orderId)
  if (!order) return { transferred: [] }
  const listings = listListings()
  const transferred: string[] = []
  for (const it of order.items) {
    const l = listings.find(x => x.listingId === it.listingId)
    if (!l) continue
    reduceStock(l.listingId, it.qty)
    const buyerId = order.buyerId
    const sellerId = l.sellerId
    if (l.queenIds && l.queenIds.length) {
      for (const qid of l.queenIds.slice(0, it.qty)) {
        const t = transferOwnership(qid, buyerId)
        if (t) { transferred.push(t.id); await sendTransferEmail('art1991tj@gmail.com', { queenId: t.id, seller: sellerId, buyer: buyerId }) }
      }
      continue
    }
    if (l.motherId) {
      const parts = { country: 'UA' as const, breedCode: l.breedCode, unionCode: String(Number(l.regionCode.slice(-2))), breederNo: '1', year: l.year }
      const startNo = nextAvailableQueenNo(parts, 2)
      const created = addQueensBatch({ count: it.qty, startQueenNo: startNo, country: 'UA', breedCode: l.breedCode, unionCode: parts.unionCode, breederNo: parts.breederNo, year: l.year, baseTraits: l.traits || { honey:60,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, breederId: sellerId, motherId: l.motherId, status: 'listed' })
      for (const c of created) {
        const t = transferOwnership(c.id, buyerId)
        if (t) { transferred.push(t.id); await sendTransferEmail('art1991tj@gmail.com', { queenId: t.id, seller: sellerId, buyer: buyerId }) }
      }
    }
  }
  return { transferred }
}

