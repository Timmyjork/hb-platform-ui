import { useMemo, useState } from 'react'
import { listQueens, transferOwnership } from '../state/queens.store'
import { addObservation, listObservationsByQueen } from '../state/observations.store'
import type { TenTraits } from '../types/queen'
import { useAuth } from '../auth/useAuth'

export default function QueenCard({ queenId }: { queenId: string }) {
  const { user } = useAuth()
  const queen = useMemo(()=> listQueens().find(q=> q.id === queenId), [queenId])
  const [tab, setTab] = useState<'passport'|'observations'|'history'>('passport')
  const [note, setNote] = useState('')
  const [traits, setTraits] = useState<Partial<TenTraits>>({})

  if (!queen) return <div>Queen not found</div>
  const isOwner = !!user && queen.ownerUserId === user.id

  function onAddObservation() {
    addObservation({ queenId, observerId: user?.id || 'anon', date: new Date().toISOString(), traits, note })
    setTraits({}); setNote('')
    alert('Спостереження збережено')
  }

  function onTransfer() {
    const buyer = prompt('Введіть userId покупця:')
    if (buyer) transferOwnership(queenId, buyer)
  }

  const obs = listObservationsByQueen(queenId)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Картка матки</h1>
        <span className="text-sm text-[var(--secondary)]">{queen.id}</span>
        <span className="ml-auto text-sm">Статус: {queen.status}</span>
        <span className="text-sm">Власник: {queen.ownerUserId || '—'}</span>
        <button className="rounded-md border px-2 py-1" onClick={onTransfer}>Передати власність</button>
      </div>

      <div className="flex gap-2">
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='passport'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('passport')}>Паспорт</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='observations'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('observations')}>Спостереження</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='history'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('history')}>Історія</button>
      </div>

      {tab==='passport' && (
        <div className="rounded-md border p-3 text-sm">
          <div>Порода: {queen.breedCode}</div>
          <div>Спілка: {queen.unionCode}</div>
          <div>Маткар №: {queen.breederNo}</div>
          <div>Рік: {queen.year}</div>
        </div>
      )}

      {tab==='observations' && (
        <div className="space-y-3">
          {isOwner ? (
            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-medium">Нове спостереження</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {['honey','winter','temperament','calmOnFrames','swarming','hygienic','varroaResist','springBuildUp','colonyStrength','broodFrames'].map((k)=> (
                  <label key={k} className="text-sm">
                    <span>{k}</span>
                    <input aria-label={k} type="number" min={0} max={100} className="mt-1 w-full rounded-md border px-2 py-1" value={(traits as any)[k] ?? ''} onChange={e=> setTraits({ ...traits, [k]: Math.max(0, Math.min(100, Number(e.target.value)||0)) } as any)} />
                  </label>
                ))}
              </div>
              <label className="text-sm block mt-2">Нотатка
                <input aria-label="note" className="mt-1 w-full rounded-md border px-2 py-1" value={note} onChange={e=> setNote(e.target.value)} />
              </label>
              <button className="mt-2 rounded-md border px-3 py-1.5" onClick={onAddObservation}>Додати</button>
            </div>
          ) : (
            <div className="text-sm text-[var(--secondary)]">Лише власник може додавати спостереження.</div>
          )}

          <div className="rounded-md border p-3">
            <div className="mb-2 text-sm font-medium">Останні спостереження</div>
            <table className="w-full border-collapse text-sm">
              <thead><tr>{['Дата','Спостерігач','Нотатка'].map(h=> <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {obs.map(o=> (
                  <tr key={o.date} className="border-t">
                    <td className="px-2 py-1">{new Date(o.date).toLocaleString()}</td>
                    <td className="px-2 py-1">{o.observerId}</td>
                    <td className="px-2 py-1">{o.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='history' && (
        <div className="rounded-md border p-3 text-sm">Поки що історія відсутня.</div>
      )}
    </div>
  )
}
