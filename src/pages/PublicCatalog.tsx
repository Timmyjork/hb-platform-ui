import { useEffect, useState } from 'react'
import { buildIndex, queryIndex } from '../search/index'
import { add as cartAdd } from '../shop/cart.store'
import BREEDS from '../constants/breeds'
import UA_REGIONS from '../constants/regions.ua'
import { cached } from '../utils/cache'

export default function PublicCatalog() {
  const [filters, setFilters] = useState<{ breedCode?: string; regionCode?: string; year?: number; minPrice?: number; maxPrice?: number; minRating?: number; hasQA?: boolean; sort?: 'price'|'rating'|'newest' }>({ sort: 'newest' })
  const [results, setResults] = useState(() => buildIndex())
  useEffect(() => { cached('catalog_index', 2000, async () => buildIndex()).then(()=> setResults(queryIndex(filters, filters.sort))) }, [JSON.stringify(filters)])

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Каталог</h1>
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <label className="text-sm">Порода
          <select aria-label="breed" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, breedCode: e.target.value || undefined }))}>
            <option value="">Усі</option>
            {BREEDS.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
          </select>
        </label>
        <label className="text-sm">Регіон
          <select aria-label="region" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, regionCode: e.target.value || undefined }))}>
            <option value="">Усі</option>
            {UA_REGIONS.map(r => <option key={r.code} value={r.code}>{r.short}</option>)}
          </select>
        </label>
        <label className="text-sm">Рік
          <input aria-label="year" type="number" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, year: e.target.value? Number(e.target.value): undefined }))} />
        </label>
        <label className="text-sm">Ціна від
          <input aria-label="minPrice" type="number" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, minPrice: e.target.value? Number(e.target.value): undefined }))} />
        </label>
        <label className="text-sm">до
          <input aria-label="maxPrice" type="number" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, maxPrice: e.target.value? Number(e.target.value): undefined }))} />
        </label>
        <label className="text-sm">Рейтинг ≥
          <input aria-label="minRating" type="number" min={0} max={5} className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, minRating: e.target.value? Number(e.target.value): undefined }))} />
        </label>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" onChange={(e)=> setFilters(f=> ({ ...f, hasQA: e.target.checked }))} /> Є відповіді в Q&A</label>
        <label className="text-sm">Сортування
          <select aria-label="sort" className="mt-1 w-full rounded border px-2 py-1" onChange={(e)=> setFilters(f=> ({ ...f, sort: e.target.value as any }))}>
            <option value="newest">Новизна</option>
            <option value="price">Ціна</option>
            <option value="rating">Рейтинг</option>
          </select>
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--divider)]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Порода</th><th className="px-3 py-2">Регіон</th><th className="px-3 py-2">Рік</th><th className="px-3 py-2">Ціна</th><th className="px-3 py-2">Рейтинг</th><th className="px-3 py-2 text-right">Дія</th></tr></thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.breedCode}</td>
                <td className="px-3 py-2">{r.regionCode}</td>
                <td className="px-3 py-2">{r.year}</td>
                <td className="px-3 py-2">{r.price}</td>
                <td className="px-3 py-2">{r.ratingAvg.toFixed(1)} ({r.ratingCount})</td>
                <td className="px-3 py-2 text-right"><button className="rounded-md border px-3 py-1.5" onClick={()=>{ cartAdd('Buyer-1', r.id, 1); alert('Додано в кошик') }}>У кошик</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
