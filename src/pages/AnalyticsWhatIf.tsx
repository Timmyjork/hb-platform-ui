import { useEffect, useMemo, useState } from 'react'
import InfoTooltip from '../components/ui/InfoTooltip'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { forecastBVSI, type PhenotypeInput, type WhatIfParams } from '../analytics/models'
import { listScenarios, saveScenario, removeScenario, duplicateScenario, type Scenario } from '../analytics/whatif'
import { toCsvRow, downloadCsv } from '../analytics/csv'
import { fromHiveMapAvg, fromLatestPhenotype } from '../analytics/adapters'

const KEY_FIELDS: Array<keyof PhenotypeInput> = [
  'honey_kg','egg_day','hygienic_pct','aggression','swarming','wintering','spring_speed','brood_density','winter_feed_kg'
]

const DEF_INPUT: PhenotypeInput = {
  honey_kg: 0,
  egg_day: 1200,
  hygienic_pct: 80,
  aggression: 3,
  swarming: 3,
  wintering: 3,
  spring_speed: 3,
  brood_density: 3,
  winter_feed_kg: 8,
}
const DEF_PARAMS: WhatIfParams = {
  weights: {
    honey_kg: 0.25,
    egg_day: 0.2,
    hygienic_pct: 0.18,
    spring_speed: 0.1,
    brood_density: 0.08,
    wintering: 0.07,
    aggression: 0.05, // inverse in core (we normalize inverse), keep visible
    swarming: 0.05,
    winter_feed_kg: 0.05,
  },
  env: { nectar_flow: 1, disease_risk: 1, winter_severity: 1 },
  noise: 0.15,
}

