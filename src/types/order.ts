export type OrderStatus = 'new'|'awaiting_payment'|'paid'|'transferred'|'cancelled'

export type OrderItem = {
  listingId: string
  quantity: number
  unitPriceUAH: number
}

export type Order = {
  id: string
  buyerId: string
  breederId: string
  items: OrderItem[]
  subtotalUAH: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

