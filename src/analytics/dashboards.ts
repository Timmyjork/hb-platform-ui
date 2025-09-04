import type { FilterState } from './filters'

export type WidgetType = 'kpi'|'line'|'bar'|'pie'|'table'
export type DataSource = 'phenotypes'|'hivecards'

export type WidgetBase = {
  id: string
  type: WidgetType
  title: string
  source: DataSource
  metrics?: string[]
  groupBy?: string[]
  filters?: FilterState
}

export type LayoutItem = { id: string; x: number; y: number; w: number; h: number }

export type Dashboard = {
  id: string
  name: string
  roleScope: Array<'buyer'|'breeder'|'regional_admin'>
  widgets: WidgetBase[]
  layout: LayoutItem[]
  createdAt: string
  updatedAt: string

  shared?: SharedAccess[]
  publicLink?: string
  snapshots?: Array<{ id: string; ts: string; name: string; widgets: WidgetBase[]; layout: LayoutItem[] }>
}

export type DashState = { dashboards: Dashboard[]; activeId?: string }

const LS_KEY = 'hb:dashboards'

function starter(name: string): Dashboard {
  const now = new Date().toISOString()
  return { id: `db_${Math.random().toString(36).slice(2,8)}`, name, roleScope: ['buyer','breeder','regional_admin'], widgets: [], layout: [], createdAt: now, updatedAt: now }
}

function ensureSeed(): Dashboard[] {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) return JSON.parse(raw) as Dashboard[]
  const seed = [starter('Buyer dashboard'), starter('Breeder dashboard'), starter('Regional dashboard')]
  seed[0].roleScope = ['buyer']
  seed[1].roleScope = ['breeder']
  seed[2].roleScope = ['regional_admin']
  localStorage.setItem(LS_KEY, JSON.stringify(seed))
  return seed
}

export function listDashboards(): Dashboard[] { try { return ensureSeed() } catch { return [] } }
export function getDashboard(id: string): Dashboard | undefined { return listDashboards().find(d=>d.id===id) }
export function saveDashboard(d: Dashboard): void {
  const all = listDashboards()
  const i = all.findIndex(x=>x.id===d.id)
  if (i>=0) all[i]=d; else all.push(d)
  d.updatedAt = new Date().toISOString()
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}
export function updateDashboard(id: string, patch: Partial<Dashboard>): Dashboard {
  const all = listDashboards(); const i = all.findIndex(x=>x.id===id); if (i<0) throw new Error('not found')
  const next = { ...all[i], ...patch, updatedAt: new Date().toISOString() } as Dashboard
  all[i] = next; localStorage.setItem(LS_KEY, JSON.stringify(all)); return next
}
export function deleteDashboard(id: string): void {
  const all = listDashboards().filter(x=>x.id!==id); localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function setActiveFromURL(): string | undefined {
  const sp = new URLSearchParams(window.location.search)
  return sp.get('dash') ?? undefined
}
export function makeShareURL(id: string): string {
  const sp = new URLSearchParams(window.location.search)
  sp.set('dash', id)
  return `${window.location.origin}${window.location.pathname}?${sp.toString()}`
}

export function exportDashboardJSON(id: string): Blob {
  const db = getDashboard(id)
  if (!db) throw new Error('Dashboard not found')
  return new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
}
export async function importDashboardJSON(file: File): Promise<Dashboard> {
  const text = await file.text()
  const obj = JSON.parse(text) as Dashboard
  if (!obj || !obj.id || !obj.name) throw new Error('Invalid dashboard JSON')
  saveDashboard(obj)
  return obj
}

// Sharing & ACL
export type ShareRole = 'owner'|'editor'|'viewer'
export type SharedAccess = { userId: string; role: ShareRole }

export function addSharedUser(dashId: string, userId: string, role: ShareRole): void {
  const d = getDashboard(dashId); if (!d) return
  const list = d.shared ?? []
  const i = list.findIndex(x=>x.userId===userId)
  if (i>=0) list[i].role = role; else list.push({ userId, role })
  d.shared = list; saveDashboard(d)
}
export function removeSharedUser(dashId: string, userId: string): void {
  const d = getDashboard(dashId); if (!d) return
  d.shared = (d.shared ?? []).filter(x=>x.userId!==userId)
  saveDashboard(d)
}

export function setPublicLink(dashId: string, enable: boolean): string | undefined {
  const d = getDashboard(dashId); if (!d) return undefined
  d.publicLink = enable ? (d.publicLink ?? `pub_${cryptoRandom()}`) : undefined
  saveDashboard(d)
  return d.publicLink
}

export function getDashboardByPublicLink(token: string): Dashboard | undefined {
  return listDashboards().find(d=>d.publicLink===token)
}

// Snapshots
export function createSnapshot(dashId: string, name?: string): string {
  const d = getDashboard(dashId); if (!d) return ''
  const id = `sn_${cryptoRandom()}`
  const snap = { id, ts: new Date().toISOString(), name: name ?? new Date().toLocaleString(), widgets: deepCopy(d.widgets), layout: deepCopy(d.layout) }
  d.snapshots = [snap, ...((d.snapshots) ?? [])]
  saveDashboard(d)
  return id
}
export function restoreSnapshot(dashId: string, snapId: string): void {
  const d = getDashboard(dashId); if (!d) return
  const sn = (d.snapshots ?? []).find(s=>s.id===snapId); if (!sn) return
  d.widgets = deepCopy(sn.widgets)
  d.layout = deepCopy(sn.layout)
  d.updatedAt = new Date().toISOString()
  saveDashboard(d)
}

function deepCopy<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T }
function cryptoRandom(): string { return Math.random().toString(36).slice(2, 10) }