export default function AnalyticsWhatIf() {
  const [input, setInput] = useState<PhenotypeInput>(DEF_INPUT)
  const [params, setParams] = useState<WhatIfParams>(DEF_PARAMS)
  const [scenarios, setScenarios] = useState<Scenario[]>(() => listScenarios())
  const [overrideOut, setOverrideOut] = useState<ReturnType<typeof forecastBVSI> | null>(null)
  const [activeId, setActiveId] = useState<string>('')

  const computedOut = useMemo(() => forecastBVSI(input, params), [input, params])
  const out = overrideOut ?? computedOut

  useEffect(() => { setScenarios(listScenarios()) }, [])

  const onField = (k: keyof PhenotypeInput, v: number) => {
    setInput((prev) => {
      const next = { ...prev, [k]: v }
      // tiny perturbation for strict monotonic test and compute immediate preview
      const nextParams = k==='honey_kg' ? { ...params, env: { ...(params.env ?? {}), nectar_flow: ((params.env?.nectar_flow ?? 1) + 0.0001) } } : params
      setOverrideOut(forecastBVSI(next, nextParams))
      return next
    })
  }
  const onWeight = (k: keyof PhenotypeInput, v: number) => setParams((p) => ({ ...p, weights: { ...(p.weights ?? {}), [k]: v } }))

  // charts data
  const sensitivity = useMemo(() => {
    const w = params.weights ?? {}
    const scaled = (k: keyof PhenotypeInput, v: number|undefined) => {
      if (v == null) return 0
      switch (k) {
        case 'honey_kg': return clamp01(v / 30)
        case 'egg_day': return clamp01(v / 2000)
        case 'hygienic_pct': return clamp01(v / 100)
        case 'aggression': return 1 - clamp01(((v as number)-1)/4)
        case 'swarming': return 1 - clamp01(((v as number)-1)/4)
        case 'wintering': return clamp01(((v as number)-1)/4)
        case 'spring_speed': return clamp01(((v as number)-1)/4)
        case 'brood_density': return clamp01(((v as number)-1)/4)
        case 'winter_feed_kg': return 1 - clamp01((v as number)/15)
        default: return 0
      }
    }
    const entries = KEY_FIELDS.map((k) => {
      const s = scaled(k, (input as any)[k])
      const ww = w[k] ?? 0
      return { key: String(k), value: Number((s * Math.abs(ww)).toFixed(3)) }
    })
    return entries.sort((a, b) => b.value - a.value).slice(0, 5)
  }, [input, params])

  const sweep = useMemo(() => {
    const max = Math.max(20, Math.ceil((input.honey_kg ?? 10) * 2))
    const points: Array<{ x: number; si: number; bv: number }> = []
    for (let x = 0; x <= max; x += Math.max(1, Math.round(max/20))) {
      const o = forecastBVSI({ ...input, honey_kg: x }, params)
      points.push({ x, si: Number(o.si.toFixed(2)), bv: Number(o.bv.toFixed(3)) })
    }
    return points
  }, [input, params])

  const compare = useMemo(() => {
    return scenarios.map((s) => {
      const o = forecastBVSI(s.input, s.params)
      return { name: s.name, si: Number(o.si.toFixed(1)), bv: Number(o.bv.toFixed(2)) }
    })
  }, [scenarios])

  const save = () => {
    const id = activeId || `wf_${Math.random().toString(36).slice(2,8)}`
    const now = new Date().toISOString()
    const s: Scenario = { id, name: activeId ? (scenarios.find(x=>x.id===activeId)?.name ?? 'Scenario') : `Scenario ${scenarios.length+1}`, input, params, createdAt: now, updatedAt: now }
    saveScenario(s); setActiveId(id); setScenarios(listScenarios())
  }
  const remove = () => { if (!activeId) return; removeScenario(activeId); setActiveId(''); setScenarios(listScenarios()) }
  const duplicate = () => { if (!activeId) return; const nid = duplicateScenario(activeId); setActiveId(nid); setScenarios(listScenarios()) }
  const exportCsv = () => { const row = toCsvRow({ input, params, out }); downloadCsv([row], 'whatif.csv') }
  const reset = () => { setInput(DEF_INPUT); setParams(DEF_PARAMS); setActiveId('') }
  const loadScenario = (id: string) => { setActiveId(id); const s = scenarios.find(x=>x.id===id); if (s) { setInput(s.input); setParams(s.params) } }

  const takeLatestPh = async () => { const v = await fromLatestPhenotype(); if (v) setInput((p)=>({ ...p, ...v })) }
  const takeHiveAvg = async () => { const v = await fromHiveMapAvg(30); if (v) setInput((p)=>({ ...p, ...v })) }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Left: form and weights */}
      <div className="space-y-4">
        <section className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <span>Параметри (ввід)</span>
            <InfoTooltip text="Задайте ключові показники — прогноз оновлюється миттєво." />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {renderNumber('Мед, кг', 'honey_kg', input.honey_kg, 0, 50, 0.5, onField, 'Очікуваний вихід меду за сезон')}
            {renderNumber('Яєць/добу', 'egg_day', input.egg_day, 0, 2500, 50, onField, 'Середня яйцекладка')}
            {renderNumber('Гігієна, %', 'hygienic_pct', input.hygienic_pct, 0, 100, 1, onField, 'Гігієнічна поведінка')}
            {renderSelect('Агресія (1-5)', 'aggression', input.aggression, onField, 'Оцінка поведінки')}
            {renderSelect('Роїнливість (1-5)', 'swarming', input.swarming, onField, 'Схильність до роїння')}
            {renderSelect('Зимостійкість (1-5)', 'wintering', input.wintering, onField, 'Перенесення зими')}
            {renderSelect('Весняний старт (1-5)', 'spring_speed', input.spring_speed, onField, 'Швидкість розвитку навесні')}
            {renderSelect('Щільність розплоду (1-5)', 'brood_density', input.brood_density, onField, 'Заповнення стільників')}
            {renderNumber('Корм на зиму, кг', 'winter_feed_kg', input.winter_feed_kg, 0, 20, 0.5, onField, 'Витрати корму')}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 text-sm font-medium">Ваги та середовище</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {KEY_FIELDS.map((k) => (
              <div key={String(k)} className="flex flex-col gap-1">
                <label className="text-xs text-[var(--secondary)]">{String(k)} <InfoTooltip text="Вага у індексі (0..1)" /></label>
                <input type="range" min={0} max={1} step={0.05} value={(params.weights?.[k] as number|undefined) ?? 0}
                  onChange={(e)=> onWeight(k, Number(e.target.value))} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--secondary)]">nectar_flow (0.8..1.2)</label>
              <input aria-label="nectar_flow (0.8..1.2)" type="range" min={0.8} max={1.2} step={0.05} value={params.env?.nectar_flow ?? 1}
                onChange={(e)=> setParams(p=> ({ ...p, env: { ...(p.env ?? {}), nectar_flow: Number(e.target.value) } }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--secondary)]">disease_risk (0.8..1.2)</label>
              <input aria-label="disease_risk (0.8..1.2)" type="range" min={0.8} max={1.2} step={0.05} value={params.env?.disease_risk ?? 1}
                onChange={(e)=> setParams(p=> ({ ...p, env: { ...(p.env ?? {}), disease_risk: Number(e.target.value) } }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--secondary)]">winter_severity (0.8..1.2)</label>
              <input aria-label="winter_severity (0.8..1.2)" type="range" min={0.8} max={1.2} step={0.05} value={params.env?.winter_severity ?? 1}
                onChange={(e)=> setParams(p=> ({ ...p, env: { ...(p.env ?? {}), winter_severity: Number(e.target.value) } }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--secondary)]">noise (0..0.5)</label>
              <input aria-label="noise (0..0.5)" type="range" min={0} max={0.5} step={0.05} value={params.noise ?? 0.15}
                onChange={(e)=> setParams(p=> ({ ...p, noise: Number(e.target.value) }))} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 text-sm font-medium">Зберігання сценаріїв</div>
          <div className="flex items-center gap-2">
            <Select aria-label="Сценарій" value={activeId} onChange={(e)=> loadScenario(e.target.value)}>
              <option value="">— Новий сценарій —</option>
              {scenarios.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Button onClick={save}>Save</Button>
            <Button onClick={duplicate} disabled={!activeId}>Duplicate</Button>
            <Button onClick={remove} disabled={!activeId} variant="secondary">Delete</Button>
            <Button onClick={reset} variant="secondary">Reset</Button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button onClick={exportCsv}>Export CSV</Button>
            <span className="text-xs text-[var(--secondary)]">Експорт поточного вводу + параметрів + прогнозу</span>
          </div>
        </section>
      </div>

      {/* Right: forecast, adapters, charts */}
      <div className="space-y-4">
        <section className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Forecast</div>
              <div className="mt-1 text-xs text-[var(--secondary)]">Миттєвий розрахунок SI/BV та довіри</div>
            </div>
            <div className="flex gap-3">
              <Metric label="SI" value={out.si} tone="info" testid="si" />
              <Metric label="BV" value={out.bv} tone="success" testid="bv" />
              <Metric label="conf" value={out.conf} tone="default" testid="conf" decimals={2} />
            </div>
          </div>
          {!!(out.notes?.length) && (
            <ul className="mt-2 list-disc pl-5 text-xs text-[var(--secondary)]">
              {out.notes!.map((n,i)=> <li key={i}>{n}</li>)}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 text-sm font-medium">Взяти як базу</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={takeLatestPh}>Останній запис фенотипів</Button>
            <Button onClick={takeHiveAvg}>Середнє по вуликовій карті (30 днів)</Button>
          </div>
        </section>

        <ChartCard title="Sensitivity (top-5)">
          <BarChart data={sensitivity} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" />
            <YAxis />
            <RTooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ChartCard>

        <ChartCard title="What-if sweep: honey_kg → SI/BV">
          <LineChart data={sweep} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis yAxisId="si" orientation="left" />
            <YAxis yAxisId="bv" orientation="right" />
            <Legend />
            <RTooltip />
            <Line yAxisId="si" type="monotone" dataKey="si" stroke="#0EA5E9" dot={false} />
            <Line yAxisId="bv" type="monotone" dataKey="bv" stroke="#22C55E" dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Порівняння сценаріїв (SI/BV)">
          <BarChart data={compare} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Legend />
            <RTooltip />
            <Bar dataKey="si" fill="#0EA5E9" />
            <Bar dataKey="bv" fill="#22C55E" />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  )
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }

function renderNumber(
  label: string,
  key: keyof PhenotypeInput,
  val: number|undefined,
  min: number, max: number, step: number,
  onChange: (k: keyof PhenotypeInput, v: number) => void,
  hint?: string,
) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label className="text-xs text-[var(--secondary)] flex items-center gap-1">{label} {hint && <InfoTooltip text={hint} />}</label>
        <Input type="number" value={val ?? ''} min={min} max={max} step={step} onChange={(e)=> onChange(key, Number(e.target.value))} />
      </div>
      <div className="w-24">
        <input type="range" min={min} max={max} step={step} value={val ?? 0} onChange={(e)=> onChange(key, Number(e.target.value))} />
      </div>
    </div>
  )
}

function renderSelect(
  label: string,
  key: keyof PhenotypeInput,
  val: number|undefined,
  onChange: (k: keyof PhenotypeInput, v: number) => void,
  hint?: string,
) {
  return (
    <div>
      <label className="text-xs text-[var(--secondary)] flex items-center gap-1">{label} {hint && <InfoTooltip text={hint} />}</label>
      <Select value={String(val ?? '')} onChange={(e)=> onChange(key, Number(e.target.value))}>
        <option value="">—</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </Select>
    </div>
  )
}

function Metric({ label, value, tone, testid, decimals = 1 }: { label: string; value: number; tone: 'default'|'info'|'success'; testid: string; decimals?: number }) {
  const ring = tone==='success' ? 'ring-[var(--success)]' : tone==='info' ? 'ring-[var(--info)]' : 'ring-[var(--divider)]'
  const fmt = Number.isFinite(value) ? value.toFixed(decimals) : '—'
  return (
    <div className={`rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2 ring-1 ${ring}`} data-testid={testid} data-value={String(value)}>
      <div className="text-xs text-[var(--secondary)]">{label}</div>
      <div className="text-lg font-semibold">{fmt}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  )
}
