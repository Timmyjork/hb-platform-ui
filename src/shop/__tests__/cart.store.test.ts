import { describe, it, expect, beforeEach } from 'vitest'
import { cart, getCart } from '../cart.store'

function reset() { localStorage.clear() }

describe('cart.store', () => {
  beforeEach(reset)

  it('adds and merges by listingId, clamps qty within [1,max]', () => {
    cart.add({ listingId: 'L1', title: 'A', priceUAH: 100, sellerId: 'B1', max: 2 }, 1)
    cart.add({ listingId: 'L1', title: 'A', priceUAH: 100, sellerId: 'B1', max: 2 }, 2)
    const rows = getCart()
    expect(rows).toHaveLength(1)
    expect(rows[0].qty).toBe(2)
  })

  it('setQty and remove when qty=0', () => {
    cart.add({ listingId: 'L2', title: 'B', priceUAH: 50, sellerId: 'B1', max: 5 }, 1)
    cart.setQty('L2', 3)
    expect(getCart()[0].qty).toBe(3)
    cart.setQty('L2', 0)
    expect(getCart()).toHaveLength(0)
  })

  it('totalUAH sums qty*price', () => {
    cart.add({ listingId: 'L3', title: 'C', priceUAH: 10, sellerId: 'B1', max: 10 }, 2)
    cart.add({ listingId: 'L4', title: 'D', priceUAH: 5, sellerId: 'B1', max: 10 }, 3)
    expect(cart.totalUAH()).toBe(2*10 + 3*5)
  })
})

