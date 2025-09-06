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

// ——— Auth facade (source of truth for role in shell)
export type RoleKey = 'guest'|'buyer'|'breeder'|'regional_admin'|'internal'|'global_admin'
export type CurrentUser = { id: string|null; email?: string|null; role: RoleKey }

const LS_AUTH = 'hb.auth'
let auth: CurrentUser | null = null
const listeners = new Set<() => void>()

function emitAuth() { listeners.forEach(fn => { try { fn() } catch {} }) }

export function getAuth(): CurrentUser {
  if (auth) return auth
  try {
    const raw = localStorage.getItem(LS_AUTH)
    if (raw) { auth = JSON.parse(raw) as CurrentUser; return auth }
  } catch {}
  auth = { id: null, email: null, role: 'guest' }
  return auth
}

function setAuth(next: CurrentUser) {
  auth = next
  try { localStorage.setItem(LS_AUTH, JSON.stringify(next)) } catch {}
  emitAuth()
}

export function onAuthChange(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function loginAsBuyer(email: string): CurrentUser {
  const uid = `Buyer-${Math.random().toString(36).slice(2,6)}`
  const u: CurrentUser = { id: uid, email, role: 'buyer' }
  setAuth(u)
  return u
}

export function loginAsBreeder(email?: string): CurrentUser {
  const uid = 'breeder'
  const u: CurrentUser = { id: uid, email: email || null, role: 'breeder' }
  setAuth(u)
  return u
}

export function logout(): void {
  setAuth({ id: null, email: null, role: 'guest' })
  try { localStorage.removeItem(LS_AUTH); localStorage.removeItem('hb.role') } catch {}
}

export function setRole(r: RoleKey): void {
  if (r === 'guest') {
    logout(); return
  }
  const cur = getAuth()
  const id = cur.id || 'U_TEST'
  setAuth({ id, email: cur.email || null, role: r })
}
