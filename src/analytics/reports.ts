import type { FilterState } from './filters'

export type ReportPreset = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  filters: FilterState
  segments: Array<{ groupBy: Array<'breed'|'region'|'year'|'status'> }>
  charts: Array<'trend'|'bar'|'pie'>
}

const LS_KEY = 'hb:reports'

export function listReports(): ReportPreset[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as ReportPreset[]) : []
  } catch {
    return []
  }
}

export function saveReport(preset: Omit<ReportPreset, 'id'|'createdAt'|'updatedAt'>): ReportPreset {
  const now = new Date().toISOString()
  const id = `rp_${Math.random().toString(36).slice(2, 8)}`
  const pr: ReportPreset = { id, createdAt: now, updatedAt: now, ...preset }
  const all = listReports()
  all.unshift(pr)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  return pr
}

export function updateReport(id: string, patch: Partial<ReportPreset>): ReportPreset | undefined {
  const all = listReports()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return undefined
  const next = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  all[idx] = next
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  return next
}

export function deleteReport(id: string) {
  const all = listReports().filter((r) => r.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function getReport(id: string): ReportPreset | undefined {
  return listReports().find((r) => r.id === id)
}

