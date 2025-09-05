import { snapshot, restore, listKeys } from '../infra/backup'
import { getHealth } from '../infra/health'
import { drainOnce } from '../infra/queue.worker'

export default function SettingsDev() {
  const health = getHealth()
  function exportJson() {
    const blob = snapshot(); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'hb-backup.json'; a.click(); setTimeout(()=> URL.revokeObjectURL(url), 0)
  }
  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; await restore(f); alert('Відновлено')
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Dev Tools</h1>
      <div className="mt-3 text-sm">Health: pending={health.queue.pending}, failed={health.queue.failed}, keys={health.storage.keys}, time={health.time}</div>
      <div className="mt-2 flex gap-2">
        <button className="rounded-md border px-3 py-1.5" onClick={exportJson}>Експорт даних (JSON)</button>
        <label className="text-sm inline-flex items-center gap-2">Імпорт
          <input type="file" accept="application/json" onChange={importJson} />
        </label>
        <button className="rounded-md border px-3 py-1.5" onClick={()=>{ void drainOnce(); alert('Queue drained') }}>drain queue now</button>
      </div>
      <div className="mt-4 text-xs text-[var(--secondary)]">LS keys: {listKeys().join(', ')}</div>
    </div>
  )
}
