import type { FilterState } from './filters'
import type { UnifiedRow } from './selectors'

export type SegmentRule = {
  groupBy: Array<'breed' | 'region' | 'year' | 'status'>
  filters?: FilterState
}

export type Segment = {
  key: string
  label: string
  items: UnifiedRow[]
  metrics: {
    countColonies: number
    avgHoney: number
    avgEggRate: number
    avgHygiene: number
    avgBV: number
    avgSI: number
  }
}

const avg = (vals: Array<number | undefined>): number => {
  const a = vals.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0
}

export function buildSegments(data: UnifiedRow[], rule: SegmentRule): Segment[] {
  const map = new Map<string, UnifiedRow[]>()
  for (const r of data) {
    const parts: string[] = []
    for (const g of rule.groupBy) {
      if (g === 'year') parts.push(String(r.date.getFullYear()))
      else if (g === 'breed') parts.push(r.breed || '(невідомо)')
      else if (g === 'status') parts.push(r.status || '(невідомо)')
      else if (g === 'region') {
        const reg = (r as Record<string, unknown>)['region']
        parts.push(typeof reg === 'string' && reg.length ? reg : '(невідомо)')
      }
    }
    const key = parts.join(' / ') || 'All'
    const arr = map.get(key) ?? []
    arr.push(r)
    map.set(key, arr)
  }
  const segs: Segment[] = []
  for (const [key, items] of map.entries()) {
    const colonies = new Set(items.map((i) => i.colonyId).filter(Boolean)).size
    const avgHoney = avg(items.map((i) => i.honeyKg))
    const avgEgg = avg(items.map((i) => i.eggsPerDay))
    const avgHyg = avg(items.map((i) => i.hygienePct))
    segs.push({
      key,
      label: key,
      items,
      metrics: {
        countColonies: colonies,
        avgHoney,
        avgEggRate: avgEgg,
        avgHygiene: avgHyg,
        avgBV: 0,
        avgSI: 0,
      },
    })
  }
  return segs.sort((a, b) => a.label.localeCompare(b.label))
}
