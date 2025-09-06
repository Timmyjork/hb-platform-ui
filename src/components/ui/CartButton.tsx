import { useEffect, useState } from 'react'
import { getCart } from '../../shop/cart.store'

export default function CartButton({ onClick }: { onClick?: () => void }) {
  const [count, setCount] = useState(() => getCart().reduce((s,i)=> s + i.qty, 0))
  useEffect(() => {
    const upd = () => setCount(getCart().reduce((s,i)=> s + i.qty, 0))
    window.addEventListener('cart:changed', upd as EventListener)
    return () => window.removeEventListener('cart:changed', upd as EventListener)
  }, [])
  return (
    <button aria-label="Кошик" onClick={onClick} className="relative rounded-md border px-2 py-1.5 text-sm">
      🛒
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] leading-4 text-white">
          {count}
        </span>
      )}
    </button>
  )
}
