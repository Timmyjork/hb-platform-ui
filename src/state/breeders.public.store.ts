import type { BreederPublic } from '../types/breeder.public'

const LS = 'hb.breeders.public'

function read(): BreederPublic[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as BreederPublic[]: [] } catch { return [] } }
function write(rows: BreederPublic[]): BreederPublic[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listBreedersPublic(): BreederPublic[] { return seedIfEmpty(read()) }
export function getBreederPublicBySlug(slug: string): BreederPublic | null { return listBreedersPublic().find(b => b.slug === slug) || null }
export function saveBreederPublic(b: BreederPublic): void { const rows = read(); const i = rows.findIndex(x => x.slug === b.slug); if (i>=0) rows[i]=b; else rows.unshift(b); write(rows) }

export function seedBreedersPublic(): void { seedIfEmpty([]) }

function seedIfEmpty(rows: BreederPublic[]): BreederPublic[] {
  if (rows.length) return rows
  const now = new Date().toISOString()
  const demo: BreederPublic[] = [
    { breederId:'B1', slug:'ua-32-breeder-one', displayName:'Breeder One', regionCode:'UA-32', breedCodes:['carnica','carpatica'], isPublished:true, badges:['verified','top_seller'], stats:{ sales:120, queens:60, years:8, rating:4.6 }, createdAt: now, updatedAt: now },
    { breederId:'B2', slug:'ua-46-breeder-two', displayName:'Breeder Two', regionCode:'UA-46', breedCodes:['carpatica'], isPublished:true, badges:['union'], stats:{ sales:80, queens:40, years:5, rating:4.2 }, createdAt: now, updatedAt: now }
  ]
  return write(demo)
}

export function validateSlugUnique(slug: string, ignoreBreederId?: string): void {
  if (!/^[a-z0-9-]{3,}$/.test(slug)) throw new Error('E_SLUG_FORMAT')
  const exists = listBreedersPublic().some(b => b.slug === slug && (!ignoreBreederId || b.breederId !== ignoreBreederId))
  if (exists) throw new Error('E_SLUG_TAKEN')
}

export function setPublished(breederId: string, flag: boolean): void {
  const rows = read(); const i = rows.findIndex(b => b.breederId === breederId); if (i===-1) return
  rows[i] = { ...rows[i], isPublished: flag, updatedAt: new Date().toISOString() }
  write(rows)
}

export function searchBreeders(filter?: { q?: string; regionCode?: string; breed?: string; badge?: string; limit?: number; offset?: number; onlyPublished?: boolean }): { rows: BreederPublic[]; total: number } {
  let rows = listBreedersPublic()
  if (filter?.onlyPublished) rows = rows.filter(b => b.isPublished !== false)
  if (filter?.regionCode) rows = rows.filter(b => b.regionCode === filter.regionCode)
  if (filter?.breed) rows = rows.filter(b => b.breedCodes.includes(filter.breed!))
  if (filter?.badge) rows = rows.filter(b => (b.badges||[]).includes(filter.badge as any))
  if (filter?.q) { const s = filter.q.trim().toLowerCase(); rows = rows.filter(b => b.displayName.toLowerCase().includes(s) || (b.bio||'').toLowerCase().includes(s)) }
  const total = rows.length
  const offset = filter?.offset || 0
  const limit = filter?.limit || 20
  return { rows: rows.slice(offset, offset + limit), total }
}
