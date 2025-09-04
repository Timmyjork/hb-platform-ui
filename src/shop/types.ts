export type ListingStatus = 'active'|'paused'|'sold_out'
export type VerificationStatus = 'unverified'|'pending'|'verified'

export type Listing = {
  id: string
  breederId: string
  motherId: string
  breedCode: string
  regionCode: string
  year: number
  priceUAH: number
  qtyTotal: number
  qtyAvailable: number
  status: ListingStatus
  createdAt: string
  updatedAt: string
  seoSlug: string
}

export type CartItem = { listingId: string; qty: number }

export type OrderStatus = 'draft'|'placed'|'paid'|'transferred'|'cancelled'
export type PaymentStatus = 'pending'|'succeeded'|'failed'

export type Order = {
  id: string
  buyerId: string
  items: Array<{ listingId: string; qty: number; priceUAH: number }>
  subtotalUAH: number
  status: OrderStatus
  payment: { status: PaymentStatus; method: 'mock' }
  passports: string[]
  createdAt: string
  updatedAt: string
}

export type SellerVerification = {
  breederId: string
  status: VerificationStatus
  docs?: string[]
  note?: string
  updatedAt: string
}

