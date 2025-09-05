import { useEffect, useMemo, useState } from 'react'
import type { Breed, Region } from '../types/dictionaries'
import {
  listBreeds, listRegions,
  saveBreed, saveRegion,
  archiveBreed, deprecateBreed, deleteBreed,
  archiveRegion, deprecateRegion, deleteRegion,
  usageCountBreed, usageCountRegion,
} from '../state/dictionaries.store'
import { breedsToCSV, regionsToCSV, importBreedsCSV, importRegionsCSV, toCSV } from '../components/utils/csv'
import { exportToXLSX, importFromXLSX } from '../components/utils/xlsx'
import { useToast } from '../components/ui/Toast'
import { useRateLimit } from '../infra/ratelimit'

type TabKey = 'breeds'|'regions'

export default function AdminDictionaries() {
  const [tab, setTab] = useState<TabKey>('breeds')
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-3">Адмін / Довідники</h1>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <button className={`rounded-md border px-3 py-1.5 ${tab==='breeds'?'bg-gray-100':''}`} onClick={()=>setTab('breeds')}>Породи</button>
        <button className={`rounded-md border px-3 py-1.5 ${tab==='regions'?'bg-gray-100':''}`} onClick={()=>setTab('regions')}>Регіони</button>
      </div>
      {tab==='breeds' ? <DictBreeds /> : <DictRegions />}
    </div>
  )
}

