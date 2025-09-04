export type BreederProfile = {
  userId: string
  breederNo: number
  country: 'UA' | 'DE' | string
  unionCode: number | null
  // New fields for dictionaries
  regionCode?: string // ISO like UA-32
  defaultBreedCode?: string // slug like 'carnica'
}

const LS_KEY = 'hb.profiles'
const LS_COUNTER = 'hb.breeder_no_counter'

function readAll(): Record<string, BreederProfile> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, BreederProfile>) : {}
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, BreederProfile>) {
  localStorage.setItem(LS_KEY, JSON.stringify(map))
}

function nextBreederNo(): number {
  const cur = Number(localStorage.getItem(LS_COUNTER) || '0') || 0
  const next = cur + 1
  localStorage.setItem(LS_COUNTER, String(next))
  return next
}

export function getProfile(userId: string): BreederProfile {
  const all = readAll()
  const existing = all[userId]
  if (existing) return existing
  const profile: BreederProfile = {
    userId,
    breederNo: nextBreederNo(),
    country: 'UA',
    unionCode: 9,
    regionCode: 'UA-32',
    defaultBreedCode: 'carnica',
  }
  all[userId] = profile
  writeAll(all)
  return profile
}

export function saveProfile(p: BreederProfile) {
  const all = readAll()
  all[p.userId] = p
  writeAll(all)
}

export function getBreederDefaults(userId = 'currentUser') {
  const p = getProfile(userId)
  return {
    country: (p.country as 'UA') || 'UA',
    regionCode: p.regionCode || 'UA-32',
    defaultBreedCode: p.defaultBreedCode || 'carnica',
    breederNo: p.breederNo,
  }
}
