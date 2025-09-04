import { setKYCStatus, getKYC } from '../state/shop.store'

export default function KYCModeration() {
  const k = getKYC('B1')
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">KYC модерація</h1>
      <div className="mt-2 text-sm">B1: {k?.status || 'none'}</div>
      <div className="mt-2 flex gap-2">
        <button className="rounded-md border px-3 py-1.5" onClick={()=>{ setKYCStatus('B1','verified'); alert('Approved') }}>Approve</button>
        <button className="rounded-md border px-3 py-1.5" onClick={()=>{ setKYCStatus('B1','rejected'); alert('Rejected') }}>Reject</button>
      </div>
    </div>
  )
}
