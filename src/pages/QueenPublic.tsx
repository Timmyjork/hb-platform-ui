import { useMemo, useState } from 'react'
import { parseQueenId } from '../utils/queenId'
import { SeoHead } from '../seo/meta'
import { toDataURL } from '../utils/qr'

export default function QueenPublic() {
  const queenId = decodeURIComponent(window.location.pathname.split('/').pop() || '')
  const parts = useMemo(()=> parseQueenId(queenId), [queenId])
  const [qr, setQr] = useState<string>('')
  useMemo(()=> { void toDataURL(window.location.href).then(setQr) }, [])
  if (!parts) return <div className="p-4">Неправильний ID</div>
  return (
    <div className="p-4 space-y-3">
      <SeoHead title={`Паспорт ${queenId}`} url={`https://example.com/q/${encodeURIComponent(queenId)}`} jsonLd={{ '@context':'https://schema.org', '@type':'Product', name: queenId }} />
      <h1 className="text-xl font-semibold">Паспорт {queenId}</h1>
      <div className="rounded border p-3 text-sm">
        <div>Країна: {parts.country}</div>
        <div>Порода: {parts.breedCode}</div>
        <div>Спілка (регіон): {parts.unionCode}</div>
        <div>№ маткаря: {parts.breederNo}</div>
        <div>№ матки: {parts.queenNo}</div>
        <div>Рік: {parts.year}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded border px-3 py-1.5" onClick={()=> { navigator.clipboard?.writeText(window.location.href) }}>Поділитися</button>
        {qr && <a className="rounded border px-3 py-1.5" href={qr} download={`qr-${parts.queenNo}.png`}>Завантажити QR</a>}
      </div>
    </div>
  )
}
