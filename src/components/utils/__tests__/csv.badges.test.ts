import { exportBadgesCSV, importBadgesCSV } from '../../utils/csv'

describe('CSV badges', () => {
  beforeEach(() => localStorage.clear())
  it('exports and imports', () => {
    const csv = exportBadgesCSV()
    expect(csv).toContain('code')
    const res = importBadgesCSV('code,label,isActive\ncustom,Custom,true\n', 'merge')
    expect(res.ok).toBe(true)
    const out = exportBadgesCSV()
    expect(out).toContain('custom')
  })
})

