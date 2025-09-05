import { useMemo, useState } from 'react'
import { listAudit } from '../state/admin.audit.store'
import { toCSV } from '../components/utils/csv'

export default function AdminAudit() {
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [offset, setOffset] = useState(0)
  const page = useMemo(()=> listAudit({ q, from, to, offset, limit: 50 }), [q, from, to, offset])
  const onExport = () => {
    const text = toCSV(page.rows.map(r => ({ id:r.id, at:r.at, actor:r.actorId, action:r.action, payload: JSON.stringify(r.payload||{}) })))
    // basic browser download
    const blob = new Blob([text], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='audit.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-3">Адмін / Аудит-лог</h1>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4 text-sm mb-2">
        <label>Пошук<input className="mt-1 w-full rounded border px-2 py-1" value={q} onChange={e=> setQ(e.target.value)} placeholder="action" /></label>
        <label>Від<input type="date" className="mt-1 w-full rounded border px-2 py-1" value={from} onChange={e=> setFrom(e.target.value)} /></label>
        <label>До<input type="date" className="mt-1 w-full rounded border px-2 py-1" value={to} onChange={e=> setTo(e.target.value)} /></label>
        <div className="flex items-end"><button className="rounded border px-2 py-1" onClick={onExport}>Експорт CSV</button></div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2">Дата</th><th className="px-3 py-2">Actor</th><th className="px-3 py-2">Дія</th><th className="px-3 py-2">Payload</th></tr></thead>
          <tbody>
            {page.rows.map(r => (
              <tr key={r.id} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{r.at.slice(0,19).replace('T',' ')}</td>
                <td className="px-3 py-2">{r.actorId}</td>
                <td className="px-3 py-2">{r.action}</td>
                <td className="px-3 py-2 font-mono text-xs">{JSON.stringify(r.payload)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm"><button className="rounded border px-2 py-1" onClick={()=> setOffset(Math.max(0, offset-50))}>Prev</button><span>{offset+1}-{Math.min(offset+50, page.total)} / {page.total}</span><button className="rounded border px-2 py-1" onClick={()=> setOffset(offset+50 < page.total ? offset+50 : offset)}>Next</button></div>
    </div>
  )
}

