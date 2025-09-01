import { describe, it, expect } from 'vitest'
import { listReports, saveReport, updateReport, deleteReport } from '../reports'
import { defaultFilters } from '../filters'

describe('reports presets', () => {
  it('CRUD in localStorage', () => {
    localStorage.clear()
    const pr = saveReport({ name: 'R1', filters: defaultFilters(), segments: [], charts: ['trend'] })
    expect(listReports().length).toBe(1)
    const up = updateReport(pr.id, { name: 'R1-upd' })
    expect(up?.name).toBe('R1-upd')
    deleteReport(pr.id)
    expect(listReports().length).toBe(0)
  })
})

