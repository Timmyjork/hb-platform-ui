function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function flattenRow(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (isObject(v)) {
      Object.assign(out, flattenRow(v, key))
    } else {
      out[key] = v as unknown
    }
  }
  return out
}

function csvEscape(val: unknown, sep: string): string {
  let s = val == null ? '' : String(val)
  const needsQuotes = s.includes(sep) || s.includes('"') || s.includes('\n')
  if (needsQuotes) {
    s = '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function toCSV(rows: Record<string, unknown>[], separator = ','): string {
  const flat = rows.map((r) => flattenRow(r))
  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r)))).sort()
  const lines = [headers.join(separator)]
  for (const r of flat) {
    lines.push(headers.map((h) => csvEscape(r[h], separator)).join(separator))
  }
  return lines.join('\n')
}

export { flattenRow }

// Simple CSV parser supporting separators and double-quote escaping
function parseLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let i = 0
  let inQuotes = false
  while (i < line.length) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        // lookahead for escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        cur += ch
        i++
        continue
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
        continue
      }
      if (ch === sep) {
        out.push(cur)
        cur = ''
        i++
        continue
      }
      cur += ch
      i++
    }
  }
  out.push(cur)
  return out
}

export function parseCSV(text: string, separator = ','): Record<string, string>[] {
  const totalLines = text.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.length > 0).length
  if (totalLines > 50000) throw new Error('E_CSV_TOO_LARGE')
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.length > 0)
  if (lines.length === 0) return []
  const header = parseLine(lines[0], separator)
  const rows: Record<string, string>[] = []
  for (let li = 1; li < lines.length; li++) {
    const cols = parseLine(lines[li], separator)
    const obj: Record<string, string> = {}
    for (let ci = 0; ci < header.length; ci++) {
      obj[header[ci]] = cols[ci] ?? ''
    }
    rows.push(obj)
  }
  return rows
}

// Domain-specific helpers for new Queens/Observations templates
import type { Queen, Observation, TenTraits } from '../../types/queen'
import { ensureUnique as storeEnsureUnique } from '../../state/queens.store'
import { parseQueenId as utilParseQueenId, normalizeId } from '../../utils/queenId'
// uniqueness will be validated at save time; import returns parsed rows only
import BREEDS, { matchBreed, breedSlugToLineageCode, lineageCodeToBreedSlug } from '../../constants/breeds'
import UA_REGIONS, { findRegion } from '../../constants/regions.ua'

export function queensToCSV(rows: Queen[]): string {
  const pick = (q: Queen) => {
    const breedSlug = lineageCodeToBreedSlug(q.breedCode)
    const breedLabel = BREEDS.find(b=> b.code === breedSlug)?.label || ''
    const region = UA_REGIONS.find(r => r.code.endsWith(`-${String(q.unionCode).padStart(2,'0')}`))
    return {
    queenId: q.id,
    country: q.country,
    breed_code: breedSlug || '',
    breed: breedLabel,
    breedCode: q.breedCode,
    region_code: region?.code || '',
    region: region?.short || '',
    unionCode: q.unionCode,
    breederNo: q.breederNo,
    queenNo: q.queenNo,
    year: q.year,
    status: q.status,
    ownerUserId: q.ownerUserId || '',
    breederId: q.breederId,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    ...q.baseTraits,
  }
  }
  return toCSV(rows.map(pick))
}

export function observationsToCSV(rows: Observation[]): string {
  const pick = (o: Observation) => ({ queenId: o.queenId, date: o.date, observerId: o.observerId, note: o.note || '', ...o.traits })
  return toCSV(rows.map(pick))
}

