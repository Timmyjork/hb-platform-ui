import { useMemo } from 'react'
import { listOrdersByBuyer } from '../shop/orders.store'
import { downloadPassport } from '../passports/generate'

export default function OrderStatus({ orderId = '' }: { orderId?: string }) {
  const buyer = 'Buyer-1'
  const order = useMemo(()=> listOrdersByBuyer(buyer).find(o=> o.id === orderId), [buyer, orderId])
  if (!order) return <div className="p-4">Немає такого замовлення</div>
  const st = order.status
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Статус замовлення: {order.id}</h1>
      <div className="mt-2 text-sm">Стан: <b>{st}</b></div>
      {(st==='paid' || st==='transferred') && (
        <div className="mt-3">
          <div className="text-sm font-medium">Паспорти</div>
          <ul className="mt-1 space-y-1">
            {order.passports.map((id: string) => (
              <li key={id} className="flex items-center gap-2 text-sm">
                <span>{id}</span>
                <button className="rounded border px-2 py-1" onClick={async ()=>{ const b = await downloadPassport(id); const url = URL.createObjectURL(b); window.open(url, '_blank') }}>Завантажити</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {st==='placed' && <div className="mt-2 text-sm">Очікуємо оплату…</div>}
      {st!=='transferred' && <div className="mt-4 text-sm">Питання? <a href="mailto:support@example.com" className="underline">Напишіть підтримці</a></div>}
    </div>
  )
}
