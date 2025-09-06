import { getCart, cart as cartStore } from '../shop/cart.store'
import { createOrderFromCart } from '../shop/orders.store'

export default function Checkout() {
  const buyer = 'Buyer-1'
  const cart = getCart()
  const total = cartStore.totalUAH()
  async function onConfirm() {
    const name = (document.getElementById('name') as HTMLInputElement)?.value || 'Клієнт'
    const email = (document.getElementById('email') as HTMLInputElement)?.value || 'buyer@example.com'
    const phone = (document.getElementById('phone') as HTMLInputElement)?.value || ''
    const note = (document.getElementById('note') as HTMLTextAreaElement)?.value || ''
    const order = createOrderFromCart(buyer, { name, email, phone, note })
    cartStore.clear()
    alert(`Замовлення ${order.id} створено`)
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Оформлення</h1>
      <div className="mt-2 text-sm">Позицій: {cart.length}. Разом: <b>{total}</b> UAH</div>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input id="name" placeholder="ПІБ" className="rounded-md border px-3 py-2" />
        <input id="email" placeholder="Email" className="rounded-md border px-3 py-2" />
        <input id="phone" placeholder="Телефон" className="rounded-md border px-3 py-2" />
        <select id="contact" className="rounded-md border px-3 py-2"><option value="email">Email</option><option value="phone">Phone</option></select>
        <textarea id="note" placeholder="Коментар" className="col-span-1 md:col-span-2 rounded-md border px-3 py-2" />
      </div>
      <button className="mt-3 rounded-md border px-3 py-1.5" onClick={onConfirm}>Підтвердити замовлення</button>
    </div>
  )
}
