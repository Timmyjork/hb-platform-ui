import { useMemo, useState } from 'react'
import { listBreedersPublic, saveBreederPublic, setPublished, validateSlugUnique } from '../state/breeders.public.store'
import UA_REGIONS from '../constants/regions.ua'
import BREEDS from '../constants/breeds'
import { listBadges } from '../state/dictionaries.store'
import { audit } from '../state/admin.audit.store'
import { validateSlug, formatSlugError } from '../utils/slug'
import { useToast } from '../components/ui/Toast'

export default function AdminBreeders() {
  const [seed, setSeed] = useState(0)
  const rows = useMemo(()=> listBreedersPublic(), [seed])
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<ReturnType<typeof listBreedersPublic>[number] | null>(null)
  const filtered = useMemo(()=> { const s = q.trim().toLowerCase(); if (!s) return rows; return rows.filter(b => b.displayName.toLowerCase().includes(s) || (b.bio||'').toLowerCase().includes(s)) }, [rows, q])
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold mb-3">Адмін / Публічні профілі</h1>
      <div className="flex items-center gap-2 mb-2"><input className="rounded border px-2 py-1 text-sm" placeholder="Пошук" value={q} onChange={e=> setQ(e.target.value)} /><button className="rounded border px-2 py-1 text-sm" onClick={()=> setEditing({ breederId:'', slug:'', displayName:'', regionCode:'UA-32', breedCodes:[], isPublished:false, createdAt:'', updatedAt:'' })}>Додати</button></div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-3 py-2">Імʼя</th><th className="px-3 py-2">Slug</th><th className="px-3 py-2">Region</th><th className="px-3 py-2">Breeds</th><th className="px-3 py-2">Badges</th><th className="px-3 py-2">Published?</th><th className="px-3 py-2 text-right" /></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.slug} className="border-t border-[var(--divider)]">
                <td className="px-3 py-2">{b.displayName}</td>
                <td className="px-3 py-2 font-mono">{b.slug}</td>
                <td className="px-3 py-2">{UA_REGIONS.find(r=> r.code===b.regionCode)?.short || b.regionCode}</td>
                <td className="px-3 py-2">{b.breedCodes.join(',')}</td>
                <td className="px-3 py-2">{(b.badges||[]).join(',')}</td>
                <td className="px-3 py-2"><input type="checkbox" checked={b.isPublished!==false} onChange={e=> { setPublished(b.breederId, e.currentTarget.checked); audit('breeder.publish', { breederId: b.breederId, published: e.currentTarget.checked }); setSeed(x=>x+1) }} /></td>
                <td className="px-3 py-2 text-right"><div className="inline-flex gap-2"><button className="rounded border px-2 py-1" onClick={()=> setEditing(b)}>Edit</button><button className="rounded border px-2 py-1" onClick={()=> window.open(`/breeder/${b.slug}`, '_blank')}>Перейти</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <EditDrawer initial={editing} onClose={()=> setEditing(null)} onSaved={()=> { setEditing(null); setSeed(x=>x+1) }} />}
    </div>
  )
}

function EditDrawer({ initial, onClose, onSaved }: { initial: ReturnType<typeof listBreedersPublic>[number]; onClose: ()=>void; onSaved: ()=>void }) {
  const [b, setB] = useState({ ...initial })
  const badges = useMemo(()=> listBadges(), [])
  const { push } = useToast()
  const onSave = () => {
    try {
      const ok = validateSlug(b.slug)
      if (ok !== true) throw new Error('E_SLUG_FORMAT')
      validateSlugUnique(b.slug, b.breederId)
      saveBreederPublic({ ...b, updatedAt: new Date().toISOString(), createdAt: b.createdAt || new Date().toISOString() })
      audit('breeder.update', { breederId: b.breederId })
      onSaved()
      push({ title: 'Збережено', tone: 'success' })
    } catch (e) {
      push({ title: formatSlugError(e), tone: 'danger' })
    }
  }
  const toggleBadge = (code: string) => { const set = new Set(b.badges||[]); if (set.has(code as any)) set.delete(code as any); else set.add(code as any); setB({ ...b, badges: Array.from(set) as any }) }
  const toggleBreed = (code: string) => { const set = new Set(b.breedCodes||[]); if (set.has(code)) set.delete(code); else set.add(code); setB({ ...b, breedCodes: Array.from(set) }) }
  return (
    <div role="dialog" aria-label="edit-breeder" className="fixed inset-0 bg-black/30 flex items-center justify-end">
      <div className="w-[520px] h-full overflow-auto rounded-l-md border bg-white p-3 space-y-2">
        <div className="text-sm font-semibold">Редагувати профіль</div>
        <label className="block text-sm">displayName<input className="mt-1 w-full rounded border px-2 py-1" value={b.displayName} onChange={e=> setB({ ...b, displayName: e.target.value })} /></label>
        <label className="block text-sm">slug<input className="mt-1 w-full rounded border px-2 py-1" value={b.slug} onChange={e=> setB({ ...b, slug: e.target.value })} /></label>
        <label className="block text-sm">region<select className="mt-1 w-full rounded border px-2 py-1" value={b.regionCode} onChange={e=> setB({ ...b, regionCode: e.target.value })}>{UA_REGIONS.map(r => <option key={r.code} value={r.code}>{r.short}</option>)}</select></label>
        <div className="text-sm">breeds<div className="mt-1 flex flex-wrap gap-2">{BREEDS.map(x => <label key={x.code} className="inline-flex items-center gap-1 border rounded px-2 py-1 text-xs"><input type="checkbox" checked={b.breedCodes.includes(x.code)} onChange={()=> toggleBreed(x.code)} />{x.label}</label>)}</div></div>
        <div className="text-sm">badges<div className="mt-1 flex flex-wrap gap-2">{badges.map(x => <label key={x.code} className="inline-flex items-center gap-1 border rounded px-2 py-1 text-xs"><input type="checkbox" checked={(b.badges||[]).includes(x.code as any)} onChange={()=> toggleBadge(x.code)} />{x.label}</label>)}</div></div>
        <label className="block text-sm">bio<textarea className="mt-1 w-full rounded border px-2 py-1" rows={4} value={b.bio||''} onChange={e=> setB({ ...b, bio: e.target.value })} /></label>
        <div className="flex items-center gap-2 justify-end"><button className="rounded border px-2 py-1" onClick={onClose}>Закрити</button><button className="rounded border px-2 py-1" onClick={onSave}>Зберегти</button></div>
      </div>
    </div>
  )
}