export function parseQueensCSV(text: string): Array<Omit<Queen, 'createdAt'|'updatedAt'|'country'>> {
  const rows = parseCSV(text)
  const out: Array<Omit<Queen, 'createdAt'|'updatedAt'|'country'>> = []
  for (const r of rows) {
    const traits: TenTraits = {
      honey: Number(r.honey||0),
      winter: Number(r.winter||0),
      temperament: Number(r.temperament||0),
      calmOnFrames: Number(r.calmOnFrames||0),
      swarming: Number(r.swarming||0),
      hygienic: Number(r.hygienic||0),
      varroaResist: Number(r.varroaResist||0),
      springBuildUp: Number(r.springBuildUp||0),
      colonyStrength: Number(r.colonyStrength||0),
      broodFrames: Number(r.broodFrames||0),
    }
    // Normalize breed
    const inputBreed = r.breed || r.breed_code || ''
    let breedCode = String(r.breedCode || '')
    if (inputBreed) {
      const matched = matchBreed(inputBreed)
      if (matched) breedCode = breedSlugToLineageCode(matched)
      else console.warn('Unknown breed in CSV:', inputBreed)
    }
    // Normalize region
    const inputRegion = r.region || r.region_code || ''
    let unionCode = String(r.unionCode || '')
    if (inputRegion) {
      const reg = findRegion(inputRegion)
      if (reg) {
        unionCode = String(Number(reg.code.slice(-2)))
      } else {
        console.warn('Unknown region in CSV:', inputRegion)
        // Fallback: if unionCode parsed is suspiciously short, default to 32 (Kyivska)
        unionCode = (unionCode && String(unionCode).length >= 2) ? String(unionCode) : '32'
      }
    }
    if (!unionCode) unionCode = '32'
    if (!breedCode) breedCode = '1'
    const breederNo = String(r.breederNo || '1')
    const queenNo = String(r.queenNo || '1')
    const year = Number(r.year || new Date().getFullYear())
    out.push({
      id: r.queenId || `UA.${breedCode}.${unionCode}.${breederNo}.${queenNo}.${year}`,
      breederId: String(r.breederId||'') || 'Breeder-1',
      unionCode,
      breedCode,
      breederNo,
      queenNo,
      year,
      baseTraits: traits,
      ownerUserId: r.ownerUserId || undefined,
      status: (r.status as Queen['status']) || 'listed',
    })
  }
  return out
}

// Validating import that enforces ID format and uniqueness
export function importQueensCSV(text: string, opts?: { mode?: 'strict'|'skip' }): { rows: Array<Omit<Queen, 'createdAt'|'updatedAt'|'country'>>; skipped: string[] } {
  const mode = opts?.mode || 'strict'
  const rawRows = parseCSV(text)
  const hasExplicitIds = rawRows.some(r => (r.queenId || '').trim().length > 0)
  const parsed = parseQueensCSV(text)
  const valid: Array<Omit<Queen, 'createdAt'|'updatedAt'|'country'>> = []
  const skipped: string[] = []
  for (const r of parsed) {
    const id = normalizeId(r.id)
    if (hasExplicitIds) {
      const parts = utilParseQueenId(id)
      if (!parts) {
        if (mode === 'strict') {
          throw new Error(`E_ID_FORMAT: Неправильний формат ID: ${id}`)
        } else {
          skipped.push(id)
          continue
        }
      }
      try {
        storeEnsureUnique(id)
        valid.push({ ...r, id })
      } catch (e) {
        if (mode === 'strict') throw e
        skipped.push(id)
      }
    } else {
      // For preview without explicit IDs, allow rows through regardless of ID validation
      valid.push({ ...r, id })
    }
  }
  if (mode === 'strict' && skipped.length) {
    throw new Error(`E_ID_DUPLICATE: ID вже існує: ${skipped.join(', ')}`)
  }
  return { rows: valid, skipped }
}

export function parseObservationsCSV(text: string): Observation[] {
  const rows = parseCSV(text)
  const out: Observation[] = []
  for (const r of rows) {
    const traits: Partial<TenTraits> = {}
    const keys: (keyof TenTraits)[] = ['honey','winter','temperament','calmOnFrames','swarming','hygienic','varroaResist','springBuildUp','colonyStrength','broodFrames']
    for (const k of keys) if (r[k as string] != null && r[k as string] !== '') (traits as any)[k] = Number(r[k as string])
    out.push({ queenId: r.queenId, date: r.date, observerId: r.observerId, note: r.note, traits })
  }
  return out
}

