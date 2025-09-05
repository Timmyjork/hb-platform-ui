import { exportToXLSX, importFromXLSX } from '../xlsx'
import * as XLSX from 'xlsx'

describe('xlsx helpers', () => {
  it('exportToXLSX triggers download', () => {
    const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    exportToXLSX('test.xlsx', [{ a: 1 }])
    expect(urlSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()
    urlSpy.mockRestore(); revokeSpy.mockRestore(); clickSpy.mockRestore()
  })

  it('importFromXLSX reads rows (basic)', async () => {
    const ws = XLSX.utils.json_to_sheet([{ a: 1, b: 'x' }])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Data')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
    const file = new File([out], 'in.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const rows = await importFromXLSX(file)
    expect(Array.isArray(rows)).toBe(true)
  })
})
