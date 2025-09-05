export type RoleKey = 'guest'|'buyer'|'breeder'|'regional_admin'|'internal'|'global_admin'
export type NavItem = { id: string; label: string; public?: boolean; roles?: RoleKey[] }

import NAV from '../config/nav.json'
export const NAV_BY_ROLE = NAV as unknown as Record<RoleKey, NavItem[]>

export function can(role: RoleKey, featureId: string): boolean {
  const items = NAV_BY_ROLE[role] || []
  return items.some(i => i.id === featureId)
}
