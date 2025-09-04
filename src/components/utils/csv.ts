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
import { parseQueenId as utilParseQueenId, normalizeId } from '../../utils/queenId'
import { ensureUnique as storeEnsureUnique } from '../../state/queens.store'
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
      if (reg) unionCode = String(Number(reg.code.slice(-2)))
      else console.warn('Unknown region in CSV:', inputRegion)
    }
    out.push({
      id: r.queenId || `UA.${breedCode}.${unionCode}.${r.breederNo}.${r.queenNo}.${r.year}`,
      breederId: String(r.breederId||'') || 'Breeder-1',
      unionCode,
      breedCode,
      breederNo: String(r.breederNo||''),
      queenNo: String(r.queenNo||''),
      year: Number(r.year||0),
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
  const parsed = parseQueensCSV(text)
  const valid: Array<Omit<Queen, 'createdAt'|'updatedAt'|'country'>> = []
  const skipped: string[] = []
  for (const r of parsed) {
    const id = normalizeId(r.id)
    const parts = utilParseQueenId(id)
    if (!parts) {
      throw new Error(`E_ID_FORMAT: Неправильний формат ID: ${id}`)
    }
    try {
      storeEnsureUnique(id)
      valid.push({ ...r, id })
    } catch {
      if (mode === 'strict') {
        skipped.push(id)
      } else {
        skipped.push(id)
        // skip duplicate, continue
      }
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
