import type { RoleKey } from '../state/profile.store'

const roleAliases: Record<string, RoleKey> = {
  guest: 'guest',
  pasichnik: 'buyer', buyer: 'buyer',
  matkar: 'breeder', breeder: 'breeder',
  golova: 'regional_admin', regional_admin: 'regional_admin',
  admin: 'internal', local_admin: 'internal',
}

const roleToAlias: Record<RoleKey, string> = {
  guest: 'guest',
  buyer: 'pasichnik',
  breeder: 'matkar',
  regional_admin: 'golova',
  internal: 'admin',
  global_admin: 'admin',
}

// page slug to id map (role-agnostic where possible)
const pageMap: Record<string, string> = {
  shop: 'shop',
  cart: 'cart',
  orders: 'orders',
  my_queens: 'my_queens',
  observations: 'observations',
  listings: 'listings',
  transfer: 'transfer',
  queens_batch: 'queens_batch',
  regions: 'analytics_regional',
  alerts: 'analytics_alerts',
  export: 'export_center',
  import_export: 'import_export',
  profile: 'breeder_dashboard',
  ratings: 'ratings', // resolved by role below
}

export function parsePath(base: string, path: string): { role: RoleKey; pageId?: string } {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  let rel = path.startsWith(cleanBase) ? path.slice(cleanBase.length) : path
  if (rel.startsWith('/')) rel = rel.slice(1)
  const parts = rel.split('/').filter(Boolean)
  const roleAlias = parts[0] || 'guest'
  const role = roleAliases[roleAlias] || 'guest'
  const slug = parts[1] || 'shop'
  let pageId = pageMap[slug] || slug
  if (pageId === 'ratings') {
    pageId = (role === 'breeder' || role === 'regional_admin' || role === 'internal') ? 'analytics_ratings' : 'ratings_public'
  }
  return { role, pageId }
}

export function buildPath(base: string, role: RoleKey, pageId: string): string {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const roleSeg = roleToAlias[role] || 'guest'
  // invert page map for known ids
  const inv: Record<string, string> = {}
  Object.keys(pageMap).forEach((k) => { inv[pageMap[k]] = k })
  let slug = inv[pageId] || pageId
  if (pageId === 'ratings_public' || pageId === 'analytics_ratings') slug = 'ratings'
  return `${cleanBase}/${roleSeg}/${slug}`
}

