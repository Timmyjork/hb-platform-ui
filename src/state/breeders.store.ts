import type { BreederProfile, BreederId, Certificate } from '../types/breederProfile'

const LS = 'hb.breeders'

function read(): BreederProfile[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as BreederProfile[]: seed() } catch { return seed() } }
function write(rows: BreederProfile[]): BreederProfile[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listBreeders(): BreederProfile[] { return read() }
export function getBreeder(breederId: BreederId): BreederProfile | null { return read().find(b=> b.breederId===breederId) || null }
export function saveBreeder(p: BreederProfile): void {
  const rows = read(); const i = rows.findIndex(b=> b.breederId===p.breederId)
  const now = new Date().toISOString()
  const next = { ...p, updatedAt: now, createdAt: p.createdAt || now }
  if (i>=0) rows[i]=next; else rows.unshift(next)
  write(rows)
}
export function upsertCertificates(breederId: BreederId, certs: Certificate[]): void {
  const rows = read(); const i = rows.findIndex(b=> b.breederId===breederId); if (i===-1) return
  rows[i] = { ...rows[i], certificates: certs, updatedAt: new Date().toISOString() }
  write(rows)
}
export function setRatingsPublic(breederId: BreederId, flag: boolean): void {
  const rows = read(); const i = rows.findIndex(b=> b.breederId===breederId); if (i===-1) return
  rows[i] = { ...rows[i], ratingsPublic: !!flag, updatedAt: new Date().toISOString() }
  write(rows)
}

function seed(): BreederProfile[] {
  const now = new Date().toISOString()
  const rows: BreederProfile[] = [
    { breederId:'B1', displayName:'Breeder One', regionCode:'UA-32', breedDefault:'carnica', avatarUrl:'', coverUrl:'', bio:'10 років селекції', portfolio:{ featuredQueenIds:['UA.7.45.1.1.2025','UA.7.45.1.2.2025'] }, certificates: [], ratingsPublic:true, createdAt: now, updatedAt: now },
    { breederId:'B2', displayName:'Breeder Two', regionCode:'UA-46', breedDefault:'carpatica', portfolio:{ featuredQueenIds:[] }, certificates: [], ratingsPublic:true, createdAt: now, updatedAt: now },
  ]
  return write(rows)
}
