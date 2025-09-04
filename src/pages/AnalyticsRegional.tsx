import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ScatterChart, Scatter } from 'recharts'
import InfoTooltip from '../components/ui/InfoTooltip'
import Button from '../components/ui/Button'
import { aggregateByRegion, compareToBenchmark, type RegionalParams } from '../analytics/regional'
import { fetchRegionalMeasures } from '../analytics/adapters'

export default function AnalyticsRegional() {
  const [measures, setMeasures] = useState<any[]>([])
  useEffect(()=>{ fetchRegionalMeasures().then(setMeasures) }, [])

  const [halfLife, setHalfLife] = useState(180)
  const [minRecords, setMinRecords] = useState(6)
  const [minSources, setMinSources] = useState(3)
  const [query, setQuery] = useState('')
  const params: RegionalParams = { recencyHalfLifeDays: halfLife, minRecords, minSources }

  const agg = useMemo(()=> aggregateByRegion(measures, params), [measures, params])
  const [bench, setBench] = useState<'all'|'median'|'first'>('all')
  const benchmark = useMemo(()=> {
    if (!agg.length) return undefined
    if (bench==='all') {
      const fake = { regionId:'All', n_sources: agg.reduce((s,a)=>s+a.n_sources,0), m_records: agg.reduce((s,a)=>s+a.m_records,0), si_avg: avg(agg.map(a=>a.si_avg)), bv_avg: avg(agg.map(a=>a.bv_avg)), confidence: avg(agg.map(a=>a.confidence)), recency_days: avg(agg.map(a=>a.recency_days)) }
      return fake
    } else if (bench==='median') {
      const med = (arr:number[]) => arr.slice().sort((a,b)=>a-b)[Math.floor(arr.length/2)]
      const fake = { regionId:'Median', n_sources: 0, m_records:0, si_avg: med(agg.map(a=>a.si_avg)), bv_avg: med(agg.map(a=>a.bv_avg)), confidence: med(agg.map(a=>a.confidence)), recency_days: med(agg.map(a=>a.recency_days)) }
      return fake
    }
    return { ...agg[0], regionId: `Bench:${agg[0].regionId}` }
  }, [agg, bench])

  const rows = useMemo(()=> {
    const q = query.trim().toLowerCase()
    return agg.filter(a=> !q || a.regionId.toLowerCase().includes(q))
  }, [agg, query])

  function exportCSV() {
    const headers = ['regionId','si_avg','bv_avg','confidence','n_sources','m_records','recency_days']
    const lines = [headers.join(',')]
    for (const r of rows) lines.push([r.regionId, r.si_avg.toFixed(1), r.bv_avg.toFixed(2), r.confidence.toFixed(2), r.n_sources, r.m_records, Math.round(r.recency_days)].join(','))
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'regional-analytics.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <KPI label="Регіонів" value={rows.length} />
        <KPI label="Сер. score" value={rows.length? (rows.reduce((s,a)=> s + score(a),0)/rows.length).toFixed(1) : '0.0'} />
        <KPI label="Сер. SI" value={rows.length? (rows.reduce((s,a)=> s + a.si_avg,0)/rows.length).toFixed(1) : '0.0'} />
        <KPI label="Сер. BV" value={rows.length? (rows.reduce((s,a)=> s + a.bv_avg,0)/rows.length).toFixed(2) : '0.00'} />
        <KPI label="Сер. довіра" value={rows.length? (rows.reduce((s,a)=> s + a.confidence,0)/rows.length).toFixed(2) : '0.00'} />
      </div>

      <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <input className="rounded-md border px-2 py-1" placeholder="Пошук регіону" value={query} onChange={(e)=> setQuery(e.target.value)} />
          <label className="flex items-center gap-1"><span>Half-life</span><input type="number" className="w-20 rounded-md border px-2 py-1" value={halfLife} onChange={(e)=> setHalfLife(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1"><span>minRecords</span><input type="number" className="w-16 rounded-md border px-2 py-1" value={minRecords} onChange={(e)=> setMinRecords(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1"><span>minSources</span><input type="number" className="w-16 rounded-md border px-2 py-1" value={minSources} onChange={(e)=> setMinSources(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1">Бенчмарк
            <select className="rounded-md border px-2 py-1" value={bench} onChange={(e)=> setBench(e.target.value as any)}>
              <option value="all">Вся країна</option>
              <option value="median">Медіана</option>
              <option value="first">Перший регіон</option>
            </select>
          </label>
          <Button onClick={exportCSV}>Експорт CSV</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Регіон','Score','SI','BV','Δ vs Bench','Джерела','Записи','Давність','Довіра','Дії'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> {
              const delta = benchmark ? compareToBenchmark(r as any, benchmark as any) : { si_delta:0, bv_delta:0, score_delta:0 }
              return (
                <tr key={r.regionId} className="border-t">
                  <td className="px-3 py-2">{r.regionId}</td>
                  <td className="px-3 py-2">{score(r).toFixed(1)}</td>
                  <td className="px-3 py-2">{r.si_avg.toFixed(1)}</td>
                  <td className="px-3 py-2">{r.bv_avg.toFixed(2)}</td>
                  <td className="px-3 py-2">{delta.score_delta.toFixed(1)}</td>
                  <td className="px-3 py-2">{r.n_sources}</td>
                  <td className="px-3 py-2">{r.m_records}</td>
                  <td className="px-3 py-2">{Math.round(r.recency_days)}</td>
                  <td className="px-3 py-2">{r.confidence.toFixed(2)}</td>
                  <td className="px-3 py-2"><button className="rounded-md border px-2 py-1" onClick={()=> alert(`Region ${r.regionId}`)}>Деталі</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ChartCard title="Top-10 регіонів (score)">
          <BarChart data={rows.slice(0,10).map(r=> ({ name:r.regionId, score: Number(score(r).toFixed(1)) }))} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RTooltip />
            <Bar dataKey="score" fill="#0EA5E9" />
          </BarChart>
        </ChartCard>
        <ChartCard title="SI vs BV (size~conf)">
          <ScatterChart margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="SI" />
            <YAxis dataKey="y" name="BV" />
            <RTooltip />
            <Legend />
            <Scatter data={rows.map(r=> ({ x: r.si_avg, y: r.bv_avg, z: r.confidence, name: r.regionId }))} fill="#22C55E" />
          </ScatterChart>
        </ChartCard>
      </div>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="text-xs text-[var(--secondary)]">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="mb-2 text-sm font-medium flex items-center gap-1">{title} <InfoTooltip text="Демо-бенчмарки" /></div>
      <div className="h-60"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  )
}

function score(r: { si_avg: number; bv_avg: number }) {
  const si = Math.max(0, Math.min(1, r.si_avg/100))
  const bv = Math.max(0, Math.min(1, (r.bv_avg+3)/6))
  return 100*(0.6*si + 0.4*bv)
}

function avg(a: number[]) { return a.length? a.reduce((s,v)=>s+v,0)/a.length : 0 }

