import { useMemo, useState } from 'react'
import { v18_getListing as getListing } from '../state/listings.store'
import { addToCartByUser } from '../state/cart.store'
import { useAuth } from '../auth/useAuth'
import { setMeta } from '../utils/seo'

export default function PublicListing({ idOrSlug = '' }: { idOrSlug?: string }) {
  const { user } = useAuth()
  const [qty, setQty] = useState(1)
  const listing = useMemo(()=> getListing(idOrSlug), [idOrSlug])
  if (!listing) return <div className="p-4">Лістинг не знайдено</div>
  const L = listing!
  setMeta({ title: `${L.title} — ₴${L.priceUAH}` })
  function add() {
    if (!user) { alert('Увійдіть'); return }
    addToCartByUser(user.id, L.id, Math.max(1, qty))
    alert('Додано в кошик')
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">{L.title}</h1>
      <div className="mt-2 text-sm">Ціна: <b>₴{L.priceUAH}</b> • В наявності: {L.stock}</div>
      <div className="mt-2 text-sm">Порода: {L.breedCode} • Регіон: {L.regionCode} • Рік: {L.year}</div>
      <div className="mt-3 flex items-center gap-2">
        <input type="number" min={1} value={qty} onChange={e=> setQty(Number(e.target.value)||1)} className="w-24 rounded border px-2 py-1 text-sm" />
        <button className="rounded-md border px-3 py-1.5" onClick={add}>В кошик</button>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org', '@type':'Product', name: L.title, offers: { '@type':'Offer', priceCurrency:'UAH', price: L.priceUAH, availability: L.stock>0? 'https://schema.org/InStock':'https://schema.org/OutOfStock' }
      }) }} />
    </div>
  )
}
