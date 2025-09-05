import type { TenTraits, QueenId } from '../types/queen'

export type ListingStatus = 'active'|'paused'|'soldout'|'archived'

export type ShopListingV18 = {
  id: string
  breederId: string
  queenMotherId: string
  title: string
  priceUAH: number
  stock: number
  year: number
  breedCode: string
  regionCode: string
  status: ListingStatus
  createdAt: string
  updatedAt: string
  seoSlug: string
}

// Legacy listing used across existing codebase (preserve name)
export type Listing = {
  listingId: string
  sellerId: string
  motherId?: QueenId
  queenIds?: QueenId[]
  stock: number
  price: number
  breedCode: string
  regionCode: string
  year: number
  traits?: TenTraits
  active: boolean
  createdAt: string
}

export type CartItem = { listingId: string; qty: number; price: number }

export type Order = {
  orderId: string
  buyerId: string
  sellerId: string
  items: CartItem[]
  status: 'new'|'paid'|'transferred'|'cancelled'
  createdAt: string
}

export type Payment = {
  paymentId: string
  orderId: string
  provider: 'stub'
  amountUah: number
  status: 'succeeded'|'failed'
  createdAt: string
}

export type BreederKYC = {
  userId: string
  fullName: string
  phone?: string
  regionCode?: string // ISO
  docs?: string[] // URLs or identifiers (mock)
  status: 'none'|'pending'|'verified'|'rejected'
  updatedAt: string
}
