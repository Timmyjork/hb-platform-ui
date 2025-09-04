import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ScatterChart, Scatter } from 'recharts'
import Button from '../components/ui/Button'
import InfoTooltip from '../components/ui/InfoTooltip'
import { aggregateBreeders, type RatingParams, type SourceMeasure } from '../analytics/ratings'
import { fetchBreederMeasures } from '../analytics/adapters'

export default function AnalyticsRatings() {
  // removed unused breed/year filters for now
  const [halfLife, setHalfLife] = useState(180)
  const [minRecords, setMinRecords] = useState(8)
  const [minSources, setMinSources] = useState(3)
  const [penaltyOutliers, setPenaltyOutliers] = useState(true)
  const [bvWeight, setBvWeight] = useState(0.4)
  const [siWeight, setSiWeight] = useState(0.6)
  const [openMethod, setOpenMethod] = useState(false)

  const [measures, setMeasures] = useState<SourceMeasure[]>([])
  useEffect(() => { fetchBreederMeasures().then(setMeasures) }, [])

  const filtered = useMemo(() => {
    // simple demo filters; breed/year are placeholders (we use breederId as proxy for breed)
    return measures
  }, [measures])
  const agg = useMemo(() => {
    const params: RatingParams = { recencyHalfLifeDays: halfLife, minRecords, minSources, penaltyOutliers, bvWeight, siWeight };
    return aggregateBreeders(filtered, params)
  }, [filtered, halfLife, minRecords, minSources, penaltyOutliers, bvWeight, siWeight])

  const kpi = useMemo(() => {
    const nBreeders = agg.length
    const avgScore = nBreeders ? agg.reduce((s, a) => s + a.score, 0) / nBreeders : 0
    const avgConf = nBreeders ? agg.reduce((s, a) => s + a.confidence, 0) / nBreeders : 0
    const totalSources = agg.reduce((s, a) => s + a.n, 0)
    return { nBreeders, avgScore, avgConf, totalSources }
  }, [agg])

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'score'|'si'|'bv'|'conf'>('score')
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let arr = agg.filter(a => !q || a.breederId.toLowerCase().includes(q))
    arr = arr.slice().sort((a,b)=> sortKey==='score'? (b.score-a.score) : sortKey==='si'? (b.si_avg-a.si_avg) : sortKey==='bv'? (b.bv_avg-a.bv_avg) : (b.confidence-a.confidence))
    return arr
  }, [agg, query, sortKey])

  const top10 = rows.slice(0, 10).map(r => ({ name: r.breederId, score: Number(r.score.toFixed(1)) }))
  const scatter = rows.map(r => ({ x: Number(r.si_avg.toFixed(1)), y: Number(r.bv_avg.toFixed(2)), z: r.confidence, name: r.breederId }))

  function exportCSV() {
    const headers = ['breederId','score','si_avg','bv_avg','confidence','n','m','recency_days','consistency']
    const lines = [headers.join(',')]
    for (const a of rows) lines.push([a.breederId, a.score.toFixed(1), a.si_avg.toFixed(1), a.bv_avg.toFixed(2), a.confidence.toFixed(2), a.n, a.m, a.recency_days.toFixed(0), a.consistency.toFixed(2)].join(','))
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'breeder-ratings.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KPI label="# Маткарів" value={kpi.nBreeders} />
        <KPI label="Сер. score" value={kpi.avgScore.toFixed(1)} />
        <KPI label="Сер. довіра" value={kpi.avgConf.toFixed(2)} />
        <KPI label="Незалежні джерела" value={kpi.totalSources} />
      </div>

      <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <input className="rounded-md border px-2 py-1" placeholder="Пошук маткаря" value={query} onChange={(e)=> setQuery(e.target.value)} />
          <label className="flex items-center gap-1"><span>Half-life</span><input type="number" className="w-20 rounded-md border px-2 py-1" value={halfLife} onChange={(e)=> setHalfLife(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1"><span>minRecords</span><input type="number" className="w-16 rounded-md border px-2 py-1" value={minRecords} onChange={(e)=> setMinRecords(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1"><span>minSources</span><input type="number" className="w-16 rounded-md border px-2 py-1" value={minSources} onChange={(e)=> setMinSources(Number(e.target.value)||0)} /></label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={penaltyOutliers} onChange={(e)=> setPenaltyOutliers(e.target.checked)} /> penaltyOutliers</label>
          <label className="flex items-center gap-1"><span>bvWeight</span><input type="range" min={0} max={1} step={0.05} value={bvWeight} onChange={(e)=> setBvWeight(Number(e.target.value))} /></label>
          <label className="flex items-center gap-1"><span>siWeight</span><input type="range" min={0} max={1} step={0.05} value={siWeight} onChange={(e)=> setSiWeight(Number(e.target.value))} /></label>
          <Button onClick={exportCSV}>Експорт CSV</Button>
          <Button variant="secondary" onClick={()=> setOpenMethod(v=>!v)}>Пояснення методики</Button>
        </div>
        {openMethod && (
          <div className="text-xs text-[var(--secondary)]">
            Рейтинг враховує експоненційний спад давності (half-life), незалежність джерел, кліп аутлайєрів (опція), узгодженість (інверсія дисперсії) та обсяг даних. Score = комбінація SI/BV за вагами + бонус за довіру.
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Маткар','Score','SI avg','BV avg','Довіра','Джерела','Записи','Давність (дні)','Узгодженість','Дії'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.breederId} className="border-t">
                <td className="px-3 py-2">{r.breederId}</td>
                <td className="px-3 py-2"><button className="underline" onClick={()=> setSortKey('score')}>{r.score.toFixed(1)}</button></td>
                <td className="px-3 py-2"><button className="underline" onClick={()=> setSortKey('si')}>{r.si_avg.toFixed(1)}</button></td>
                <td className="px-3 py-2"><button className="underline" onClick={()=> setSortKey('bv')}>{r.bv_avg.toFixed(2)}</button></td>
                <td className="px-3 py-2"><button className="underline" onClick={()=> setSortKey('conf')}>{r.confidence.toFixed(2)}</button></td>
                <td className="px-3 py-2">{r.n}</td>
                <td className="px-3 py-2">{r.m}</td>
                <td className="px-3 py-2">{Math.round(r.recency_days)}</td>
                <td className="px-3 py-2">{r.consistency.toFixed(2)}</td>
                <td className="px-3 py-2"><button className="rounded-md border px-2 py-1" onClick={()=> alert(`Details for ${r.breederId}`)}>Деталі</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ChartCard title="Top-10 за score">
          <BarChart data={top10} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RTooltip />
            <Bar dataKey="score" fill="#0EA5E9" />
          </BarChart>
        </ChartCard>
        <ChartCard title="SI vs BV (size ~ conf)">
          <ScatterChart margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="SI" />
            <YAxis dataKey="y" name="BV" />
            <RTooltip />
            <Legend />
            <Scatter data={scatter} fill="#22C55E" />
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
      <div className="mb-2 text-sm font-medium flex items-center gap-1">{title} <InfoTooltip text="Демо-візуалізація рейтингу" /></div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  )
}
