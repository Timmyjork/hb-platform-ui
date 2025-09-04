import { getKYC, submitKYC } from '../state/shop.store'

export default function BreederKYC() {
  const k = getKYC('B1')
  async function onSubmit() {
    submitKYC({ userId:'B1', fullName:'Breeder One' })
    alert('Надіслано')
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Верифікація (KYC)</h1>
      <div className="mt-2 text-sm">Статус: <b>{k?.status || 'none'}</b></div>
      <button className="mt-3 rounded-md border px-3 py-1.5" onClick={onSubmit}>Подати заявку</button>
    </div>
  )
}
