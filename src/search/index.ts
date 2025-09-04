import { listListings } from '../state/shop.store'
import { listAll as listReviews } from '../reviews/store'
import { listQuestions } from '../qa/store'

export type CatalogDoc = {
  id: string
  breedCode: string
  regionCode: string
  year: number
  price: number
  ratingAvg: number
  ratingCount: number
  hasQA: boolean
  createdAt: string
}

let cache: CatalogDoc[] | null = null

export function buildIndex(): CatalogDoc[] {
  const listings = listListings().filter(l=> l.active)
  const reviews = listReviews()
  const out: CatalogDoc[] = listings.map(l => {
    const r = reviews.filter(x => x.breederId === l.sellerId && x.status==='published')
    const ratingCount = r.length
    const ratingAvg = ratingCount ? r.reduce((s,x)=> s + x.rating, 0) / ratingCount : 0
    const hasQA = !!listQuestions('breeder', l.sellerId).length
    return { id: l.listingId, breedCode: l.breedCode, regionCode: l.regionCode, year: l.year, price: l.price, ratingAvg, ratingCount, hasQA, createdAt: l.createdAt }
  })
  cache = out
  return out
}

export function queryIndex(filters: Partial<{ breedCode: string; regionCode: string; year: number; minPrice: number; maxPrice: number; minRating: number; hasQA: boolean }>, sort?: 'price'|'rating'|'newest'): CatalogDoc[] {
  const rows = cache || buildIndex()
  let res = rows.slice()
  if (filters.breedCode) res = res.filter(r=> r.breedCode === String(filters.breedCode))
  if (filters.regionCode) res = res.filter(r=> r.regionCode === String(filters.regionCode))
  if (filters.year) res = res.filter(r=> r.year === Number(filters.year))
  if (filters.minPrice != null) res = res.filter(r=> r.price >= Number(filters.minPrice))
  if (filters.maxPrice != null) res = res.filter(r=> r.price <= Number(filters.maxPrice))
  if (filters.minRating != null) res = res.filter(r=> r.ratingAvg >= Number(filters.minRating))
  if (filters.hasQA) res = res.filter(r=> r.hasQA)
  if (sort === 'price') res.sort((a,b)=> a.price - b.price)
  if (sort === 'rating') res.sort((a,b)=> b.ratingAvg - a.ratingAvg)
  if (sort === 'newest') res.sort((a,b)=> (a.createdAt > b.createdAt ? -1 : 1))
  return res
}