// API aliases per spec (MVP names)
export const exportQueensCSV = queensToCSV
export const exportObservationsCSV = observationsToCSV
export const importObservationsCSV = parseObservationsCSV

// ——— Dictionaries CSV helpers
import type { Breed as DictBreed, Region as DictRegion } from '../../types/dictionaries'
import { listBreeds as listDictBreeds, listRegions as listDictRegions, saveBreed as saveDictBreed, saveRegion as saveDictRegion, listBadges, saveBadge } from '../../state/dictionaries.store'
import { normalizeCode as normalizeDictCode } from '../../utils/dictionaries.helpers'

export function breedsToCSV(): string {
  const rows = listDictBreeds()
  return toCSV(rows.map(b => ({ code: b.code, label: b.label, status: b.status, order: b.order ?? '', synonyms: (b.synonyms||[]).join('|'), createdAt: b.createdAt, updatedAt: b.updatedAt })))
}

export function parseBreedsCSV(text: string): DictBreed[] {
  const rows = parseCSV(text)
  const now = new Date().toISOString()
  return rows.map(r => ({
    code: normalizeDictCode(r.code || r.slug || r.id || r.name || ''),
    label: r.label || r.name || '',
    status: (r.status as DictBreed['status']) || 'active',
    order: r.order ? Number(r.order) : undefined,
    synonyms: (r.synonyms || '').split(/[|,]/g).map(s => s.trim().toLowerCase()).filter(Boolean),
    createdAt: r.createdAt || now,
    updatedAt: now,
  }))
}

export function importBreedsCSV(text: string, mode: 'merge'|'replace'='merge'): {added:number, updated:number, skipped:number} {
  const parsed = parseBreedsCSV(text)
  const existing = listDictBreeds()
  const set = new Map(existing.map(b => [b.code, b]))
  let added = 0, updated = 0, skipped = 0
  if (mode === 'replace') {
    // clear and re-save
    localStorage.setItem('hb.dict.breeds', JSON.stringify([]))
  }
  for (const b of parsed) {
    if (!b.code || !b.label) { skipped++; continue }
    const prev = set.get(b.code)
    if (prev) updated++; else added++
    saveDictBreed({ code: b.code, label: b.label, synonyms: b.synonyms, status: b.status, createdAt: prev?.createdAt || b.createdAt })
  }
  return { added, updated, skipped }
}

export function regionsToCSV(): string {
  const rows = listDictRegions()
  return toCSV(rows.map(r => ({ code: r.code, label: r.label, status: r.status, order: r.order ?? '', createdAt: r.createdAt, updatedAt: r.updatedAt })))
}

export function parseRegionsCSV(text: string): DictRegion[] {
  const rows = parseCSV(text)
  const now = new Date().toISOString()
  return rows.map(r => ({
    code: normalizeDictCode(r.code || r.slug || ''),
    label: r.label || r.name || '',
    status: (r.status as DictRegion['status']) || 'active',
    order: r.order ? Number(r.order) : undefined,
    createdAt: r.createdAt || now,
    updatedAt: now,
  }))
}

export function importRegionsCSV(text: string, mode: 'merge'|'replace'='merge'): {added:number, updated:number, skipped:number} {
  const parsed = parseRegionsCSV(text)
  const existing = listDictRegions()
  const set = new Map(existing.map(r => [r.code, r]))
  let added = 0, updated = 0, skipped = 0
  if (mode === 'replace') {
    localStorage.setItem('hb.dict.regions', JSON.stringify([]))
  }
  for (const r of parsed) {
    if (!r.code || !r.label) { skipped++; continue }
    const prev = set.get(r.code)
    if (prev) updated++; else added++
    saveDictRegion({ code: r.code, label: r.label, status: r.status, createdAt: prev?.createdAt || r.createdAt })
  }
  return { added, updated, skipped }
}

