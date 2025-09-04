import { reserve, get as getListing } from './listings.store'
import type { Order } from './types'
import { addQueensBatch, nextAvailableQueenNo, transferOwnership } from '../state/queens.store'
import { sendMail } from '../utils/mailer.mock'

export async function processPaidOrder(order: Order): Promise<string[]> {
  const issued: string[] = []
  for (const it of order.items) {
    const listing = getListing(it.listingId)
    if (!listing) continue
    reserve(listing.id, it.qty)
    const parts = { country:'UA' as const, breedCode: listing.breedCode, unionCode: String(Number(listing.regionCode.slice(-2))), breederNo: '1', year: listing.year }
    const start = nextAvailableQueenNo(parts, 2)
    const created = addQueensBatch({ count: it.qty, startQueenNo: start, country:'UA', breedCode: parts.breedCode, unionCode: parts.unionCode, breederNo: parts.breederNo, year: parts.year, baseTraits: { honey:60,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, breederId: listing.breederId, motherId: listing.motherId, status: 'listed' })
    for (const q of created) {
      const t = transferOwnership(q.id, order.buyerId)
      if (t) issued.push(t.id)
    }
  }
  const links = issued.map(id => ({ name: `${id}.html`, url: 'blob://passport/'+id }))
  sendMail(order.buyerId, 'Дякуємо за покупку', `Ваші паспорти: ${issued.join(', ')}`, links)
  return issued
}
