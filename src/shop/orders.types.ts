export type OrderStatus = 'pending' | 'paid' | 'transferred' | 'cancelled'

export type OrderItem = {
  id: string
  listingId: string
  title: string
  price: number
  qty: number
  breederId: string
  queenIds?: string[]
}

export type Order = {
  id: string
  buyerId: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  contact: { name: string; email: string; phone?: string; note?: string }
  createdAt: string
  paidAt?: string
  transferredAt?: string
}