// ——— Badges CSV
export function exportBadgesCSV(): string {
  const rows = listBadges()
  return toCSV(rows.map(b => ({ code: b.code, label: b.label, status: b.status, order: b.order ?? '' , createdAt: b.createdAt, updatedAt: b.updatedAt })))
}

export function importBadgesCSV(text: string, mode: 'merge'|'replace'='merge'): { ok: true; added:number; updated:number; skipped:number } {
  const parsed = parseCSV(text)
  if (mode === 'replace') localStorage.setItem('hb.dict.badges', JSON.stringify([]))
  const existing = new Map(listBadges().map(b => [b.code, b]))
  let added = 0, updated = 0, skipped = 0
  for (const r of parsed) {
    const code = normalizeDictCode(r.code || '')
    const label = (r.label || '').trim()
    if (!code || !label) { skipped++; continue }
    const prev = existing.get(code)
    const status = (r.isActive === 'true' || r.status === 'active') ? 'active' : (r.status as any) || 'active'
    const order = r.order ? Number(r.order) : undefined
    saveBadge({ code, label, status, order, createdAt: prev?.createdAt })
    if (prev) updated++; else added++
  }
  return { ok: true, added, updated, skipped }
}

// ——— Breeders public CSV helpers (minimal fields)
import type { BreederPublic } from '../../types/breeder.public'
import { listBreedersPublic as listBreedersPublicStore, saveBreederPublic as saveBreederPublicStore } from '../../state/breeders.public.store'

export function exportBreedersCSV(): string {
  const rows = listBreedersPublicStore()
  const pick = (b: BreederPublic) => ({
    breederId: b.breederId,
    slug: b.slug,
    displayName: b.displayName,
    region_code: b.regionCode,
    breeds: (b.breedCodes||[]).join('|'),
    badges: (b.badges||[]).join('|'),
    sales: b.stats?.sales ?? '',
    queens: b.stats?.queens ?? '',
    years: b.stats?.years ?? '',
    rating: b.stats?.rating ?? '',
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  })
  return toCSV(rows.map(pick))
}

export function importBreedersCSV(text: string): { added:number; updated:number; skipped:number } {
  const rows = parseCSV(text)
  const existing = listBreedersPublicStore()
  const idx = new Map(existing.map(b => [b.slug, b]))
  let added = 0, updated = 0, skipped = 0
  const nowIso = new Date().toISOString()
  for (const r of rows) {
    const slug = (r.slug||'').trim()
    const id = (r.breederId||'').trim()
    const name = (r.displayName||'').trim()
    // region matching using findRegion; breeds matching using matchBreed allowing synonyms
    const regionInput = (r.region || r.region_code || '').trim()
    const reg = findRegion(regionInput)
    const regionCode = reg?.code || (typeof r.region_code === 'string' ? r.region_code : '')
    const breedsRaw = (r.breeds || r.breedCodes || '').split(/[|,]/g).map(s => s.trim()).filter(Boolean)
    const breedCodes = breedsRaw.map(s => matchBreed(s) || s).filter(Boolean)
    if (!slug || !id || !name || !regionCode || breedCodes.length === 0) { skipped++; continue }
    const prev = idx.get(slug)
    const badges = String(r.badges||'').split(/[|,]/g).map(s=>s.trim()).filter(Boolean) as BreederPublic['badges']
    const stats = {
      sales: Number(r.sales||0)||0,
      queens: Number(r.queens||0)||0,
      years: Number(r.years||0)||0,
      rating: Number(r.rating||0)||0,
    }
    const row: BreederPublic = {
      breederId: id,
      slug,
      displayName: name,
      regionCode,
      breedCodes,
      badges,
      stats,
      createdAt: prev?.createdAt || (r.createdAt || nowIso),
      updatedAt: nowIso,
    }
    saveBreederPublicStore(row)
    if (prev) updated++; else added++
  }
  return { added, updated, skipped }
}
