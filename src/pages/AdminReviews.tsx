import { useMemo, useState } from 'react'
import { listAll as listAllReviews, bulkModerate } from '../state/reviews.public.store'
import { audit } from '../state/admin.audit.store'
import { listBreedersPublic } from '../state/breeders.public.store'

export default function AdminReviews() {
  const breeders = useMemo(()=> listBreedersPublic(), [])
  const [breederId, setBreederId] = useState('')
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'|''>('pending')
  const [q, setQ] = useState('')
  const spInit = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const [offset, setOffset] = useState<number>(Number(spInit.get('offset')||0))
  const [limit] = useState<number>(Number(spInit.get('limit')||20) || 20)
  const [sort, setSort] = useState<'date_desc'|'date_asc'|'rating_desc'|'rating_asc'>('date_desc')
  const page = useMemo(()=> listAllReviews({ breederId: breederId || undefined, status: status || undefined as any, q, offset, limit, sort }), [breederId, status, q, offset, limit, sort])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const toggleAll = (flag:boolean) => { const next: Record<string, boolean> = {}; for (const r of page.rows) next[r.id]=flag; setSelected(next) }
  const bulk = (s: 'approved'|'rejected') => { const ids = page.rows.filter(r=> selected[r.id]).map(r=> r.id); const n = bulkModerate(ids, s); audit('review.moderate.bulk', { ids, status: s, count:n }); setSelected({}); setOffset(0) }
  // query-sync
  useMemo(() => {
    const usp = new URLSearchParams()
    if (offset) usp.set('offset', String(offset))
    if (limit !== 20) usp.set('limit', String(limit))
    const qstr = usp.toString(); const next = qstr ? `?${qstr}` : ''
    if (typeof window !== 'undefined' && window.location.search !== next) {
      window.history.replaceState(null, '', `${window.location.pathname}${next}`)
    }
  }, [offset, limit])
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-3">Адмін / Відгуки</h1>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 text-sm mb-2">
        <label>Breeder<select className="mt-1 w-full rounded border px-2 py-1" value={breederId} onChange={e=> setBreederId(e.target.value)}><option value="">Усі</option>{breeders.map(b=> <option key={b.breederId} value={b.breederId}>{b.displayName}</option>)}</select></label>
        <label>Status<select className="mt-1 w-full rounded border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}><option value="">Усі</option><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option></select></label>
        <label>Пошук<input className="mt-1 w-full rounded border px-2 py-1" value={q} onChange={e=> setQ(e.target.value)} placeholder="текст" /></label>
        <label>Сортування<select className="mt-1 w-full rounded border px-2 py-1" value={sort} onChange={e=> setSort(e.target.value as any)}><option value="date_desc">Дата ↓</option><option value="date_asc">Дата ↑</option><option value="rating_desc">Рейтинг ↓</option><option value="rating_asc">Рейтинг ↑</option></select></label>
        <div className="flex items-end gap-2"><button className="rounded border px-2 py-1" onClick={()=> toggleAll(true)}>Select all</button><button className="rounded border px-2 py-1" onClick={()=> toggleAll(false)}>Clear</button></div>
      </div>
      <div className="flex items-center gap-2 text-sm mb-2">
        <button className="rounded border px-2 py-1" onClick={()=> bulk('approved')}>Approve</button>
        <button className="rounded border px-2 py-1" onClick={()=> bulk('rejected')}>Reject</button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2"><input type="checkbox" aria-label="select-all" onChange={e=> toggleAll(e.currentTarget.checked)} /></th><th className="px-3 py-2">Маткар</th><th className="px-3 py-2">Рейтинг</th><th className="px-3 py-2">Текст</th><th className="px-3 py-2">Статус</th><th className="px-3 py-2">Дата</th></tr></thead>
          <tbody>
            {page.rows.map(r => {
              const breeder = breeders.find(b=> b.breederId===r.breederId)
              return (
                <tr key={r.id} className="border-t border-[var(--divider)]">
                  <td className="px-3 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={e=> setSelected({ ...selected, [r.id]: e.currentTarget.checked })} /></td>
                  <td className="px-3 py-2">{breeder?.displayName || r.breederId}</td>
                  <td className="px-3 py-2">{r.rating}</td>
                  <td className="px-3 py-2">{r.text}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.createdAt.slice(0,10)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={offset<=0} onClick={()=> setOffset(Math.max(0, offset-limit))}>Prev</button>
        <span>Показано {page.total? offset+1: 0}–{Math.min(offset+limit, page.total)} з {page.total}</span>
        <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={offset+limit>=page.total} onClick={()=> setOffset(offset+limit < page.total ? offset+limit : offset)}>Next</button>
      </div>
    </div>
  )
}
