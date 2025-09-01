import React from 'react'
import type { WidgetBase } from '../../analytics/dashboards'

type Props = { widget: WidgetBase; onChange: (w: WidgetBase) => void }

export default function WidgetConfigForm({ widget, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-[var(--secondary)]">Title</label>
        <input className="w-full rounded border px-2 py-1 text-sm" value={widget.title} onChange={(e)=> onChange({ ...widget, title: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs text-[var(--secondary)]">Source</label>
        <select className="w-full rounded border px-2 py-1 text-sm" value={widget.source} onChange={(e)=> onChange({ ...widget, source: e.target.value as WidgetBase['source'] })}>
          <option value="phenotypes">Phenotypes</option>
          <option value="hivecards">Hive Cards</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[var(--secondary)]">Metrics (comma-separated)</label>
        <input className="w-full rounded border px-2 py-1 text-sm" value={(widget.metrics||[]).join(',')} onChange={(e)=> onChange({ ...widget, metrics: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
      </div>
      <div>
        <label className="block text-xs text-[var(--secondary)]">Group by (comma-separated)</label>
        <input className="w-full rounded border px-2 py-1 text-sm" value={(widget.groupBy||[]).join(',')} onChange={(e)=> onChange({ ...widget, groupBy: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
      </div>
    </div>
  )
}
