import { useEffect, useRef, useState } from 'react'
import { BUILD_INFO } from '../build/info'

export default function HeaderVersionBadge() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const ts = BUILD_INFO.builtAt.replace('T',' ').replace(/\..+/, ' UTC')
  const aria = `Версія: ${BUILD_INFO.version} • ${BUILD_INFO.progress}`
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={aria}
        title={aria}
        onClick={() => setOpen(v => !v)}
        className="hidden md:inline select-none rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200"
      >
        {BUILD_INFO.version}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" className="absolute right-0 mt-2 w-60 rounded-md border border-gray-200 bg-white p-3 text-xs shadow-lg">
          <div className="mb-1 font-medium text-gray-800">Деталі збірки</div>
          <div className="space-y-1 text-gray-700">
            <div><b>Версія:</b> {BUILD_INFO.version}</div>
            <div><b>Прогрес:</b> {BUILD_INFO.progress}</div>
            <div><b>Канал:</b> {BUILD_INFO.channel}</div>
            {BUILD_INFO.commit && (
              <div>
                <b>Коміт:</b> <button className="underline" onClick={async()=>{ try { await navigator.clipboard.writeText(BUILD_INFO.commit!) } catch (_e) {} }}>{BUILD_INFO.commit}</button>
              </div>
            )}
            <div><b>Збірка:</b> {ts}</div>
          </div>
        </div>
      )}
    </div>
  )
}
