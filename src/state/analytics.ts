// src/state/analytics.ts
// Normalization of stored data and aggregate helpers for Analytics page

export type PhenotypeEntry = {
  id: string
  queenId: string
  colonyId?: string
  date: Date
  breed?: string
  status?: string
  // Morphology
  lengthMm?: number
  massPreMg?: number
  massPostMg?: number
  color?: string
  abdomenShape?: number // 1..5
  symmetryOk?: boolean
  // Behavior
  aggression?: number // 1..5
  swarming?: number // 1..5
  hygienePct?: number // 0..100
  winterHardiness?: number // 1..5
  // Productivity
  eggsPerDay?: number
  broodDensity?: number // 1..5
  honeyKg?: number
  winterFeedKg?: number
  springDev?: number // 1..5
}

export type HiveCardEntry = {
  id: string
  colonyId: string
  date: Date
  breed?: string
  status?: string
  framesOccupied: number
  broodOpen: number
  broodCapped: number
  note?: string
}

// Helpers
const parseDate = (v: unknown): Date => {
  const s = String(v ?? '')
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date(0) : d
}
const toNum = (v: unknown): number | undefined => {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
const toInt = (v: unknown): number | undefined => {
  const n = Number(v)
  return Number.isInteger(n) ? n : undefined
}
const s = (v: unknown): string => (v == null ? '' : String(v))

// Storage keys (standardized) with fallbacks to existing keys in app
const PHENOS_KEY = 'phenotypes:data'
const PHENOS_FALLBACK = 'hb:phenotypes:saved'
const HIVECARDS_KEY = 'hivecards:data'
const HIVECARDS_FALLBACK = 'hiveCard.rows.v1'

export function getPhenotypes(): PhenotypeEntry[] {
  try {
    const raw =
      localStorage.getItem(PHENOS_KEY) ?? localStorage.getItem(PHENOS_FALLBACK)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown[]
    return arr.map((it, idx) => normalizePhenotype(it, idx))
  } catch {
    return []
  }
}

function normalizePhenotype(it: unknown, idx = 0): PhenotypeEntry {
  const o: Record<string, unknown> = (it as Record<string, unknown>) || {}
  // Our app saved records under { morphology, behavior, productivity }
  const morph: Record<string, unknown> = (o['morphology'] as Record<string, unknown>) || {}
  const beh: Record<string, unknown> = (o['behavior'] as Record<string, unknown>) || {}
  const prod: Record<string, unknown> = (o['productivity'] as Record<string, unknown>) || {}
  const id = String(o['id'] ?? `ph_${idx}`)
  const queenId = s(o['queenId'] ?? o['queen_id'])
  const colonyId = o['colonyId'] ? s(o['colonyId']) : undefined
  const dateRaw = o['date'] ?? o['createdAt'] ?? o['updatedAt']
  return {
    id,
    queenId,
    colonyId,
    date: parseDate(dateRaw),
    breed: s(o['breed']),
    status: s(o['status']),
    lengthMm: toNum(morph['lengthMm'] ?? o['length_mm']),
    massPreMg: toNum(morph['massPreMg'] ?? o['mass_pre_mg']),
    massPostMg: toNum(morph['massPostMg'] ?? o['mass_post_mg']),
    color: s(morph['color'] ?? o['color'] ?? ''),
    abdomenShape: toInt(morph['abdomenShape'] ?? o['abdomen_shape']),
    symmetryOk: typeof morph['symmetry'] === 'boolean' ? (morph['symmetry'] as boolean) : undefined,
    aggression: toInt(beh['aggression'] ?? o['aggression']),
    swarming: toInt(beh['swarming'] ?? o['swarming']),
    hygienePct: toNum(beh['hygienicPct'] ?? o['hygiene_pct']),
    winterHardiness: toInt(beh['winterHardiness'] ?? o['winter_hardiness']),
    eggsPerDay: toNum(prod['eggsPerDay'] ?? o['egg_prod']),
    broodDensity: toInt(prod['broodDensity'] ?? o['brood_density']),
    honeyKg: toNum(prod['honeyKg'] ?? o['honey_kg']),
    winterFeedKg: toNum(prod['winterFeedKg'] ?? o['winter_feed_kg']),
    springDev: toInt(prod['springDev'] ?? o['spring_dev']),
  }
}

export function getHiveCards(): HiveCardEntry[] {
  try {
    const raw =
      localStorage.getItem(HIVECARDS_KEY) ?? localStorage.getItem(HIVECARDS_FALLBACK)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown[]
    return arr.map((it, idx) => normalizeHiveCard(it, idx))
  } catch {
    return []
  }
}

function normalizeHiveCard(it: unknown, idx = 0): HiveCardEntry {
  const o: Record<string, unknown> = (it as Record<string, unknown>) || {}
  const id = String(o['id'] ?? `hc_${idx}`)
  const colonyId = s(o['colonyId'] ?? o['hiveNo'] ?? '')
  const dateRaw = o['date']
  const breed = s(o['breed'])
  const status = s(o['status'])
  const framesOccupied = Number(o['frames'] ?? o['framesOccupied'] ?? 0) || 0
  const broodOpen = Number(o['openBrood'] ?? o['broodOpen'] ?? 0) || 0
  const broodCapped = Number(o['sealedBrood'] ?? o['broodCapped'] ?? 0) || 0
  const note = o['notes'] ? s(o['notes']) : undefined
  return {
    id,
    colonyId,
    date: parseDate(dateRaw),
    breed,
    status,
    framesOccupied,
    broodOpen,
    broodCapped,
    note,
  }
}

// Aggregates
export function calcPhenotypeKPI(entries: PhenotypeEntry[]) {
  const n = new Set(entries.map((e) => e.queenId).filter(Boolean)).size
  const avg = (vs: Array<number | undefined>) => {
    const a = vs.filter((x): x is number => typeof x === 'number' && !isNaN(x))
    return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0
  }
  return {
    countQueens: n,
    avgEggsPerDay: avg(entries.map((e) => e.eggsPerDay)),
    avgHygienePct: avg(entries.map((e) => e.hygienePct)),
    avgTemperament: avg(entries.map((e) => e.aggression)),
    avgWinterHardiness: avg(entries.map((e) => e.winterHardiness)),
    avgSpringDev: avg(entries.map((e) => e.springDev)),
  }
}

export function calcHiveKPI(entries: HiveCardEntry[]) {
  const n = new Set(entries.map((e) => e.colonyId).filter(Boolean)).size
  const avg = (vs: number[]) => (vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : 0)
  const frames = avg(entries.map((e) => e.framesOccupied))
  const open = avg(entries.map((e) => e.broodOpen))
  const capped = avg(entries.map((e) => e.broodCapped))
  const ratio = open + capped > 0 ? open / (open + capped) : 0
  return {
    countColonies: n,
    avgFramesOccupied: frames,
    avgBroodOpen: open,
    avgBroodCapped: capped,
    broodRatio: ratio,
  }
}

export type MonthlyPoint = {
  month: string // YYYY-MM
  [metric: string]: number | string
}

export function seriesByMonth<T>(
  entries: T[],
  getDate: (t: T) => Date,
  metrics: Record<string, (items: T[]) => number>
): MonthlyPoint[] {
  const groups = new Map<string, T[]>()
  for (const e of entries) {
    const d = getDate(e)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const arr = groups.get(key) ?? []
    arr.push(e)
    groups.set(key, arr)
  }
  const points: MonthlyPoint[] = []
  const keys = Array.from(groups.keys()).sort()
  for (const k of keys) {
    const items = groups.get(k) ?? []
    const point: MonthlyPoint = { month: k }
    for (const [name, fn] of Object.entries(metrics)) {
      const val = fn(items)
      point[name] = Number.isFinite(val) ? val : 0
    }
    points.push(point)
  }
  return points
}

export function distribution<T extends Record<string, unknown>>(
  entries: T[],
  field: keyof T,
  bucketSize: number
): Array<{ bucket: number; count: number }> {
  if (bucketSize <= 0) return []
  const map = new Map<number, number>()
  for (const e of entries) {
    const v = Number(e[field] as unknown)
    if (!Number.isFinite(v)) continue
    const b = Math.floor(v / bucketSize) * bucketSize
    map.set(b, (map.get(b) ?? 0) + 1)
  }
  const buckets = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, count]) => ({ bucket, count }))
  return buckets
}

export function filterByDate<T extends { date: Date }>(rows: T[], from?: Date, to?: Date): T[] {
  return rows.filter((r) => {
    const t = r.date.getTime()
    if (isNaN(t)) return false
    if (from && t < from.getTime()) return false
    if (to && t > to.getTime()) return false
    return true
  })
}

export function uniqueValues<T extends Record<string, unknown>, K extends keyof T>(rows: T[], key: K): string[] {
  const set = new Set<string>()
  for (const r of rows) {
    const v = r[key]
    if (typeof v === 'string' && v.trim().length) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function applySegments<T extends { breed?: string; status?: string }>(rows: T[], seg: { breeds?: string[]; statuses?: string[] }): T[] {
  const bset = new Set((seg.breeds ?? []).filter(Boolean))
  const sset = new Set((seg.statuses ?? []).filter(Boolean))
  return rows.filter((r) => {
    const okBreed = bset.size ? (r.breed ? bset.has(r.breed) : false) : true
    const okStatus = sset.size ? (r.status ? sset.has(r.status) : false) : true
    return okBreed && okStatus
  })
}
