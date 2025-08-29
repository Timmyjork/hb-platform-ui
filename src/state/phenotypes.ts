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

