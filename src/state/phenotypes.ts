export type Scale = 1 | 2 | 3 | 4 | 5
export type Color = "light" | "yellow" | "dark" | "black"

export type PhenotypeRecord = {
  id: string
  createdAt: string
  morphology: {
    lengthMm: number
    massPreMg: number
    massPostMg: number
    color: Color | ""
    abdomenShape: Scale | 0
    symmetry: boolean
    notes?: string
  }
  behavior: {
    aggression: Scale | 0
    swarming: Scale | 0
    hygienicPct: number
    winterHardiness: Scale | 0
  }
  productivity: {
    eggsPerDay: number
    broodDensity: Scale | 0
    honeyKg: number
    winterFeedKg: number
    springDev: Scale | 0
  }
}

const LS_KEY = "hb:phenotypes:saved"

export function list(): PhenotypeRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as PhenotypeRecord[]) : []
  } catch {
    return []
  }
}

export function save(rec: Omit<PhenotypeRecord, "id" | "createdAt">): PhenotypeRecord {
  const newRec: PhenotypeRecord = {
    id: `ph_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...rec,
  }
  const all = list()
  all.unshift(newRec)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  return newRec
}

export function clearAll(): void {
  localStorage.removeItem(LS_KEY)
}

export function upsertMany(rows: PhenotypeRecord[]): { added: number; updated: number } {
  const existing = list()
  const byId = new Map(existing.map((r) => [r.id, r]))
  let added = 0
  let updated = 0
  for (const r of rows) {
    if (byId.has(r.id)) {
      byId.set(r.id, r)
      updated++
    } else {
      byId.set(r.id, r)
      added++
    }
  }
  const next = Array.from(byId.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  localStorage.setItem(LS_KEY, JSON.stringify(next))
  return { added, updated }
}

function toNumber(v: unknown, fallback = 0): number {
  if (v === '' || v == null) return fallback
  const n = Number(v)
  return isNaN(n) ? fallback : n
}

function toScale(v: unknown): Scale | 0 {
  const n = toNumber(v, 0)
  return (n >= 1 && n <= 5 ? (n as Scale) : 0)
}

function toColor(v: unknown): Color | '' {
  if (v === 'light' || v === 'yellow' || v === 'dark' || v === 'black') return v
  return ''
}

export function fromFlat(obj: Record<string, string | number>): PhenotypeRecord {
  const id = String(obj.id ?? `ph_${Date.now()}`)
  const createdAt = String(obj.createdAt ?? new Date().toISOString())
  return {
    id,
    createdAt,
    morphology: {
      lengthMm: toNumber(obj['morphology.lengthMm']),
      massPreMg: toNumber(obj['morphology.massPreMg']),
      massPostMg: toNumber(obj['morphology.massPostMg']),
      color: toColor(obj['morphology.color']),
      abdomenShape: toScale(obj['morphology.abdomenShape']),
      symmetry: String(obj['morphology.symmetry']).toLowerCase() === 'true' || obj['morphology.symmetry'] === 1 || obj['morphology.symmetry'] === '1',
      notes: obj['morphology.notes'] ? String(obj['morphology.notes']) : '',
    },
    behavior: {
      aggression: toScale(obj['behavior.aggression']),
      swarming: toScale(obj['behavior.swarming']),
      hygienicPct: toNumber(obj['behavior.hygienicPct']),
      winterHardiness: toScale(obj['behavior.winterHardiness']),
    },
    productivity: {
      eggsPerDay: toNumber(obj['productivity.eggsPerDay']),
      broodDensity: toScale(obj['productivity.broodDensity']),
      honeyKg: toNumber(obj['productivity.honeyKg']),
      winterFeedKg: toNumber(obj['productivity.winterFeedKg']),
      springDev: toScale(obj['productivity.springDev']),
    },
  }
}
