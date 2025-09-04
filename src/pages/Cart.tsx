import { getCart, setQty, remove } from '../shop/cart.store'
import { get as getListing } from '../shop/listings.store'
import { useMemo, useState } from 'react'

export default function Cart() {
  const [seed, setSeed] = useState(0)
  const buyer = 'Buyer-1'
  const rows = useMemo(()=> getCart(buyer), [seed])
  const total = rows.reduce((s,r)=> s + (getListing(r.listingId)?.priceUAH || 0) * r.qty, 0)
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Кошик</h1>
      {rows.length === 0 ? (
        <div className="mt-2 text-sm text-[var(--secondary)]">Порожньо</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--divider)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr><th className="px-3 py-2">Лістинг</th><th className="px-3 py-2">К-сть</th><th className="px-3 py-2">Ціна</th><th className="px-3 py-2 text-right">Дії</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.listingId} className="border-t border-[var(--divider)]">
                  <td className="px-3 py-2">{r.listingId}</td>
                  <td className="px-3 py-2"><input aria-label={`qty-${r.listingId}`} type="number" min={1} value={r.qty} onChange={(e)=>{ setQty(buyer, r.listingId, Number(e.target.value)||1); setSeed(x=>x+1) }} className="w-20 rounded border px-2 py-1" /></td>
                  <td className="px-3 py-2">{getListing(r.listingId)?.priceUAH || 0}</td>
                  <td className="px-3 py-2 text-right"><button onClick={()=>{ remove(buyer, r.listingId); setSeed(x=>x+1) }} className="rounded-md border px-3 py-1.5">Видалити</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 text-sm">Разом: <b>{total}</b> UAH</div>
    </div>
  )
}
