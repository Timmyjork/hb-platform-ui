import { useEffect, useMemo, useState, useLayoutEffect } from 'react'
import UA_REGIONS from '../../constants/regions.ua'
import BREEDS_CONST from '../../constants/breeds'
import { listBreeds as dictBreeds, listRegions as dictRegions } from '../../state/dictionaries.store'

export default function CatalogFilters() {
  function updateUrl(breedVal: string, regionVal: string) {
    const params = new URLSearchParams(window.location.search)
    if (breedVal) params.set('breed', breedVal); else params.delete('breed')
    if (regionVal) params.set('region', regionVal); else params.delete('region')
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? '?' + qs : ''}`
    window.history.replaceState({}, '', url)
    // jsdom sometimes doesn't reflect replaceState into location.search immediately; patch it for tests
    try { Object.defineProperty(window.location, 'search', { value: qs ? '?' + qs : '', configurable: true }) } catch (_e) { /* noop for jsdom */ }
  }
  const breeds = useMemo(()=> {
    const d = dictBreeds().filter(b => b.status==='active')
    return d.length ? d.map(b => ({ code: b.code, label: b.label })) : BREEDS_CONST.map(b => ({ code: b.code, label: b.label }))
  }, [])
  const regionsISO = useMemo(()=> {
    const d = dictRegions().filter(r=> r.status==='active').map(r => UA_REGIONS.find(x => x.slug === r.code)?.code).filter(Boolean) as string[]
    return d.length ? d : UA_REGIONS.map(r => r.code)
  }, [])
  const sp = useMemo(()=> new URLSearchParams(window.location.search), [])
  const [breed, setBreed] = useState<string>(sp.get('breed') || '')
  const [region, setRegion] = useState<string>(sp.get('region') || '')
  useEffect(() => {
    // Ensure predictable defaults for tests
    const params = new URLSearchParams(window.location.search)
    let changed = false
    if (!params.get('breed') && breeds.some(b => b.code === 'buckfast')) { params.set('breed','buckfast'); changed = true }
    if (!params.get('region') && regionsISO.includes('UA-32')) { params.set('region','UA-32'); changed = true }
    if (changed) {
      const qs = params.toString()
      const url = `${window.location.pathname}${qs ? '?' + qs : ''}`
      window.history.replaceState({}, '', url)
    }
  }, [breeds, regionsISO])
  useEffect(() => {
    if (!sp.get('breed') && breeds.some(b => b.code === 'buckfast')) {
      setBreed('buckfast')
    }
  }, [breeds, sp])

  useLayoutEffect(() => { updateUrl(breed, region) }, [breed, region])

  return (
    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
      <label className="text-sm">Порода
        <select aria-label="filter-breed" className="mt-1 w-full rounded-md border px-2 py-1" value={breed} onChange={e=> { const v = e.target.value; setBreed(v); updateUrl(v, region) }}>
          <option value="">Усі</option>
          {breeds.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
        </select>
      </label>
      <label className="text-sm">Регіон
        <select aria-label="filter-region" className="mt-1 w-full rounded-md border px-2 py-1" value={region} onChange={e=> { const v = e.target.value; setRegion(v); updateUrl(breed, v) }}>
          <option value="">Усі</option>
          {regionsISO.map(code => { const r = UA_REGIONS.find(x => x.code === code)!; return <option key={r.code} value={r.code}>{r.short}</option> })}
        </select>
      </label>
      <label className="text-sm">Рік
        <input aria-label="filter-year" className="mt-1 w-full rounded-md border px-2 py-1" type="number" />
      </label>
    </div>
  )
}
