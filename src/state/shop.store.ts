import type { Listing, CartItem, Order, Payment, BreederKYC } from '../types/shop'
import { breedSlugToLineageCode } from '../constants/breeds'

const LS_LISTINGS = 'hb.shop.listings'
const LS_ORDERS = 'hb.shop.orders'
const LS_PAYMENTS = 'hb.shop.payments'
const LS_KYC = 'hb.shop.kyc'

function read<T=unknown>(key: string): T[] { try { const raw = localStorage.getItem(key); return raw? JSON.parse(raw) as T[]: [] } catch { return [] } }
function write<T>(key: string, rows: T[]): T[] { localStorage.setItem(key, JSON.stringify(rows)); return rows }

export function listListings(): Listing[] {
  const rows = read<Listing>(LS_LISTINGS)
  return seedIfEmpty(rows)
}

export function saveListing(l: Listing): Listing {
  const rows = read<Listing>(LS_LISTINGS)
  const idx = rows.findIndex(x => x.listingId === l.listingId)
  if (idx >= 0) rows[idx] = l; else rows.unshift(l)
  write(LS_LISTINGS, rows)
  return l
}

export function toggleListingActive(id: string, active: boolean) {
  const rows = read<Listing>(LS_LISTINGS)
  const idx = rows.findIndex(x => x.listingId === id)
  if (idx >= 0) { rows[idx].active = active; write(LS_LISTINGS, rows) }
}

export function reduceStock(id: string, qty: number) {
  const rows = read<Listing>(LS_LISTINGS)
  const idx = rows.findIndex(x => x.listingId === id)
  if (idx >= 0) { rows[idx].stock = Math.max(0, (rows[idx].stock||0) - Math.max(0, qty)); write(LS_LISTINGS, rows) }
}

export function createOrder(buyerId: string, items: CartItem[], sellerId?: string): Order {
  const now = new Date().toISOString()
  const listings = listListings()
  const seller = sellerId || (listings.find(x => x.listingId === items[0]?.listingId)?.sellerId || 'Seller-1')
  const order: Order = { orderId: `O${Date.now()}`, buyerId, sellerId: seller, items, status:'new', createdAt: now }
  const rows = read<Order>(LS_ORDERS); rows.unshift(order); write(LS_ORDERS, rows)
  return order
}

export function updateOrderStatus(orderId: string, status: Order['status']) {
  const rows = read<Order>(LS_ORDERS)
  const idx = rows.findIndex(o => o.orderId === orderId)
  if (idx >= 0) { rows[idx].status = status; write(LS_ORDERS, rows) }
}

export function createPayment(orderId: string, amountUah: number, provider: Payment['provider']='stub'): Payment {
  const now = new Date().toISOString()
  const payment: Payment = { paymentId: `P${Date.now()}`, orderId, provider, amountUah, status:'succeeded', createdAt: now }
  const rows = read<Payment>(LS_PAYMENTS); rows.unshift(payment); write(LS_PAYMENTS, rows)
  updateOrderStatus(orderId, 'paid')
  return payment
}

export function listOrdersByBuyer(userId: string): Order[] { return read<Order>(LS_ORDERS).filter(o => o.buyerId === userId) }
export function listOrdersBySeller(userId: string): Order[] { return read<Order>(LS_ORDERS).filter(o => o.sellerId === userId) }

export function getKYC(userId: string): BreederKYC | null { return read<BreederKYC>(LS_KYC).find(k => k.userId===userId) || null }
export function submitKYC(data: Omit<BreederKYC,'status'|'updatedAt'>): BreederKYC {
  const rows = read<BreederKYC>(LS_KYC)
  const k: BreederKYC = { ...data, status: 'pending', updatedAt: new Date().toISOString() }
  const idx = rows.findIndex(x => x.userId === data.userId)
  if (idx >= 0) rows[idx] = k; else rows.unshift(k)
  write(LS_KYC, rows)
  return k
}
export function setKYCStatus(userId: string, status: BreederKYC['status']): BreederKYC | null {
  const rows = read<BreederKYC>(LS_KYC)
  const idx = rows.findIndex(x => x.userId === userId)
  if (idx === -1) return null
  rows[idx] = { ...rows[idx], status, updatedAt: new Date().toISOString() }
  write(LS_KYC, rows)
  return rows[idx]
}

function seedIfEmpty(rows: Listing[]): Listing[] {
  if (rows.length) return rows
  const now = new Date().toISOString()
  const sellers = ['B1','B2','B3']
  const breeds = ['carnica','carpatica','buckfast','ligustica','mellifera']
  const regions = ['UA-32','UA-46','UA-51','UA-56','UA-65']
  const out: Listing[] = []
  let idc = 1
  for (let i=0;i<10;i++) {
    const slug = breeds[i % breeds.length]
    const breedCode = breedSlugToLineageCode(slug)
    const regionCode = regions[i % regions.length]
    out.push({ listingId: `L${Date.now()}_${idc++}`, sellerId: sellers[i%sellers.length], stock: 10 + (i%5), price: 800 + i*50, breedCode, regionCode, year: 2025, traits: undefined, active: true, createdAt: now })
  }
  write(LS_LISTINGS, out)
  // Seed KYC: first seller verified, second pending
  const kycs: BreederKYC[] = [
    { userId: 'B1', fullName: 'Verified Breeder', status: 'verified', updatedAt: now },
    { userId: 'B2', fullName: 'Pending Breeder', status: 'pending', updatedAt: now },
  ]
  write(LS_KYC, kycs)
  return out
}

