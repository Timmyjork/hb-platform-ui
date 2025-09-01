import { describe, it, expect } from 'vitest'
import { listDashboards, saveDashboard, getDashboard, deleteDashboard, makeShareURL } from '../dashboards'

describe('dashboards storage', () => {
  it('CRUD and share URL', () => {
    localStorage.clear()
    const all = listDashboards()
    expect(all.length).toBeGreaterThan(0)
    const d = { ...all[0], name: 'Updated' }
    saveDashboard(d)
    expect(getDashboard(d.id)?.name).toBe('Updated')
    const url = makeShareURL(d.id)
    expect(url).toContain('dash=')
    deleteDashboard(d.id)
    expect(getDashboard(d.id)).toBeUndefined()
  })
})

