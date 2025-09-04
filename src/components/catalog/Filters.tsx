import { useEffect, useMemo, useState } from 'react'
import BREEDS from '../../constants/breeds'
import UA_REGIONS from '../../constants/regions.ua'

export default function CatalogFilters() {
  const breeds = useMemo(()=> BREEDS, [])
  const regions = useMemo(()=> UA_REGIONS, [])
  const sp = useMemo(()=> new URLSearchParams(window.location.search), [])
  const [breed, setBreed] = useState<string>(sp.get('breed') || '')
  const [region, setRegion] = useState<string>(sp.get('region') || '')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (breed) params.set('breed', breed); else params.delete('breed')
    if (region) params.set('region', region); else params.delete('region')
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? '?' + qs : ''}`
    window.history.replaceState({}, '', url)
  }, [breed, region])

  return (
    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
      <label className="text-sm">Порода
        <select aria-label="filter-breed" className="mt-1 w-full rounded-md border px-2 py-1" value={breed} onChange={e=> setBreed(e.target.value)}>
          <option value="">Усі</option>
          {breeds.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
        </select>
      </label>
      <label className="text-sm">Регіон
        <select aria-label="filter-region" className="mt-1 w-full rounded-md border px-2 py-1" value={region} onChange={e=> setRegion(e.target.value)}>
          <option value="">Усі</option>
          {regions.map(r => <option key={r.code} value={r.code}>{r.short}</option>)}
        </select>
      </label>
      <label className="text-sm">Рік
        <input aria-label="filter-year" className="mt-1 w-full rounded-md border px-2 py-1" type="number" />
      </label>
    </div>
  )
}

