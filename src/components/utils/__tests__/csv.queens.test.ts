import { describe, it, expect, beforeEach } from 'vitest'
import { exportQueensCSV, importQueensCSV } from '../csv'
import { saveQueens, listQueens } from '../../../state/queens.store'

describe('CSV queens import/export', () => {
  beforeEach(() => { localStorage.clear() })

  it('exports and imports queens CSV (positive case)', () => {
    const now = new Date().toISOString()
    const seed = [{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025 as const, country:'UA' as const, baseTraits: { honey:80,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, status:'listed' as const, createdAt: now, updatedAt: now }]
    saveQueens(seed as any)
    const csv = exportQueensCSV(listQueens())
    const { rows } = importQueensCSV(csv, { mode: 'skip' })
    expect(rows.length).toBe(0) // all duplicates, nothing new to import
  })
})

