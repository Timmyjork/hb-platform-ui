export type Sources = { phenotypes: boolean; hivecards: boolean }
export type FilterState = {
  from?: string // YYYY-MM or YYYY-MM-DD
  to?: string
  breeds: string[]
  statuses: string[]
  region?: string
  sources: Sources
}

const LS_KEY = 'analytics:filters:v1'

export function defaultFilters(): FilterState {
  return { breeds: [], statuses: [], sources: { phenotypes: true, hivecards: true } }
}

export function loadFilters(): FilterState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...defaultFilters(), ...(JSON.parse(raw) as FilterState) } : defaultFilters()
  } catch {
    return defaultFilters()
  }
}

export function saveFilters(f: FilterState) {
  localStorage.setItem(LS_KEY, JSON.stringify(f))
}

export function parseURL(search: string): Partial<FilterState> {
  const sp = new URLSearchParams(search)
  const from = sp.get('from') ?? undefined
  const to = sp.get('to') ?? undefined
  const breeds = (sp.get('breeds') ?? '').split(',').filter(Boolean)
  const statuses = (sp.get('statuses') ?? '').split(',').filter(Boolean)
  const region = sp.get('region') ?? undefined
  const s = (sp.get('sources') ?? '').split(',').filter(Boolean)
  const sources: Sources = {
    phenotypes: s.length ? s.includes('phenotypes') : true,
    hivecards: s.length ? s.includes('hivecards') : true,
  }
  const out: Partial<FilterState> = { from, to, breeds, statuses, region, sources }
  return out
}

export function toURL(f: Partial<FilterState>): string {
  const sp = new URLSearchParams()
  if (f.from) sp.set('from', f.from)
  if (f.to) sp.set('to', f.to)
  if (f.breeds && f.breeds.length) sp.set('breeds', f.breeds.join(','))
  if (f.statuses && f.statuses.length) sp.set('statuses', f.statuses.join(','))
  if (f.region) sp.set('region', f.region)
  if (f.sources) {
    const arr: string[] = []
    if (f.sources.phenotypes) arr.push('phenotypes')
    if (f.sources.hivecards) arr.push('hivecards')
    if (arr.length) sp.set('sources', arr.join(','))
  }
  return `?${sp.toString()}`
}

