import { useMemo, useState } from 'react'
import { listBreedersPublic } from '../state/breeders.public.store'
import UA_REGIONS from '../constants/regions.ua'
import BREEDS from '../constants/breeds'

export default function BreedersCatalog() {
  const all = useMemo(()=> listBreedersPublic(), [])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('')
  const [breed, setBreed] = useState('')
  const [sort, setSort] = useState<'rating'|'sales'|'new'>('rating')
  const rows = useMemo(() => {
    let r = all
    const s = q.trim().toLowerCase()
    if (s) r = r.filter(b => b.displayName.toLowerCase().includes(s) || (b.bio||'').toLowerCase().includes(s))
    if (region) r = r.filter(b => b.regionCode === region)
    if (breed) r = r.filter(b => b.breedCodes.includes(breed))
    if (sort === 'rating') r = [...r].sort((a,b)=> (b.stats?.rating||0) - (a.stats?.rating||0))
    if (sort === 'sales') r = [...r].sort((a,b)=> (b.stats?.sales||0) - (a.stats?.sales||0))
    if (sort === 'new') r = [...r].sort((a,b)=> (b.createdAt.localeCompare(a.createdAt)))
    return r
  }, [all, q, region, breed, sort])
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Каталог маткарів</h1>
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input aria-label="search" className="rounded border px-2 py-1" placeholder="Пошук" value={q} onChange={e=> setQ(e.target.value)} />
        <select aria-label="region" className="rounded border px-2 py-1" value={region} onChange={e=> setRegion(e.target.value)}>
          <option value="">Усі регіони</option>
          {UA_REGIONS.map(r => <option key={r.code} value={r.code}>{r.short}</option>)}
        </select>
        <select aria-label="breed" className="rounded border px-2 py-1" value={breed} onChange={e=> setBreed(e.target.value)}>
          <option value="">Усі породи</option>
          {BREEDS.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
        </select>
        <select aria-label="sort" className="rounded border px-2 py-1" value={sort} onChange={e=> setSort(e.target.value as any)}>
          <option value="rating">Рейтинг</option>
          <option value="sales">Продажі</option>
          <option value="new">Нові</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {rows.map(b => (
          <a key={b.slug} className="rounded border p-3 hover:bg-gray-50" href={`/breeder/${b.slug}`}>
            <div className="text-sm font-semibold">{b.displayName}</div>
            <div className="text-xs text-[var(--secondary)]">{UA_REGIONS.find(r=> r.code===b.regionCode)?.short} • {b.breedCodes.join(', ')}</div>
            <div className="mt-1 text-xs">Рейтинг: {(b.stats?.rating||0).toFixed(1)} • Продажі: {b.stats?.sales||0}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

