import { useEffect, useMemo, useState } from 'react'
import { getProfile, saveProfile, type BreederProfile, getBreederDefaults } from '../state/profile.store'
import BREEDS, { matchBreed } from '../constants/breeds'
import UA_REGIONS from '../constants/regions.ua'

export default function ProfilePage() {
  const [p, setP] = useState<BreederProfile>(() => getProfile('currentUser'))
  useEffect(()=>{ setP(getProfile('currentUser')) }, [])

  const breeds = useMemo(()=> BREEDS, [])
  const regions = useMemo(()=> UA_REGIONS, [])

  function save() {
    const next: BreederProfile = {
      ...p,
      regionCode: p.regionCode || getBreederDefaults().regionCode,
      defaultBreedCode: matchBreed(p.defaultBreedCode || '') || getBreederDefaults().defaultBreedCode,
    }
    saveProfile(next)
    setP(next)
    alert('Збережено')
  }

  return (
    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-4">
      <h1 className="text-xl font-semibold mb-3">Профіль</h1>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm">Країна
          <input className="mt-1 w-full rounded-md border px-2 py-1" value={p.country} onChange={e=> setP({...p, country: e.target.value})} />
        </label>
        <label className="text-sm">Регіон (спілка)
          <select className="mt-1 w-full rounded-md border px-2 py-1" value={p.regionCode || ''} onChange={e=> setP({...p, regionCode: e.target.value})}>
            {regions.map(r => <option key={r.code} value={r.code}>{r.short}</option>)}
          </select>
        </label>
        <label className="text-sm">Базова порода
          <select className="mt-1 w-full rounded-md border px-2 py-1" value={p.defaultBreedCode || ''} onChange={e=> setP({...p, defaultBreedCode: e.target.value})}>
            {breeds.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <button className="rounded-md border px-3 py-1.5" onClick={save}>Зберегти</button>
      </div>
    </div>
  )
}

