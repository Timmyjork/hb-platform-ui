export type OrderStatus = 'draft'|'pending_payment'|'paid'|'transferring'|'completed'|'cancelled'
export type PaymentStatus = 'none'|'initiated'|'authorized'|'captured'|'failed'|'refunded'
export type LineItem = { queenId: string; qty: number; price: number; breederId: string }
export type Order = {
  id: string; createdAt: string; updatedAt: string
  buyerId: string
  status: OrderStatus
  payment: { provider: 'mock'; status: PaymentStatus; txId?: string }
  items: LineItem[]
  totals: { subtotal: number; discount: number; shipping: number; total: number; currency: 'UAH'|'EUR' }
  couponCode?: string
  notes?: string
}

