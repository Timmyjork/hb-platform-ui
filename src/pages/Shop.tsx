import { useMemo, useState } from 'react'
import CatalogFilters from '../components/catalog/Filters'
import { listActive } from '../shop/listings.store'
import { cart, toCartItem } from '../shop/cart.store'
import { useToast } from '../components/ui/Toast'

export default function Shop() {
  const [seed] = useState(0)
  const { push } = useToast()
  const listings = useMemo(()=> listActive(), [seed])
  const add = (i: number) => {
    const l = listings[i]
    cart.add(toCartItem(l), 1)
    push({ title: 'Додано в кошик', tone: 'success' })
  }
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
            {listings.map((l, i) => (
              <tr key={l.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{l.id}</td>
                <td className="px-3 py-2">{l.breedCode}</td>
                <td className="px-3 py-2">{l.regionCode}</td>
                <td className="px-3 py-2">{l.year}</td>
                <td className="px-3 py-2">{l.priceUAH}</td>
                <td className="px-3 py-2">{l.qtyAvailable}</td>
                <td className="px-3 py-2 text-right"><button disabled={l.qtyAvailable<=0} onClick={()=>add(i)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">До кошика</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
