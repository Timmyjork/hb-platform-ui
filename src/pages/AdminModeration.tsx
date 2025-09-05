import { useMemo, useState } from 'react'
import { listBreeders } from '../state/breeders.store'
import { listReviews as listRv, setReviewStatus } from '../state/reviews.store'
import { listQuestions as listQ, setQuestionStatus } from '../state/qa.store'

type Status = 'pending'|'approved'|'rejected'

export default function AdminModeration() {
  const [tab, setTab] = useState<'reviews'|'qa'>('reviews')
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-3">Адмін / Модерація</h1>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <button className={`rounded-md border px-3 py-1.5 ${tab==='reviews'?'bg-gray-100':''}`} onClick={()=> setTab('reviews')}>Відгуки</button>
        <button className={`rounded-md border px-3 py-1.5 ${tab==='qa'?'bg-gray-100':''}`} onClick={()=> setTab('qa')}>Q&A</button>
      </div>
      {tab==='reviews' ? <ModerateReviews /> : <ModerateQA />}
    </div>
  )
}

function ModerateReviews() {
  const breeders = useMemo(()=> listBreeders(), [])
  const [breederId, setBreederId] = useState<string>('')
  const [status, setStatus] = useState<Status | ''>('pending')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const reviews = useMemo(() => {
    const ids = breederId ? [breederId] : breeders.map(b=> b.breederId)
    const list = ids.flatMap(id => status ? listRv(id, status) : listRv(id))
    return list.filter(r => (!from || r.createdAt >= from) && (!to || r.createdAt <= to))
  }, [breederId, status, from, to, breeders])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const toggleAll = (flag: boolean) => { const next: Record<string, boolean> = {}; for (const r of reviews) next[r.id]=flag; setSelected(next) }
  const bulk = (s: Status) => { for (const r of reviews) if (selected[r.id]) setReviewStatus(r.breederId, r.id, s) }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 text-sm">
        <label>Breeder
          <select className="mt-1 w-full rounded border px-2 py-1" value={breederId} onChange={e=> setBreederId(e.target.value)}>
            <option value="">Усі</option>
            {breeders.map(b => <option key={b.breederId} value={b.breederId}>{b.displayName}</option>)}
          </select>
        </label>
        <label>Status
          <select className="mt-1 w-full rounded border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}>
            <option value="">Усі</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>Від
          <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={from} onChange={e=> setFrom(e.target.value)} />
        </label>
        <label>До
          <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={to} onChange={e=> setTo(e.target.value)} />
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded border px-2 py-1" onClick={()=> toggleAll(true)}>Select all</button>
          <button className="rounded border px-2 py-1" onClick={()=> toggleAll(false)}>Clear</button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className="rounded border px-2 py-1" onClick={()=> bulk('approved')}>Approve</button>
        <button className="rounded border px-2 py-1" onClick={()=> bulk('rejected')}>Reject</button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" aria-label="select-all" onChange={e=> toggleAll(e.currentTarget.checked)} /></th>
              <th className="px-3 py-2">Автор</th>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Текст</th>
              <th className="px-3 py-2">breederId</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={e=> setSelected({ ...selected, [r.id]: e.currentTarget.checked })} /></td>
                <td className="px-3 py-2">{r.authorDisplay || r.authorUserId}</td>
                <td className="px-3 py-2">{r.createdAt.slice(0,10)}</td>
                <td className="px-3 py-2">{r.text}</td>
                <td className="px-3 py-2"><a className="underline" href={`#/breeder/${r.breederId}`}>{r.breederId}</a></td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded border px-2 py-1" onClick={()=> setReviewStatus(r.breederId, r.id, 'approved')}>Approve</button>
                    <button className="rounded border px-2 py-1" onClick={()=> setReviewStatus(r.breederId, r.id, 'rejected')}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ModerateQA() {
  const breeders = useMemo(()=> listBreeders(), [])
  const [breederId, setBreederId] = useState<string>('')
  const [status, setStatus] = useState<Status | ''>('pending')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const questions = useMemo(() => {
    const ids = breederId ? [breederId] : breeders.map(b=> b.breederId)
    const list = ids.flatMap(id => status ? listQ(id, status) : listQ(id))
    return list.filter(q => (!from || q.createdAt >= from) && (!to || q.createdAt <= to))
  }, [breederId, status, from, to, breeders])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const toggleAll = (flag: boolean) => { const next: Record<string, boolean> = {}; for (const q of questions) next[q.id]=flag; setSelected(next) }
  const bulk = (s: Status) => { for (const q of questions) if (selected[q.id]) setQuestionStatus(q.breederId, q.id, s) }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 text-sm">
        <label>Breeder
          <select className="mt-1 w-full rounded border px-2 py-1" value={breederId} onChange={e=> setBreederId(e.target.value)}>
            <option value="">Усі</option>
            {breeders.map(b => <option key={b.breederId} value={b.breederId}>{b.displayName}</option>)}
          </select>
        </label>
        <label>Status
          <select className="mt-1 w-full rounded border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}>
            <option value="">Усі</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>Від
          <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={from} onChange={e=> setFrom(e.target.value)} />
        </label>
        <label>До
          <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={to} onChange={e=> setTo(e.target.value)} />
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded border px-2 py-1" onClick={()=> toggleAll(true)}>Select all</button>
          <button className="rounded border px-2 py-1" onClick={()=> toggleAll(false)}>Clear</button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className="rounded border px-2 py-1" onClick={()=> bulk('approved')}>Approve</button>
        <button className="rounded border px-2 py-1" onClick={()=> bulk('rejected')}>Reject</button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" aria-label="select-all" onChange={e=> toggleAll(e.currentTarget.checked)} /></th>
              <th className="px-3 py-2">Автор</th>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Текст</th>
              <th className="px-3 py-2">breederId</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2"><input type="checkbox" checked={!!selected[q.id]} onChange={e=> setSelected({ ...selected, [q.id]: e.currentTarget.checked })} /></td>
                <td className="px-3 py-2">{q.authorUserId}</td>
                <td className="px-3 py-2">{q.createdAt.slice(0,10)}</td>
                <td className="px-3 py-2">{q.text}</td>
                <td className="px-3 py-2"><a className="underline" href={`#/breeder/${q.breederId}`}>{q.breederId}</a></td>
                <td className="px-3 py-2">{q.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded border px-2 py-1" onClick={()=> setQuestionStatus(q.breederId, q.id, 'approved')}>Approve</button>
                    <button className="rounded border px-2 py-1" onClick={()=> setQuestionStatus(q.breederId, q.id, 'rejected')}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

