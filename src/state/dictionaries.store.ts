import type { Breed, Region, DictStatus } from '../types/dictionaries'
import { lineageCodeToBreedSlug } from '../constants/breeds'
import UA_REGIONS from '../constants/regions.ua'

const LS_BREEDS = 'hb.dict.breeds'
const LS_REGIONS = 'hb.dict.regions'

function nowISO() { return new Date().toISOString() }

function readBreeds(): Breed[] {
  try {
    const raw = localStorage.getItem(LS_BREEDS)
    return raw ? (JSON.parse(raw) as Breed[]) : seedBreeds()
  } catch {
    return seedBreeds()
  }
}
function writeBreeds(rows: Breed[]): Breed[] { localStorage.setItem(LS_BREEDS, JSON.stringify(rows)); return rows }

function readRegions(): Region[] {
  try {
    const raw = localStorage.getItem(LS_REGIONS)
    return raw ? (JSON.parse(raw) as Region[]) : seedRegions()
  } catch {
    return seedRegions()
  }
}
function writeRegions(rows: Region[]): Region[] { localStorage.setItem(LS_REGIONS, JSON.stringify(rows)); return rows }

// ——— BREEDS
export function listBreeds(): Breed[] { return readBreeds() }
export function getBreed(code: string): Breed | null { return readBreeds().find(b => b.code === code) || null }
export function saveBreed(b: Omit<Breed,'createdAt'|'updatedAt'> & Partial<Pick<Breed,'createdAt'|'updatedAt'>>): void {
  const code = normalizeCode(b.code)
  validateBreed({ ...b, code })
  const rows = readBreeds()
  const idx = rows.findIndex(x => x.code === code)
  const now = nowISO()
  const next: Breed = {
    code,
    label: (b.label || '').trim(),
    synonyms: (b.synonyms || []).map(s => (s || '').trim().toLowerCase()).filter(Boolean),
    status: (b.status as DictStatus) || 'active',
    createdAt: b.createdAt || now,
    updatedAt: now,
    order: typeof (b as any).order === 'number' ? (b as any).order : (idx>=0 ? (rows[idx] as any).order : undefined),
  }
  if (idx >= 0) rows[idx] = next; else rows.unshift(next)
  writeBreeds(rows)
}
export function archiveBreed(code: string): void { setBreedStatus(code, 'archived') }
export function deprecateBreed(code: string): void { setBreedStatus(code, 'deprecated') }
export function deleteBreed(code: string): void {
  if (usageCountBreed(code) > 0) throw new Error('E_IN_USE: Неможливо видалити — код використовується')
  const rows = readBreeds().filter(b => b.code !== code)
  writeBreeds(rows)
}
function setBreedStatus(code: string, status: DictStatus): void {
  const rows = readBreeds()
  const idx = rows.findIndex(x => x.code === code)
  if (idx === -1) return
  rows[idx] = { ...rows[idx], status, updatedAt: nowISO() }
  writeBreeds(rows)
}

// ——— REGIONS
export function listRegions(): Region[] { return readRegions() }
export function getRegion(code: string): Region | null { return readRegions().find(r => r.code === code) || null }
export function saveRegion(r: Omit<Region,'createdAt'|'updatedAt'> & Partial<Pick<Region,'createdAt'|'updatedAt'>>): void {
  const code = normalizeCode(r.code)
  validateRegion({ ...r, code })
  const rows = readRegions()
  const idx = rows.findIndex(x => x.code === code)
  const now = nowISO()
  const next: Region = {
    code,
    label: (r.label || '').trim(),
    status: (r.status as DictStatus) || 'active',
    createdAt: r.createdAt || now,
    updatedAt: now,
    order: typeof (r as any).order === 'number' ? (r as any).order : (idx>=0 ? (rows[idx] as any).order : undefined),
  }
  if (idx >= 0) rows[idx] = next; else rows.unshift(next)
  writeRegions(rows)
}
export function archiveRegion(code: string): void { setRegionStatus(code, 'archived') }
export function deprecateRegion(code: string): void { setRegionStatus(code, 'deprecated') }
export function deleteRegion(code: string): void {
  if (usageCountRegion(code) > 0) throw new Error('E_IN_USE: Неможливо видалити — код використовується')
  const rows = readRegions().filter(r => r.code !== code)
  writeRegions(rows)
}
function setRegionStatus(code: string, status: DictStatus): void {
  const rows = readRegions()
  const idx = rows.findIndex(x => x.code === code)
  if (idx === -1) return
  rows[idx] = { ...rows[idx], status, updatedAt: nowISO() }
  writeRegions(rows)
}

// ——— VALIDATIONS
function normalizeCode(input: string): string {
  const s = (input || '').trim().toLowerCase()
  let norm = s.replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
  norm = norm.replace(/^-+/, '').replace(/-+$/, '')
  return norm
}
function validateBreed(b: { code: string; label: string }) {
  if (!/^[a-z0-9-]{2,32}$/.test(b.code)) throw new Error('E_CODE_FORMAT')
  const label = (b.label || '').trim()
  if (label.length < 2 || label.length > 64) throw new Error('E_LABEL_RANGE')
  // OK to update duplicate (same code), enforcement is at save
}
function validateRegion(r: { code: string; label: string }) {
  if (!/^[a-z0-9-]{2,32}$/.test(r.code)) throw new Error('E_CODE_FORMAT')
  const label = (r.label || '').trim()
  if (label.length < 2 || label.length > 64) throw new Error('E_LABEL_RANGE')
}

