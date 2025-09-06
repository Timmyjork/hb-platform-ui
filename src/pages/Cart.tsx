import { cart as cartStore, getCart } from '../shop/cart.store'
import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { createOrderFromCart } from '../shop/orders.store'

export default function Cart() {
  const [seed, setSeed] = useState(0)
  const { role, user } = useAuth()
  const rows = useMemo(()=> getCart(), [seed])
  const total = useMemo(()=> cartStore.totalUAH(), [rows])
  const canCheckout = role === 'buyer' || role === 'breeder'
  async function onCheckout() {
    if (!canCheckout) return
    const buyerId = user?.id || 'Buyer-1'
    createOrderFromCart(buyerId, { name: user?.name || 'Клієнт', email: user?.email || 'buyer@example.com' })
    cartStore.clear(); setSeed(x=>x+1)
    alert('Замовлення створено')
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Кошик</h1>
      {rows.length === 0 ? (
        <div className="mt-2 text-sm text-[var(--secondary)]">Порожньо</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--divider)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr><th className="px-3 py-2">Товар</th><th className="px-3 py-2">Ціна</th><th className="px-3 py-2">К-сть</th><th className="px-3 py-2">Сума</th><th className="px-3 py-2 text-right">Дії</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.listingId} className="border-t border-[var(--divider)]">
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2">{r.priceUAH}</td>
                  <td className="px-3 py-2"><input aria-label={`qty-${r.listingId}`} type="number" min={1} max={r.max} value={r.qty} onChange={(e)=>{ cartStore.setQty(r.listingId, Number(e.target.value)||1); setSeed(x=>x+1) }} className="w-20 rounded border px-2 py-1" /></td>
                  <td className="px-3 py-2">{r.qty * r.priceUAH}</td>
                  <td className="px-3 py-2 text-right"><button onClick={()=>{ cartStore.remove(r.listingId); setSeed(x=>x+1) }} className="rounded-md border px-3 py-1.5">Видалити</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 text-sm">Разом: <b>{total}</b> UAH</div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-md border px-3 py-1.5" onClick={()=>{ cartStore.clear(); setSeed(x=>x+1) }}>Очистити кошик</button>
        <button className="rounded-md border px-3 py-1.5 disabled:opacity-40" disabled={!canCheckout || rows.length===0} onClick={onCheckout}>Оформити замовлення</button>
        {!canCheckout && <span className="text-xs text-[var(--secondary)]">Увійдіть, щоб продовжити</span>}
      </div>
    </div>
  )
}
