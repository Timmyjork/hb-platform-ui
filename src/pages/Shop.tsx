import { useMemo, useState } from 'react'
import { listListings } from '../state/shop.store'
import CatalogFilters from '../components/catalog/Filters'
import { addToCart } from '../state/cart.store'

export default function Shop() {
  const [seed] = useState(0)
  const listings = useMemo(()=> listListings().filter(l=> l.active), [seed])
  const add = (id: string, price: number) => { addToCart({ listingId: id, qty: 1, price }); alert('Додано в кошик') }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Магазин</h1>
      <CatalogFilters />
      <div className="overflow-hidden rounded-xl border border-[var(--divider)]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Лістинг</th>
              <th className="px-3 py-2">Порода</th>
              <th className="px-3 py-2">Регіон</th>
              <th className="px-3 py-2">Рік</th>
              <th className="px-3 py-2">Ціна</th>
              <th className="px-3 py-2">Запас</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.listingId} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{l.listingId}</td>
                <td className="px-3 py-2">{l.breedCode}</td>
                <td className="px-3 py-2">{l.regionCode}</td>
                <td className="px-3 py-2">{l.year}</td>
                <td className="px-3 py-2">{l.price}</td>
                <td className="px-3 py-2">{l.stock}</td>
                <td className="px-3 py-2 text-right"><button onClick={()=>add(l.listingId, l.price)} className="rounded-md border px-3 py-1.5">До кошика</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
