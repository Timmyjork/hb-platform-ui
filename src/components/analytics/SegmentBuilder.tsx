import React, { useMemo, useRef } from 'react'
import type { UnifiedRow } from '../../analytics/selectors'
import { buildSegments, type SegmentRule } from '../../analytics/segments'
import { exportCSV, exportXLSX, exportChart } from '../../utils/export'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend } from 'recharts'

export default function SegmentBuilder({ rows }: { rows: UnifiedRow[] }) {
  const [groupBy, setGroupBy] = React.useState<Array<'breed'|'region'|'year'|'status'>>(['breed'])
  const [metric, setMetric] = React.useState<'avgHoney'|'avgEggRate'|'avgHygiene'>('avgHygiene')
  const rule: SegmentRule = { groupBy }
  const segments = useMemo(()=> buildSegments(rows, rule), [rows, rule])
  const chartRef = useRef<HTMLDivElement>(null)

  const table = segments.map(s=>({
    Cohort: s.label,
    N: s.metrics.countColonies,
    AvgHoney: s.metrics.avgHoney,
    AvgEggs: s.metrics.avgEggRate,
    Hygiene: s.metrics.avgHygiene,
  }))

  const data = segments.map(s=>({ name: s.label, v: metric==='avgHoney'? s.metrics.avgHoney : metric==='avgEggRate'? s.metrics.avgEggRate : s.metrics.avgHygiene }))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[var(--secondary)]">Group by:</span>
        {(['breed','region','year','status'] as const).map(g=> (
          <label key={g} className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={groupBy.includes(g)} onChange={(e)=> setGroupBy(prev=> e.target.checked? [...prev,g] : prev.filter(x=>x!==g))} /> {g}
          </label>
        ))}
        <span className="ml-3 text-xs font-medium text-[var(--secondary)]">Metric:</span>
        <select value={metric} onChange={(e)=> setMetric(e.target.value as 'avgHoney'|'avgEggRate'|'avgHygiene')} className="rounded-md border px-2 py-1 text-sm">
          <option value="avgHygiene">Hygiene %</option>
          <option value="avgEggRate">Eggs/Day</option>
          <option value="avgHoney">Honey kg</option>
        </select>
        <button className="ml-auto rounded-md border px-2 py-1 text-sm" onClick={()=> exportCSV('segments.csv', table as unknown as Array<Record<string,unknown>>)}>Export CSV</button>
        <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> exportXLSX('segments.xlsx', { Segments: table as unknown as Array<Record<string,unknown>>})}>Export XLSX</button>
        <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> chartRef.current && exportChart(chartRef.current, 'segments')}>Export Chart</button>
      </div>
      <div ref={chartRef} className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Line type="monotone" dataKey="v" stroke="#0EA5E9" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
        <div className="text-sm font-medium mb-2">Segments</div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(table[0]||{Cohort:'',N:0}).map(h=> <th key={h} className="px-2 py-1 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.map((r,i)=> (
                <tr key={i} className="border-t">
                  {Object.keys(table[0]||{Cohort:'',N:0}).map(h=> <td key={h} className="px-2 py-1">{String((r as Record<string,unknown>)[h]??'')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
