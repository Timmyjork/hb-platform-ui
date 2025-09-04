// Lightweight validator mirroring the intended Zod schema
import type { TenTraits } from '../types/queen'

export type QueenBatchInput = {
  country: 'UA'
  lineageCode: number
  unionCode: number
  breederNo: number
  year: number
  startQueenNo: number
  count: number
  motherId?: string
  isMother?: boolean
  baseTraits?: TenTraits
  status?: 'draft'|'listed'
}

function intIn(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
}

function fail(code: string, msg: string): never { throw new Error(`${code}: ${msg}`) }

export const QueenBatchSchema = {
  parse(input: Partial<QueenBatchInput>): QueenBatchInput {
    if (input.country !== 'UA') fail('E_ID_FORMAT', 'Неправильний формат ID: country')
    if (!intIn(input.lineageCode, 1, 99)) fail('E_ID_FORMAT', 'Неправильний формат ID: lineageCode')
    if (!intIn(input.unionCode, 1, 9999)) fail('E_ID_FORMAT', 'Неправильний формат ID: unionCode')
    if (!intIn(input.breederNo, 1, 9999)) fail('E_ID_FORMAT', 'Неправильний формат ID: breederNo')
    if (!intIn(input.year, 2000, 2100)) fail('E_ID_FORMAT', 'Неправильний формат ID: year')
    if (!intIn(input.startQueenNo, 1, Number.MAX_SAFE_INTEGER)) fail('E_ID_FORMAT', 'Неправильний формат ID: queenNo')
    if (!intIn(input.count, 1, 5000)) fail('E_ID_FORMAT', 'Неправильний формат: count')
    return input as QueenBatchInput
  }
}

export function validateBusinessRules(input: QueenBatchInput): void {
  const nowYear = new Date().getFullYear()
  if (input.isMother) {
    if (input.startQueenNo !== 1 || input.count !== 1) {
      fail('E_ID_PARTS_REQUIRED', 'Усі частини паспорта обов’язкові (UA, підвид, спілка, № маткаря, № матки, рік)')
    }
    if (input.year > nowYear) fail('E_RULE_YEAR', 'Партія для продажу має поточний рік')
  } else {
    if (input.status === 'listed' && input.year !== nowYear) {
      fail('E_RULE_YEAR', 'Партія для продажу має поточний рік')
    }
  }
}

