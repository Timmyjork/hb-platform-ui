export type AnalyticsPreset = {
  id: string
  name: string
  // Filters
  fromMonth?: string
  toMonth?: string
  breeds?: string[]
  statuses?: string[]
  sources?: { phenotypes: boolean; hivecards: boolean }
  breakdown?: 'breed' | 'year' | 'source' | 'status'
  selectedCohorts?: string[]
}

const LS_KEY = 'analytics:presets:v1'

export function loadPresets(): AnalyticsPreset[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsPreset[]) : []
  } catch {
    return []
  }
}

export function savePreset(p: Omit<AnalyticsPreset, 'id'>): AnalyticsPreset {
  const id = `pr_${Math.random().toString(36).slice(2, 8)}`
  const next: AnalyticsPreset = { id, ...p }
  const all = loadPresets()
  all.unshift(next)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  return next
}

export function deletePreset(id: string) {
  const all = loadPresets().filter((p) => p.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function getPresetById(id: string): AnalyticsPreset | undefined {
  return loadPresets().find((p) => p.id === id)
}

