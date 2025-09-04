import { describe, it, expect, beforeEach } from 'vitest'
import { saveQueens } from '../queens.store'
import { createListing } from '../listings.store'
import { placeOrder, payOrder, listOrders } from '../orders.store'

describe('listings → order → paid → transfer flow', () => {
  beforeEach(() => { localStorage.clear() })

  it('creates listing, pays order, transfers daughters', () => {
    const now = new Date().toISOString()
    // Seed mother with full traits
    saveQueens([{
      id: 'UA.7.45.1.1.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'1', year:2025, country:'UA',
      baseTraits: { honey:80,winter:70,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 },
      status:'listed', createdAt: now, updatedAt: now, isMother: true
    } as any])
    const listing = createListing({ breederUserId:'B1', motherId:'UA.7.45.1.1.2025', stock: 10, price: 1000, breedCode: 7, unionCode: 45, year: 2025, traits: { honey:80,winter:70,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 } })
    const order = placeOrder('Buyer-1', [{ listingId: listing.listingId, qty: 3, price: listing.price }])
    const res = payOrder(order.orderId)
    expect(res.transferred.length).toBe(3)
    const orders = listOrders()
    expect(orders[0].status).toBe('transferred')
  })
})

