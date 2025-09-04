import type { QueenId } from '../types/queen'

export type QueenIdParts = {
  country: 'UA'
  // lineageCode a.k.a breedCode in UI/tests
  breedCode: string // "7" (1..99)
  unionCode: string // "45" (1..9999)
  breederNo: string // "1" (1..9999)
  queenNo: string // "25" (1..999999, >=1)
  year: number // 2025 (YYYY)
}

function fail(code: string, message: string): never {
  throw new Error(`${code}: ${message}`)
}

export function normalizeId(id: string): string {
  // Trim spaces around and normalize country to upper-case
  const s = String(id || '').trim()
  // Do not allow inner spaces at all
  if (/\s/.test(s)) return s // keep as-is; parser will mark format invalid later
  // Normalize UA case if present
  const m = s.match(/^([A-Za-z]{2})(\..*)$/)
  if (m) return `${m[1].toUpperCase()}${m[2]}`
  return s
}

export function buildQueenId(p: QueenIdParts): QueenId {
  return `${p.country}.${p.breedCode}.${p.unionCode}.${p.breederNo}.${p.queenNo}.${p.year}`
}

export function parseQueenId(id: QueenId): QueenIdParts | null {
  const s = normalizeId(id)
  // No spaces allowed anywhere per spec
  if (/\s/.test(s)) return null
  const m = s.match(/^([A-Z]{2})\.(\d{1,2})\.(\d{1,4})\.(\d{1,4})\.(\d{1,6})\.(\d{4})$/)
  if (!m) return null
  const country = m[1]
  const breedCode = m[2]
  const unionCode = m[3]
  const breederNo = m[4]
  const queenNo = m[5]
  const year = Number(m[6])
  if (country !== 'UA') return null
  const n = (x: string) => Number(x)
  const inRange = (v: number, min: number, max: number) => Number.isInteger(v) && v >= min && v <= max
  const b = n(breedCode)
  const u = n(unionCode)
  const br = n(breederNo)
  const q = n(queenNo)
  if (!inRange(b, 1, 99)) return null
  if (!inRange(u, 1, 9999)) return null
  if (!inRange(br, 1, 9999)) return null
  if (!inRange(q, 1, 999999)) return null
  if (!/^(19|20|21)\d{2}$/.test(String(year))) return null
  // Disallow leading zeros (natural numbers without leading 0) except single digit
  const noLeadZero = (x: string) => x === String(Number(x))
  if (!noLeadZero(breedCode)) return null
  if (!noLeadZero(unionCode)) return null
  if (!noLeadZero(breederNo)) return null
  if (!noLeadZero(queenNo)) return null
  return { country: 'UA', breedCode, unionCode, breederNo, queenNo, year }
}

export function assertValidQueenId(id: string): QueenIdParts {
  const parts = parseQueenId(id as QueenId)
  if (!parts) fail('E_ID_FORMAT', `Неправильний формат ID: ${id}`)
  return parts
}