function DictBreeds() {
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [seed, setSeed] = useState(0)
  const rows = useMemo(() => listBreeds(), [seed])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(b => b.code.includes(s) || b.label.toLowerCase().includes(s) || (b.synonyms||[]).some(x => x.includes(s)))
  }, [rows, q])
  const [working, setWorking] = useState<string[]>([])
  useEffect(() => { setWorking(filtered.map(b => b.code)) }, [filtered])
  const [editing, setEditing] = useState<Breed | null>(null)
  const [mode, setMode] = useState<'merge'|'replace'>('merge')
  const [importText, setImportText] = useState('')
  const [importPreview, setImportPreview] = useState<{added:number,updated:number,skipped:number}|null>(null)
  const rl = useRateLimit('csv_breeds_import', 5)

  useEffect(() => {
    setImportPreview(null)
  }, [mode, importText])

  function onSave(b: Breed) {
    try {
      saveBreed({ code: b.code, label: b.label, synonyms: b.synonyms, status: b.status, createdAt: b.createdAt })
      push({ title: 'Збережено', tone: 'success' })
      setEditing(null)
      setSeed(x=>x+1)
    } catch(e: any) { push({ title: e?.message || String(e), tone: 'danger' }) }
  }

  function onImport() {
    if (!rl.tryConsume()) { push({ title: 'Ліміт імпорту вичерпано. Спробуйте пізніше.', tone: 'warning' }); return }
    try {
      const res = importBreedsCSV(importText, mode)
      setImportPreview(res)
      push({ title: `Імпорт: +${res.added}, ~${res.updated}, skip ${res.skipped}`, tone: 'success' })
      setSeed(x=>x+1)
    } catch(e:any) { push({ title: e?.message || String(e), tone:'danger' }) }
  }

  function onExport() { const text = breedsToCSV(); download(text, 'breeds.csv') }
  function onExportXLSX() { exportToXLSX('breeds.xlsx', rows) }
  async function onImportXLSX(file: File) {
    const data = await importFromXLSX(file)
    const csv = toCSV(data as any)
    try { const res = importBreedsCSV(csv, mode); setImportPreview(res); push({ title: `XLSX: +${res.added}, ~${res.updated}, skip ${res.skipped}`, tone: 'success' }); setSeed(x=>x+1) } catch(e:any) { push({ title: e?.message || String(e), tone:'danger' }) }
  }
  function saveOrder() {
    const ordered = working.map(code => filtered.find(b => b.code===code)!).filter(Boolean)
    const next = ordered.map((b, i) => ({ ...b, order: i+1 }))
    for (const n of next) saveBreed({ code: n.code, label: n.label, synonyms: n.synonyms, status: n.status, createdAt: n.createdAt, order: n.order } as any)
    push({ title: 'Порядок збережено', tone: 'success' }); setSeed(x=>x+1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input placeholder="Пошук (code/label/synonyms)" className="w-80 rounded-md border px-2 py-1 text-sm" value={q} onChange={e=> setQ(e.target.value)} />
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={()=> setEditing({ code:'', label:'', synonyms:[], status:'active', createdAt:'', updatedAt:'' })}>Додати</button>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onExport}>Експорт CSV</button>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onExportXLSX}>Експорт XLSX</button>
        <label className="ml-auto text-xs">Імпорт XLSX<input type="file" accept=".xlsx" className="ml-2 text-xs" onChange={e=> { const f=e.currentTarget.files?.[0]; if (f) onImportXLSX(f) }} /></label>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={saveOrder}>Зберегти порядок</button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">↕</th>
              <th className="px-3 py-2">code</th>
              <th className="px-3 py-2">label</th>
              <th className="px-3 py-2">status</th>
              <th className="px-3 py-2">usage</th>
              <th className="px-3 py-2 text-right"/>
            </tr>
          </thead>
          <tbody>
            {working.map(code => filtered.find(b=> b.code===code)!).filter(Boolean).map(b => {
              const usage = usageCountBreed(b.code)
              return (
                <tr key={b.code} className="border-t border-[var(--divider)]" draggable onDragStart={(e)=> { e.dataTransfer.setData('text/plain', b.code) }} onDragOver={(e)=> e.preventDefault()} onDrop={(e)=> {
                  const src = e.dataTransfer.getData('text/plain'); const si = working.findIndex(x=> x===src); const di = working.findIndex(x=> x===b.code); if (si<0||di<0||si===di) return; const arr = [...working]; const [m] = arr.splice(si,1); arr.splice(di,0,m); setWorking(arr)
                }}>
                  <td className="px-3 py-2 cursor-grab">⋮⋮</td>
                  <td className="px-3 py-2 font-mono">{b.code}</td>
                  <td className="px-3 py-2">{b.label}</td>
                  <td className="px-3 py-2">{b.status}</td>
                  <td className="px-3 py-2">{usage}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button className="rounded border px-2 py-1" onClick={()=> setEditing(b)}>Edit</button>
                      <button className="rounded border px-2 py-1" onClick={()=> { archiveBreed(b.code); setSeed(x=>x+1) }}>Archive</button>
                      <button className="rounded border px-2 py-1" onClick={()=> { deprecateBreed(b.code); setSeed(x=>x+1) }}>Deprecate</button>
                      <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={usage>0} title={usage>0?`Використовується ${usage}`:''} onClick={()=> { try { deleteBreed(b.code); setSeed(x=>x+1) } catch(e:any) { push({ title: e?.message||String(e), tone:'danger' }) } }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border p-3">
        <div className="mb-2 text-sm font-medium">Імпорт CSV</div>
        <div className="mb-2 flex items-center gap-2 text-sm">
          <select className="rounded border px-2 py-1" value={mode} onChange={e=> setMode(e.target.value as any)}>
            <option value="merge">merge</option>
            <option value="replace">replace</option>
          </select>
          {importPreview && <span className="text-xs text-[var(--secondary)]">Результат: +{importPreview.added}, ~{importPreview.updated}, skip {importPreview.skipped}</span>}
        </div>
        <textarea className="w-full h-24 rounded border px-2 py-1 text-xs font-mono" placeholder="code,label,status,synonyms" value={importText} onChange={e=> setImportText(e.target.value)} />
        <div className="mt-2 text-right"><button className="rounded border px-3 py-1.5 text-sm" onClick={onImport}>Імпорт</button></div>
      </div>

      {editing && <EditBreedModal value={editing} onClose={()=> setEditing(null)} onSave={onSave} />}
    </div>
  )
}

function DictRegions() {
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [seed, setSeed] = useState(0)
  const rows = useMemo(() => listRegions(), [seed])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(r => r.code.includes(s) || r.label.toLowerCase().includes(s))
  }, [rows, q])
  const [working, setWorking] = useState<string[]>([])
  useEffect(() => { setWorking(filtered.map(r => r.code)) }, [filtered])
  const [editing, setEditing] = useState<Region | null>(null)
  const [mode, setMode] = useState<'merge'|'replace'>('merge')
  const [importText, setImportText] = useState('')
  const [importPreview, setImportPreview] = useState<{added:number,updated:number,skipped:number}|null>(null)
  const rl = useRateLimit('csv_regions_import', 5)

  function onSave(r: Region) {
    try {
      saveRegion({ code: r.code, label: r.label, status: r.status, createdAt: r.createdAt })
      setEditing(null)
      setSeed(x=>x+1)
      push({ title:'Збережено', tone:'success' })
    } catch(e:any) { push({ title: e?.message || String(e), tone:'danger' }) }
  }
  function onImport() {
    if (!rl.tryConsume()) { push({ title: 'Ліміт імпорту вичерпано. Спробуйте пізніше.', tone: 'warning' }); return }
    try {
      const res = importRegionsCSV(importText, mode)
      setImportPreview(res)
      push({ title: `Імпорт: +${res.added}, ~${res.updated}, skip ${res.skipped}`, tone: 'success' })
      setSeed(x=>x+1)
    } catch(e:any) { push({ title: e?.message || String(e), tone:'danger' }) }
  }
  function onExport() { const text = regionsToCSV(); download(text, 'regions.csv') }
  function onExportXLSX() { exportToXLSX('regions.xlsx', rows) }
  async function onImportXLSX(file: File) {
    const data = await importFromXLSX(file)
    const csv = toCSV(data as any)
    try { const res = importRegionsCSV(csv, mode); setImportPreview(res); push({ title: `XLSX: +${res.added}, ~${res.updated}, skip ${res.skipped}`, tone: 'success' }); setSeed(x=>x+1) } catch(e:any) { push({ title: e?.message || String(e), tone:'danger' }) }
  }
  function saveOrder() {
    const ordered = working.map(code => filtered.find(r => r.code===code)!).filter(Boolean)
    const next = ordered.map((r, i) => ({ ...r, order: i+1 }))
    for (const n of next) saveRegion({ code: n.code, label: n.label, status: n.status, createdAt: n.createdAt, order: n.order } as any)
    push({ title: 'Порядок збережено', tone: 'success' }); setSeed(x=>x+1)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input placeholder="Пошук (code/label)" className="w-80 rounded-md border px-2 py-1 text-sm" value={q} onChange={e=> setQ(e.target.value)} />
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={()=> setEditing({ code:'', label:'', status:'active', createdAt:'', updatedAt:'' })}>Додати</button>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onExport}>Експорт CSV</button>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onExportXLSX}>Експорт XLSX</button>
        <label className="ml-auto text-xs">Імпорт XLSX<input type="file" accept=".xlsx" className="ml-2 text-xs" onChange={e=> { const f=e.currentTarget.files?.[0]; if (f) onImportXLSX(f) }} /></label>
        <button className="rounded-md border px-3 py-1.5 text-sm" onClick={saveOrder}>Зберегти порядок</button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">↕</th>
              <th className="px-3 py-2">code</th>
              <th className="px-3 py-2">label</th>
              <th className="px-3 py-2">status</th>
              <th className="px-3 py-2">usage</th>
              <th className="px-3 py-2 text-right"/>
            </tr>
          </thead>
          <tbody>
            {working.map(code => filtered.find(r=> r.code===code)!).filter(Boolean).map(r => {
              const usage = usageCountRegion(r.code)
              return (
                <tr key={r.code} className="border-t border-[var(--divider)]" draggable onDragStart={(e)=> { e.dataTransfer.setData('text/plain', r.code) }} onDragOver={(e)=> e.preventDefault()} onDrop={(e)=> {
                  const src = e.dataTransfer.getData('text/plain'); const si = working.findIndex(x=> x===src); const di = working.findIndex(x=> x===r.code); if (si<0||di<0||si===di) return; const arr = [...working]; const [m] = arr.splice(si,1); arr.splice(di,0,m); setWorking(arr)
                }}>
                  <td className="px-3 py-2 cursor-grab">⋮⋮</td>
                  <td className="px-3 py-2 font-mono">{r.code}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{usage}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button className="rounded border px-2 py-1" onClick={()=> setEditing(r)}>Edit</button>
                      <button className="rounded border px-2 py-1" onClick={()=> { archiveRegion(r.code); setSeed(x=>x+1) }}>Archive</button>
                      <button className="rounded border px-2 py-1" onClick={()=> { deprecateRegion(r.code); setSeed(x=>x+1) }}>Deprecate</button>
                      <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={usage>0} title={usage>0?`Використовується ${usage}`:''} onClick={()=> { try { deleteRegion(r.code); setSeed(x=>x+1) } catch(e:any) { push({ title: e?.message||String(e), tone:'danger' }) } }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="rounded-md border p-3">
        <div className="mb-2 text-sm font-medium">Імпорт CSV</div>
        <div className="mb-2 flex items-center gap-2 text-sm">
          <select className="rounded border px-2 py-1" value={mode} onChange={e=> setMode(e.target.value as any)}>
            <option value="merge">merge</option>
            <option value="replace">replace</option>
          </select>
          {importPreview && <span className="text-xs text-[var(--secondary)]">Результат: +{importPreview.added}, ~{importPreview.updated}, skip {importPreview.skipped}</span>}
        </div>
        <textarea className="w-full h-24 rounded border px-2 py-1 text-xs font-mono" placeholder="code,label,status" value={importText} onChange={e=> setImportText(e.target.value)} />
        <div className="mt-2 text-right"><button className="rounded border px-3 py-1.5 text-sm" onClick={onImport}>Імпорт</button></div>
      </div>

      {editing && <EditRegionModal value={editing} onClose={()=> setEditing(null)} onSave={onSave} />}
    </div>
  )
}

function EditBreedModal({ value, onClose, onSave }: { value: Breed; onClose: ()=>void; onSave: (b: Breed)=>void }) {
  const [code, setCode] = useState(value.code)
  const [label, setLabel] = useState(value.label)
  const [synonyms, setSynonyms] = useState((value.synonyms||[]).join(', '))
  const [status, setStatus] = useState<Breed['status']>(value.status)
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="w-[560px] rounded-md border bg-white p-4">
        <div className="mb-2 text-lg font-semibold">Порода</div>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm">Code
            <input className="mt-1 w-full rounded-md border px-2 py-1" value={code} onChange={e=> setCode(e.target.value)} />
            <div className="text-xs text-[var(--secondary)]">lower-kebab, 2..32</div>
          </label>
          <label className="text-sm">Label
            <input className="mt-1 w-full rounded-md border px-2 py-1" value={label} onChange={e=> setLabel(e.target.value)} />
          </label>
          <label className="text-sm">Synonyms
            <input className="mt-1 w-full rounded-md border px-2 py-1" value={synonyms} onChange={e=> setSynonyms(e.target.value)} />
            <div className="text-xs text-[var(--secondary)]">кома або | між значеннями</div>
          </label>
          <label className="text-sm">Status
            <select className="mt-1 w-full rounded-md border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}>
              <option value="active">active</option>
              <option value="archived">archived</option>
              <option value="deprecated">deprecated</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1.5" onClick={onClose}>Скасувати</button>
          <button className="rounded border px-3 py-1.5" onClick={()=> onSave({ code, label, synonyms: synonyms.split(/[|,]/g).map(s=>s.trim().toLowerCase()).filter(Boolean), status, createdAt: value.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() })}>Зберегти</button>
        </div>
      </div>
    </div>
  )
}

function EditRegionModal({ value, onClose, onSave }: { value: Region; onClose: ()=>void; onSave: (r: Region)=>void }) {
  const [code, setCode] = useState(value.code)
  const [label, setLabel] = useState(value.label)
  const [status, setStatus] = useState<Region['status']>(value.status)
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="w-[560px] rounded-md border bg-white p-4">
        <div className="mb-2 text-lg font-semibold">Регіон</div>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm">Code
            <input className="mt-1 w-full rounded-md border px-2 py-1" value={code} onChange={e=> setCode(e.target.value)} />
            <div className="text-xs text-[var(--secondary)]">lower-kebab, 2..32</div>
          </label>
          <label className="text-sm">Label
            <input className="mt-1 w-full rounded-md border px-2 py-1" value={label} onChange={e=> setLabel(e.target.value)} />
          </label>
          <label className="text-sm">Status
            <select className="mt-1 w-full rounded-md border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value as any)}>
              <option value="active">active</option>
              <option value="archived">archived</option>
              <option value="deprecated">deprecated</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1.5" onClick={onClose}>Скасувати</button>
          <button className="rounded border px-3 py-1.5" onClick={()=> onSave({ code, label, status, createdAt: value.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() })}>Зберегти</button>
        </div>
      </div>
    </div>
  )
}

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
