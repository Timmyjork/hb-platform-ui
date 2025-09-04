import { getCart, clear as clearCart } from '../shop/cart.store'
import { createDraft, place, payMock, markTransferred } from '../shop/orders.store'
import { processPaidOrder } from '../shop/flow'

export default function Checkout() {
  const buyer = 'Buyer-1'
  const cart = getCart(buyer)
  const total = cart.reduce((s,r)=> s + r.qty * 0, 0)
  async function onPay() {
    const draft = createDraft(buyer, cart)
    place(draft.id)
    const paid = payMock(draft.id, true)
    if (paid.payment.status === 'succeeded') {
      const issued = await processPaidOrder(paid)
      markTransferred(paid.id, issued)
      clearCart(buyer)
      alert('Оплачено і передано')
    } else {
      alert('Оплата неуспішна')
    }
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Оформлення</h1>
      <div className="mt-2 text-sm">Позицій: {cart.length}. Разом: <b>{total}</b> UAH</div>
      <button className="mt-3 rounded-md border px-3 py-1.5" onClick={onPay}>Оплатити</button>
    </div>
  )
}
