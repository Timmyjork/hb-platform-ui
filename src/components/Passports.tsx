import { queensToCSV } from './utils/csv'
import type { Queen } from '../types/queen'

export function downloadPassportsCSV(rows: Queen[]): string {
  return queensToCSV(rows)
}

export default function PassportsButton({ rows }: { rows: Queen[] }) {
  function onDownload() {
    const csv = queensToCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passports.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  return <button className="rounded-md border px-3 py-1.5" onClick={onDownload}>Завантажити паспорт</button>
}