// ——— USAGE COUNTS
export function usageCountBreed(code: string): number {
  let count = 0
  try {
    // breeders profiles
    const raw = localStorage.getItem('hb.breeders')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ breedDefault?: string }>
      count += list.filter(b => (b.breedDefault || '').toLowerCase() === code.toLowerCase()).length
    }
  } catch { void 0 }
  try {
    // shop listings (numeric lineage)
    const raw = localStorage.getItem('hb.shop.listings')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ breedCode: string }>
      count += list.filter(l => (lineageCodeToBreedSlug(String(l.breedCode)) || '') === code).length
    }
  } catch { void 0 }
  try {
    // queens (numeric lineage)
    const raw = localStorage.getItem('hb.queens')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ breedCode: string }>
      count += list.filter(q => (lineageCodeToBreedSlug(String(q.breedCode)) || '') === code).length
    }
  } catch { void 0 }
  return count
}

export function usageCountRegion(code: string): number {
  let count = 0
  const isoToSlug = (iso: string): string | null => UA_REGIONS.find(r => r.code === iso)?.slug || null
  try {
    // breeders profiles (ISO)
    const raw = localStorage.getItem('hb.breeders')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ regionCode?: string }>
      count += list.filter(b => isoToSlug(String(b.regionCode || '')) === code).length
    }
  } catch { void 0 }
  try {
    // shop listings (ISO)
    const raw = localStorage.getItem('hb.shop.listings')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ regionCode: string }>
      count += list.filter(l => isoToSlug(String(l.regionCode || '')) === code).length
    }
  } catch { void 0 }
  try {
    // queens (unionCode numeric); map by suffix
    const raw = localStorage.getItem('hb.queens')
    if (raw) {
      const list = JSON.parse(raw) as Array<{ unionCode: string }>
      count += list.filter(q => {
        const num = String(q.unionCode || '').padStart(2, '0')
        const iso = UA_REGIONS.find(r => r.code.endsWith('-' + num))?.code
        if (!iso) return false
        return isoToSlug(iso) === code
      }).length
    }
  } catch { void 0 }
  return count
}

// ——— SEED
function seedBreeds(): Breed[] {
  const now = nowISO()
  const rows: Breed[] = [
    { code:'carpatica', label:'Карпатська бджола', synonyms:['карпатка','carpathian bee'], status:'active', createdAt: now, updatedAt: now },
    { code:'ukr-stepova', label:'Українська степова бджола', synonyms:['степова','ukrainian steppe'], status:'active', createdAt: now, updatedAt: now },
    { code:'mellifera', label:'Європейська темна бджола', synonyms:['apis mellifera mellifera','темна'], status:'active', createdAt: now, updatedAt: now },
    { code:'carnica', label:'Карніка', synonyms:['krainka','krajnica'], status:'active', createdAt: now, updatedAt: now },
    { code:'buckfast', label:'Бакфаст', synonyms:['бакфаст','buckfast'], status:'active', createdAt: now, updatedAt: now },
  ]
  return writeBreeds(rows)
}

function seedRegions(): Region[] {
  const now = nowISO()
  const rows: Region[] = UA_REGIONS.map(r => ({ code: r.slug, label: r.label, status: 'active', createdAt: now, updatedAt: now }))
  return writeRegions(rows)
}

export { normalizeCode }

// ——— BADGES (minimal, separate collection)
export type Badge = { code: string; label: string; status: DictStatus; createdAt: string; updatedAt: string; order?: number }
const LS_BADGES = 'hb.dict.badges'
function readBadges(): Badge[] { try { const raw = localStorage.getItem(LS_BADGES); return raw? JSON.parse(raw) as Badge[]: seedBadges() } catch { return seedBadges() } }
function writeBadges(rows: Badge[]): Badge[] { localStorage.setItem(LS_BADGES, JSON.stringify(rows)); return rows }
export function listBadges(): Badge[] { return readBadges() }
export function saveBadge(b: { code: string; label: string; status?: DictStatus; order?: number; createdAt?: string }): void {
  const rows = readBadges()
  const idx = rows.findIndex(x => x.code === normalizeCode(b.code))
  const now = nowISO()
  const next: Badge = { code: normalizeCode(b.code), label: (b.label||'').trim(), status: b.status || 'active', order: b.order, createdAt: b.createdAt || now, updatedAt: now }
  if (idx>=0) rows[idx] = next; else rows.unshift(next)
  writeBadges(rows)
}
export function deleteBadge(code: string): void { const rows = readBadges().filter(b => b.code !== code); writeBadges(rows) }
export function setBadgeStatus(code: string, status: DictStatus): void { const rows = readBadges(); const i = rows.findIndex(b => b.code === code); if (i>=0) { rows[i] = { ...rows[i], status, updatedAt: nowISO() }; writeBadges(rows) } }
function seedBadges(): Badge[] { const now = nowISO(); const rows: Badge[] = [ { code:'verified', label:'Перевірений', status:'active', createdAt: now, updatedAt: now, order:1 }, { code:'union', label:'Спілка', status:'active', createdAt: now, updatedAt: now, order:2 }, { code:'top_seller', label:'Топ-продавець', status:'active', createdAt: now, updatedAt: now, order:3 }, { code:'research', label:'Дослідження', status:'active', createdAt: now, updatedAt: now, order:4 } ]; return writeBadges(rows) }
