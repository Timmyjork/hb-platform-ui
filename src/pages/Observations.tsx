//
import { observationsToCSV, importObservationsCSV } from '../components/utils/csv'
import { listQueens } from '../state/queens.store'
import { useAuth } from '../auth/useAuth'

export default function Observations() {
  const { user, role } = useAuth()
  const queens = listQueens().filter(q => (role === 'buyer' || role === 'breeder') ? (q.ownerUserId === user?.id || q.breederId === user?.id) : true)
  const onExport = () => {
    const csv = observationsToCSV([])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'observations.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Вуликова карта (спостереження)</h1>
      <div className="mt-2 text-sm text-[var(--secondary)]">
        <p>Вуликова карта = ваші польові спостереження за 11 ознаками.</p>
        <p>Дані вносяться під час огляду сім’ї. Кожен запис має дату, ID матки (паспорт) і значення ознак.</p>
        <p>Заповнюйте чесно — ці дані впливають на аналітику та рейтинги.</p>
      </div>
      <div className="mt-4 text-sm text-[var(--secondary)]">Доступних маток: {queens.length}. Форма введення — у наступній ітерації.</div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-md border px-3 py-1.5" onClick={onExport}>Експорт CSV</button>
        <button className="rounded-md border px-3 py-1.5" onClick={() => importObservationsCSV('queenId,date')}>Імпорт CSV</button>
      </div>
    </div>
  )
}
