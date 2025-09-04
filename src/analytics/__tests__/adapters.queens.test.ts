import { describe, it, expect, beforeEach } from 'vitest'
import { saveQueens } from '../../state/queens.store'
import { fetchBreederMeasures, fetchRegionalMeasures } from '../adapters'

describe('adapters with new queens model', () => {
  beforeEach(() => { localStorage.clear() })

  it('maps baseTraits to measures', async () => {
    const now = new Date().toISOString()
    saveQueens([{ id:'UA.7.45.1.25.2025', breederId:'B1', unionCode:'45', breedCode:'7', breederNo:'1', queenNo:'25', year:2025, country:'UA', baseTraits: { honey:80,winter:60,temperament:60,calmOnFrames:60,swarming:60,hygienic:60,varroaResist:60,springBuildUp:60,colonyStrength:60,broodFrames:50 }, status:'listed', createdAt: now, updatedAt: now }])
    const ratings = await fetchBreederMeasures()
    expect(ratings.some(r=> r.queenId === 'UA.7.45.1.25.2025')).toBe(true)
    const regional = await fetchRegionalMeasures()
    expect(regional.length).toBeGreaterThan(0)
  })
})

