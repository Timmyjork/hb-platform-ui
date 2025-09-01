import React from 'react'
import type { WidgetBase } from '../../analytics/dashboards'

export default function WidgetLibrary({ onAdd }: { onAdd: (type: WidgetBase['type']) => void }) {
  const types: WidgetBase['type'][] = ['kpi','line','bar','pie','table']
  return (
    <div className="flex flex-wrap gap-2">
      {types.map(t=> (
        <button key={t} className="rounded-md border px-2 py-1 text-sm" onClick={()=> onAdd(t)}>{t.toUpperCase()}</button>
      ))}
    </div>
  )
}

