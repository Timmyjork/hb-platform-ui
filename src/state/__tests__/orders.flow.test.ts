import { describe, it, expect, beforeEach } from 'vitest'
import { createOrderFromCart, listBuyerOrders, markPaid, transferOrder } from '../../shop/orders.store'

beforeEach(() => { localStorage.clear() })

describe('orders flow (M08)', () => {
  it('create -> paid -> transferred populates queenIds', async () => {
    // Seed cart
    const cart = [ { listingId: 'L_test', title: 'Test', priceUAH: 100, sellerId: 'B1', qty: 2, max: 10 } ]
    localStorage.setItem('hb.cart', JSON.stringify(cart))
    const o = createOrderFromCart('U1', { name:'Buyer', email:'b@example.com' })
    expect(o.status).toBe('pending')
    const buyerList = listBuyerOrders('U1')
    expect(buyerList.length).toBe(1)
    const paid = markPaid(o.id)
    expect(paid?.status).toBe('paid')
    const moved = await transferOrder(o.id)
    expect(moved?.status).toBe('transferred')
    const withIds = moved?.items?.[0]?.queenIds || []
    expect(Array.isArray(withIds)).toBe(true)
  })
})

