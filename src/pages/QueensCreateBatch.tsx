import { useEffect, useMemo, useState } from 'react'
import type { TenTraits } from '../types/queen'
import { addQueensBatch } from '../state/queens.store'
import { getBreederDefaults } from '../state/profile.store'
import { breedSlugToLineageCode } from '../constants/breeds'
import UA_REGIONS, { findRegion } from '../constants/regions.ua'
import { listBreeds as dictBreeds, listRegions as dictRegions } from '../state/dictionaries.store'
import { QueenBatchSchema, validateBusinessRules } from '../validation/queen.batch'
import { useToast } from '../components/ui/Toast'

export default function QueensCreateBatch() {
  const { push } = useToast()
  const defaults = getBreederDefaults('currentUser')
  const [breedSlug, setBreedSlug] = useState<string>(defaults.defaultBreedCode)
  const [regionCode, setRegionCode] = useState<string>(defaults.regionCode)
  const [breederNo, setBreederNo] = useState(String(defaults.breederNo))
  const [country] = useState<'UA'>('UA')
  const [startQueenNo, setStartQueenNo] = useState(2)
  const [year, setYear] = useState(new Date().getFullYear())
  const [count, setCount] = useState(10)
  const [status, setStatus] = useState<'draft'|'listed'>('listed')
  const [breederId, setBreederId] = useState('Breeder-1')
  const [isMother, setIsMother] = useState(false)
  const [motherId, setMotherId] = useState('')

  useEffect(() => {
    if (isMother) {
      setStartQueenNo(1)
      setCount(1)
    } else {
      setStartQueenNo(2)
    }
  }, [isMother])
  const [traits, setTraits] = useState<TenTraits>({
    honey: 60,
    winter: 60,
    temperament: 60,
    calmOnFrames: 60,
    swarming: 60,
    hygienic: 60,
    varroaResist: 60,
    springBuildUp: 60,
    colonyStrength: 60,
    broodFrames: 50,
  })

  const breedsActive = useMemo(() => dictBreeds().filter(b => b.status === 'active'), [])
  const regionsActiveISO = useMemo(() => {
    const active = dictRegions().filter(r => r.status === 'active')
    return active.map(r => UA_REGIONS.find(x => x.slug === r.code)?.code).filter(Boolean) as string[]
  }, [])

  const preview = useMemo(() => {
    const ids: string[] = []
    for (let i=0;i<Math.min(3, Math.max(0, count)); i++) {
      const lineage = breedSlugToLineageCode(breedSlug)
      const regionNum = (findRegion(regionCode)?.code.match(/(\d{2})$/)?.[1]) || '32'
      ids.push(`${country}.${lineage}.${Number(regionNum)}.${breederNo}.${startQueenNo + i}.${year}`)
    }
    return ids
  }, [breedSlug, regionCode, breederNo, startQueenNo, year, count, country])

  function onCreate() {
    try {
      const payload = QueenBatchSchema.parse({
        country,
        lineageCode: Number(breedSlugToLineageCode(breedSlug)),
        unionCode: Number((findRegion(regionCode)?.code.match(/(\d{2})$/)?.[1]) || '32'),
        breederNo: Number(breederNo),
        year: Number(year),
        startQueenNo: Number(startQueenNo),
        count: Number(count),
        motherId: motherId || undefined,
        isMother,
        baseTraits: traits,
        status,
      })
      validateBusinessRules(payload)
      if (isMother) {
        const created = addQueensBatch({
          count: 1,
          startQueenNo: 1,
          country,
          breedCode: String(payload.lineageCode),
          unionCode: String(payload.unionCode),
          breederNo: String(payload.breederNo),
          year: payload.year,
          baseTraits: traits,
          breederId,
          status,
        })
        push({ title: `Створено маму: ${created[0]?.id}` })
        setMotherId(created[0]?.id || '')
      } else {
        const created = addQueensBatch({
          count: payload.count,
          startQueenNo: payload.startQueenNo,
          country,
          breedCode: String(payload.lineageCode),
          unionCode: String(payload.unionCode),
          breederNo: String(payload.breederNo),
          year: payload.year,
          baseTraits: traits,
          breederId,
          status,
          motherId: motherId || undefined,
        })
        push({ title: `Створено ${created.length} маток`, tone: 'success' })
      }
    } catch (e: any) {
      const msg = e?.message || String(e)
      push({ title: msg.includes('E_RULE_YEAR') ? 'Партія для продажу має поточний рік' : msg, tone: 'danger' })
    }
  }

  const fields: Array<{ key: keyof TenTraits; label: string; hint: string }> = [
    { key: 'honey', label: 'Медопродуктивність', hint: '0..100' },
    { key: 'winter', label: 'Зимостійкість', hint: '0..100' },
    { key: 'temperament', label: 'Чемність', hint: '0..100' },
    { key: 'calmOnFrames', label: 'Спокій на рамках', hint: '0..100' },
    { key: 'swarming', label: 'Рійливість (вище=менш рійлива)', hint: '0..100' },
    { key: 'hygienic', label: 'Гігієнічність', hint: '0..100' },
    { key: 'varroaResist', label: 'Варроарезистентність', hint: '0..100' },
    { key: 'springBuildUp', label: 'Весняний розвиток', hint: '0..100' },
    { key: 'colonyStrength', label: 'Сила колонії', hint: '0..100' },
    { key: 'broodFrames', label: 'Рамки з розплодом (0..12 → 0..100)', hint: '0..100' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Створити маток (пакетно)</h1>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">Країна
          <input aria-label="country" className="mt-1 w-full rounded-md border px-2 py-1" value={country} disabled />
        </label>
        {/* expose unionCode for tests */}
        <label className="text-sm hidden">UnionCode
          <input aria-label="unionCode" className="mt-1 w-full rounded-md border px-2 py-1" value={(findRegion(regionCode)?.code.match(/(\d{2})$/)?.[1]) || '32'} readOnly />
        </label>
        <label className="text-sm">Порода
          <select aria-label="breed" className="mt-1 w-full rounded-md border px-2 py-1" value={breedSlug} onChange={e=> setBreedSlug(e.target.value)}>
            {breedsActive.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
          </select>
        </label>
        <label className="text-sm">Регіон (спілка)
          <select aria-label="region" className="mt-1 w-full rounded-md border px-2 py-1" value={regionCode} onChange={e=> setRegionCode(e.target.value)}>
            {regionsActiveISO.map(code => {
              const r = UA_REGIONS.find(x => x.code === code)!; return <option key={r.code} value={r.code}>{r.short}</option>
            })}
          </select>
        </label>
        <label className="text-sm">№ маткаря (breederNo)
          <input aria-label="breederNo" className="mt-1 w-full rounded-md border px-2 py-1" value={breederNo} onChange={e=> setBreederNo(e.target.value)} />
        </label>
        <label className="text-sm">Початковий № (startQueenNo)
          <input aria-label="startQueenNo" type="number" className="mt-1 w-full rounded-md border px-2 py-1" value={startQueenNo} onChange={e=> setStartQueenNo(Number(e.target.value)||0)} disabled={isMother} />
        </label>
        <label className="text-sm">Рік
          <input aria-label="year" type="number" className="mt-1 w-full rounded-md border px-2 py-1" value={year} onChange={e=> setYear(Number(e.target.value)||0)} />
        </label>
        <label className="text-sm">Кількість
          <input aria-label="count" type="number" className="mt-1 w-full rounded-md border px-2 py-1" value={count} onChange={e=> setCount(Number(e.target.value)||0)} disabled={isMother} />
        </label>
        <label className="text-sm">Статус
          <select aria-label="status" className="mt-1 w-full rounded-md border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}>
            <option value="listed">listed</option>
            <option value="draft">draft</option>
          </select>
        </label>
        <label className="text-sm">Breeder Id
          <input aria-label="breederId" className="mt-1 w-full rounded-md border px-2 py-1" value={breederId} onChange={e=> setBreederId(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input aria-label="isMother" type="checkbox" checked={isMother} onChange={e=> setIsMother(e.target.checked)} /> Це мама (№1)
        </label>
        <label className="text-sm">Mother ID (опц.)
          <input aria-label="motherId" className="mt-1 w-full rounded-md border px-2 py-1" value={motherId} onChange={e=> setMotherId(e.target.value)} disabled={isMother} />
        </label>
      </div>

      <div className="rounded-md border p-3">
        <div className="mb-2 text-sm font-medium">Базові фенотипи (0..100)</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fields.map(f => (
            <label key={f.key} className="text-sm">
              <span>{f.label}</span>
              <input aria-label={f.key} type="number" min={0} max={100} className="mt-1 w-full rounded-md border px-2 py-1" value={traits[f.key]} onChange={e=> setTraits({ ...traits, [f.key]: Math.max(0, Math.min(100, Number(e.target.value)||0)) })} />
              <div className="text-xs text-[var(--secondary)]">{f.hint}</div>
            </label>
          ))}
        </div>
      </div>

      <div className="text-sm">Попередній перегляд ID: {preview.join(', ')}</div>
      <button className="rounded-md border px-3 py-1.5" onClick={onCreate}>Створити {count} маток</button>
    </div>
  )
}
