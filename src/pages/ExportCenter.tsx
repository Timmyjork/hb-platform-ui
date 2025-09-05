import { listQueens } from '../state/queens.store'
import { exportQueensCSV, exportObservationsCSV } from '../components/utils/csv'
import { exportToXLSX } from '../components/utils/xlsx'
import { listObservationsByQueen } from '../state/observations.store'

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  a.click(); URL.revokeObjectURL(url)
}

export default function ExportCenter() {
  const doExportQueensCSV = () => {
    const rows = listQueens()
    download(exportQueensCSV(rows as any), 'my-queens.csv')
  }
  const doExportQueensXLSX = () => {
    const rows = listQueens()
    exportToXLSX('my-queens.xlsx', rows as any)
  }
  const doExportObsCSV = () => {
    const q = listQueens(); const obs = q.flatMap(x => listObservationsByQueen(x.id))
    download(exportObservationsCSV(obs as any), 'my-observations.csv')
  }
  const doExportObsXLSX = () => {
    const q = listQueens(); const obs = q.flatMap(x => listObservationsByQueen(x.id))
    exportToXLSX('my-observations.xlsx', obs as any)
  }
  const doExportOrdersCSV = () => {
    download('orderId,buyerId,sellerId,status\n', 'my-orders.csv')
  }
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Центр експорту</h1>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="rounded border p-3">
          <div className="font-medium text-sm">Експорт моїх спостережень</div>
          <div className="mt-2 flex items-center gap-2">
            <button className="rounded border px-3 py-1.5 text-sm" onClick={doExportObsCSV}>Експорт CSV</button>
            <button className="rounded border px-3 py-1.5 text-sm" onClick={doExportObsXLSX}>Експорт XLSX</button>
          </div>
        </div>
        <div className="rounded border p-3">
          <div className="font-medium text-sm">Експорт моїх маток</div>
          <div className="mt-2 flex items-center gap-2">
            <button className="rounded border px-3 py-1.5 text-sm" onClick={doExportQueensCSV}>Експорт CSV</button>
            <button className="rounded border px-3 py-1.5 text-sm" onClick={doExportQueensXLSX}>Експорт XLSX</button>
          </div>
        </div>
        <div className="rounded border p-3">
          <div className="font-medium text-sm">Експорт моїх замовлень</div>
          <div className="mt-2 flex items-center gap-2">
            <button className="rounded border px-3 py-1.5 text-sm" onClick={doExportOrdersCSV}>Експорт CSV</button>
          </div>
        </div>
      </div>
    </div>
  )
}
