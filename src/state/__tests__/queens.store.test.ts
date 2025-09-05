import { describe, it, expect, beforeEach } from 'vitest'
import { addQueensBatch, listQueens, transferOwnership, saveQueens } from '../queens.store'
import { importQueensCSV } from '../../components/utils/csv'

describe('queens.store', () => {
  beforeEach(() => { localStorage.clear() })

  it('adds a batch with unique ids', () => {
    const created = addQueensBatch({
      parts: { breedCode:'7', unionCode:'45', breederNo:'1', startQueenNo:25, year:2025, count:3 },
      baseTraits: { honey:60,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 },
      breederId: 'B1',
      status: 'listed',
    })
    expect(created).toHaveLength(3)
    const all = listQueens()
    expect(all.map(q=>q.id)).toEqual([
      'UA.7.45.1.25.2025','UA.7.45.1.26.2025','UA.7.45.1.27.2025'
    ])
  })

  it('nextAvailableQueenNo skips occupied numbers', () => {
    // Create some IDs including a gap
    addQueensBatch({ parts: { breedCode:'7', unionCode:'45', breederNo:'1', startQueenNo:2, year:2025, count:3 }, baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, breederId: 'B1' })
    // Try to create at queenNo=2 again, should shift forward to first free (5)
    const created = addQueensBatch({ parts: { breedCode:'7', unionCode:'45', breederNo:'1', startQueenNo:2, year:2025, count:1 }, baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, breederId: 'B1' })
    expect(created[0].id).toBe('UA.7.45.1.5.2025')
  })

  it('CSV import fails in strict mode on duplicates, and skips in skip mode', () => {
    const now = new Date().toISOString()
    // Seed one queen
    saveQueens([{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025, country:'UA', baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, status:'listed', createdAt: now, updatedAt: now }])
    const csv = [
      'queenId,breedCode,unionCode,breederNo,queenNo,year,breederId,honey,winter,temperament,calmOnFrames,swarming,hygienic,varroaResist,springBuildUp,colonyStrength,broodFrames',
      'UA.7.45.1.25.2025,7,45,1,25,2025,B1,50,50,50,50,50,50,50,50,50,50', // duplicate
      'UA.7.45.1.26.2025,7,45,1,26,2025,B1,60,60,60,60,60,60,60,60,60,60'
    ].join('\n')
    expect(() => importQueensCSV(csv)).toThrowError(/E_ID_DUPLICATE/)
    const res = importQueensCSV(csv, { mode: 'skip' })
    expect(res.rows).toHaveLength(1)
    expect(res.skipped).toContain('UA.7.45.1.25.2025')
  })

  it('motherId is set for all created daughters', () => {
    const mother = 'UA.7.45.1.1.2025'
    // Mark mother in store for clarity (isMother true)
    const now = new Date().toISOString()
    saveQueens([{ id: mother, breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'1', year:2025, country:'UA', baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, status:'listed', createdAt: now, updatedAt: now, isMother: true }])
    const created = addQueensBatch({ count: 3, startQueenNo: 2, country:'UA', breedCode:'7', unionCode:'45', breederNo:'1', year:2025, baseTraits: { honey:60,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, breederId: 'B1', motherId: mother })
    expect(created.map(q=>q.id)).toEqual(['UA.7.45.1.2.2025','UA.7.45.1.3.2025','UA.7.45.1.4.2025'])
    expect(created.every(q=> q.motherId === mother)).toBe(true)
  })
  it('transfers ownership and updates status', () => {
    const now = new Date().toISOString()
    saveQueens([{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025, country:'UA', baseTraits: { honey:50,winter:50,temperament:50,calmOnFrames:50,swarming:50,hygienic:50,varroaResist:50,springBuildUp:50,colonyStrength:50,broodFrames:50 }, status:'listed', createdAt: now, updatedAt: now }])
    const q = transferOwnership('UA.7.45.1.25.2025', 'U42')
    expect(q?.ownerUserId).toBe('U42')
    expect(q?.status).toBe('active')
  })
})
