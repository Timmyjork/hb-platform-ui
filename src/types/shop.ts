import type { TenTraits, QueenId } from '../types/queen'

export type Listing = {
  listingId: string
  sellerId: string
  motherId?: QueenId
  // If specific queens are listed, include their ids; otherwise stock represents daughters to be generated
  queenIds?: QueenId[]
  stock: number
  price: number
  breedCode: string // numeric lineage as string 1..99
  regionCode: string // ISO UA-XX
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

