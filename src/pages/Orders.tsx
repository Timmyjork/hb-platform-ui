import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { listBuyerOrders, listBreederOrders, markPaid, transferOrder } from '../shop/orders.store'

export default function Orders() {
  const { role, user } = useAuth()
  const [seed, setSeed] = useState(0)
  const isBuyer = role === 'buyer'
  const isBreeder = role === 'breeder'
  const rows = useMemo(() => {
    if (isBuyer) return listBuyerOrders(user?.id || 'Buyer-1')
    if (isBreeder) return listBreederOrders(user?.id || 'B1')
    return []
  }, [role, user, seed, isBuyer, isBreeder])
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Замовлення</h1>
      {rows.length === 0 ? (
        <div className="mt-2 text-sm text-[var(--secondary)]">Немає замовлень</div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--divider)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2">№</th><th className="px-3 py-2">Дата</th><th className="px-3 py-2">Статус</th><th className="px-3 py-2">Сума</th><th className="px-3 py-2">Дії</th></tr></thead>
            <tbody>
            {rows.map(o => (
              <tr key={o.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">{o.createdAt.slice(0,19).replace('T',' ')}</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">{o.total}</td>
                <td className="px-3 py-2">
                  {isBreeder && (
                    <div className="flex gap-2">
                      <button className="rounded-md border px-2 py-1 disabled:opacity-40" disabled={o.status!=='pending'} onClick={()=>{ markPaid(o.id); setSeed(x=>x+1) }}>Оплачено</button>
                      <button className="rounded-md border px-2 py-1 disabled:opacity-40" disabled={o.status!=='paid'} onClick={async ()=>{ await transferOrder(o.id); setSeed(x=>x+1) }}>Передати</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
