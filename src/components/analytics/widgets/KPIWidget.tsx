import React, { useMemo } from 'react'
import type { WidgetBase } from '../../../analytics/dashboards'
import { selectFilteredRows } from '../../../analytics/selectors'
import { useAnalyticsFilters } from '../../../analytics/FilterContext'

export default function KPIWidget({ widget }: { widget: WidgetBase }) {
  const { global } = useAnalyticsFilters()
  const rows = useMemo(()=> selectFilteredRows({
    from: global.from ? new Date(global.from) : undefined,
    to: global.to ? new Date(global.to) : undefined,
    breeds: global.breeds,
    statuses: global.statuses,
    sources: global.sources,
  }), [global])
  const val = useMemo(()=>{
    const m = widget.metrics?.[0] || 'avgHygiene'
    if (m === 'countColonies') return new Set(rows.map(r=>r.colonyId).filter(Boolean)).size
    if (m === 'avgHoney') return avg(rows.map(r=> r.honeyKg))
    if (m === 'avgEggRate') return avg(rows.map(r=> r.eggsPerDay))
    if (m === 'avgHygiene') return avg(rows.map(r=> r.hygienePct))
    return 0
  }, [rows, widget.metrics])
  return <div className="text-2xl font-semibold">{Number.isFinite(val) ? Number(val).toFixed(1) : '—'}</div>
}

function avg(a: Array<number|undefined>): number { const f=a.filter((x):x is number=>typeof x==='number'); return f.length? f.reduce((s,v)=>s+v,0)/f.length:0 }

