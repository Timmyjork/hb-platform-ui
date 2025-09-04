import { useMemo, useState } from 'react'
import { getBreeder, saveBreeder, upsertCertificates, setRatingsPublic } from '../state/breeders.store'
import type { Certificate } from '../types/breederProfile'
import BREEDS from '../constants/breeds'
import UA_REGIONS from '../constants/regions.ua'

export default function BreederDashboard({ breederId='B1' }: { breederId?: string }) {
  const [seed, setSeed] = useState(0)
  const p = useMemo(()=> getBreeder(breederId), [breederId, seed])
  const [form, setForm] = useState(()=> p || { breederId, displayName:'', regionCode:'UA-32', breedDefault:'carnica', portfolio:{ featuredQueenIds:[] }, certificates:[], ratingsPublic:true, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() })
  if (!p) return <div className="p-4">Профіль не знайдено</div>
  function save() { saveBreeder(form as any); setSeed(x=>x+1) }
  function addCert() { const c: Certificate = { id: `C_${Math.random().toString(36).slice(2,8)}`, title:'New', issuer:'', dateISO:new Date().toISOString() }; upsertCertificates(p!.breederId, [...(p!.certificates||[]), c]); setSeed(x=>x+1) }
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Мій профіль</h1>
      <section className="rounded-xl border p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">Імʼя
            <input className="mt-1 w-full rounded border px-2 py-1" value={form.displayName} onChange={e=> setForm({ ...form, displayName: e.target.value })} />
          </label>
          <label className="text-sm">Регіон
            <select className="mt-1 w-full rounded border px-2 py-1" value={form.regionCode} onChange={e=> setForm({ ...form, regionCode: e.target.value })}>
              {UA_REGIONS.map(r=> <option key={r.code} value={r.code}>{r.short}</option>)}
            </select>
          </label>
          <label className="text-sm">Порода
            <select className="mt-1 w-full rounded border px-2 py-1" value={form.breedDefault} onChange={e=> setForm({ ...form, breedDefault: e.target.value })}>
              {BREEDS.map(b=> <option key={b.code} value={b.code}>{b.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Bio
            <input className="mt-1 w-full rounded border px-2 py-1" value={form.bio||''} onChange={e=> setForm({ ...form, bio: e.target.value })} />
          </label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.ratingsPublic} onChange={e=> { setForm({ ...form, ratingsPublic: e.target.checked }); setRatingsPublic(p.breederId, e.target.checked) }} /> Показувати рейтинг публічно</label>
        </div>
        <button className="mt-3 rounded-md border px-3 py-1.5" onClick={save}>Зберегти</button>
      </section>
      <section className="rounded-xl border p-4">
        <div className="text-sm font-semibold mb-2">Сертифікати</div>
        <button className="mb-2 rounded-md border px-2 py-1" onClick={addCert}>Додати</button>
        <ul className="space-y-1 text-sm">{(getBreeder(breederId)?.certificates||[]).map(c=> (<li key={c.id}>{c.title} — {c.issuer}</li>))}</ul>
      </section>
    </div>
  )
}
