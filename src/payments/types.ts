export type PaymentProvider = 'mock' | 'stripe' | 'wayforpay'

export type PaymentStatus = 'created'|'requires_action'|'authorized'|'captured'|'failed'|'cancelled'|'refunded'

export type PaymentIntent = {
  id: string
  provider: PaymentProvider
  orderId: string
  amountUAH: number
  currency: 'UAH'
  status: PaymentStatus
  clientSecret?: string
  createdAt: string
  updatedAt: string
  meta?: Record<string, string>
}

export type Invoice = {
  id: string
  orderId: string
  amountUAH: number
  issuedAt: string
  paidAt?: string
  cancelledAt?: string
  status: 'issued'|'paid'|'cancelled'
  pdfUrl?: string
}

