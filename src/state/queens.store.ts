import type { Queen, TenTraits } from '../types/queen'
import type { QueenIdParts } from '../utils/queenId'
import { buildQueenId, assertValidQueenId, normalizeId } from '../utils/queenId'

const LS_KEY = 'hb.queens'
const LS_IDS_KEY = 'hb.queen_ids'

let idIndex: Set<string> | null = null

function loadIdIndex(): Set<string> {
  if (idIndex) return idIndex
  try {
    const raw = localStorage.getItem(LS_IDS_KEY)
    if (raw) {
      idIndex = new Set<string>(JSON.parse(raw) as string[])
      return idIndex
    }
  } catch (_e) { void 0 }
  // Fallback: derive from current queens
  const ids = new Set<string>(read().map(q => q.id))
  idIndex = ids
  persistIdIndex()
  return idIndex
}

function persistIdIndex(): void {
  if (!idIndex) return
  localStorage.setItem(LS_IDS_KEY, JSON.stringify(Array.from(idIndex)))
}

export function ensureUnique(id: string): void {
  const norm = normalizeId(id)
  const idx = loadIdIndex()
  if (idx.has(norm)) {
    throw new Error(`E_ID_DUPLICATE: ID вже існує: ${norm}`)
  }
}

export function nextAvailableQueenNo(base: { country: 'UA'; breedCode: string; unionCode: string; breederNo: string; year: number }, startNo: number): number {
  const idx = loadIdIndex()
  let n = Math.max(1, Math.floor(startNo))
  for (;;) {
    const id = buildQueenId({ country: base.country, breedCode: base.breedCode, unionCode: base.unionCode, breederNo: base.breederNo, queenNo: String(n), year: base.year })
    if (!idx.has(id)) return n
    n++
  }
}

function read(): Queen[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Queen[]) : []
  } catch {
    return []
  }
}

function write(rows: Queen[]): Queen[] {
  localStorage.setItem(LS_KEY, JSON.stringify(rows))
  return rows
}

export function listQueens(): Queen[] {
  return read()
}

export function saveQueens(rows: Queen[]): Queen[] {
  // Validate format and de-duplicate before saving
  const seen = new Set<string>()
  for (const q of rows) {
    assertValidQueenId(q.id)
    const id = normalizeId(q.id)
    if (seen.has(id)) {
      throw new Error(`E_ID_DUPLICATE: ID вже існує: ${id}`)
    }
    seen.add(id)
  }
  // Persist rows and rebuild id index from rows
  const out = write(rows)
  idIndex = new Set(out.map(q => q.id))
  persistIdIndex()
  return out
}

export function addQueensBatch(opts:
  | {
      parts: Omit<QueenIdParts, 'queenNo' | 'country'> & { startQueenNo: number; count: number }
      baseTraits: TenTraits
      breederId: string
      status?: Queen['status']
      motherId?: string
    }
  | {
      count: number
      startQueenNo: number
      country: 'UA'
      lineageCode?: string // alias for breedCode
      breedCode?: string
      unionCode: string
      breederNo: string
      year: number
      baseTraits: TenTraits
      breederId: string
      status?: Queen['status']
      motherId?: string
    }
): Queen[] {
  const now = new Date().toISOString()
  const status: Queen['status'] = (opts as any).status ?? 'listed'
  const existing = read()
  const idx = loadIdIndex()
  const next: Queen[] = []
  // Normalize options
  const count = 'parts' in opts ? opts.parts.count : opts.count
  const start = 'parts' in opts ? opts.parts.startQueenNo : opts.startQueenNo
  const breedCode = 'parts' in opts ? opts.parts.breedCode : (opts.breedCode || (opts as any).lineageCode)
  const unionCode = 'parts' in opts ? opts.parts.unionCode : opts.unionCode
  const breederNo = 'parts' in opts ? opts.parts.breederNo : opts.breederNo
  const year = 'parts' in opts ? opts.parts.year : opts.year
  const breederId = (opts as any).breederId
  const baseTraits = (opts as any).baseTraits as TenTraits
  const motherId = (opts as any).motherId as string | undefined
  if (!breedCode || !unionCode || !breederNo || !year) {
    throw new Error('E_ID_PARTS_REQUIRED: Усі частини паспорта обов’язкові (UA, підвид, спілка, № маткаря, № матки, рік)')
  }
  for (let i = 0; i < Math.max(0, count); i++) {
    const base = { country: 'UA' as const, breedCode, unionCode, breederNo, year }
    const n = nextAvailableQueenNo(base, start + i)
    const queenNo = String(n)
    const id = buildQueenId({ ...base, queenNo })
    assertValidQueenId(id)
    if (idx.has(id)) continue // safety; though nextAvailableQueenNo should avoid
    const row: Queen = {
      id,
      breederId,
      unionCode,
      breedCode,
      breederNo,
      queenNo,
      year,
      country: 'UA',
      baseTraits,
      status,
      createdAt: now,
      updatedAt: now,
    }
    if (motherId) row.motherId = motherId
    next.push(row)
    idx.add(id)
  }
  persistIdIndex()
  const out = existing.concat(next)
  write(out)
  return next
}

export function transferOwnership(queenId: string, buyerUserId: string): Queen | null {
  const rows = read()
  const idx = rows.findIndex(q => q.id === queenId)
  if (idx === -1) return null
  const now = new Date().toISOString()
  rows[idx] = { ...rows[idx], ownerUserId: buyerUserId, status: 'active', updatedAt: now }
  write(rows)
  return rows[idx]
}
