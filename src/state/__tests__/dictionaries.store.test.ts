import { describe, it, expect, beforeEach } from 'vitest'
import { listBreeds, getBreed, saveBreed, archiveBreed, deprecateBreed, deleteBreed, usageCountBreed, listRegions, saveRegion, archiveRegion, deprecateRegion, deleteRegion, usageCountRegion } from '../dictionaries.store'
import { importBreedsCSV, importRegionsCSV } from '../../components/utils/csv'

describe('dictionaries.store', () => {
  beforeEach(() => { localStorage.clear() })
  it('create/update/archive/deprecate/delete (breed)', () => {
    expect(listBreeds().length).toBeGreaterThan(0) // seeded
    saveBreed({ code:'test-breed', label:'Test', status:'active' })
    expect(getBreed('test-breed')?.label).toBe('Test')
    archiveBreed('test-breed'); expect(getBreed('test-breed')?.status).toBe('archived')
    deprecateBreed('test-breed'); expect(getBreed('test-breed')?.status).toBe('deprecated')
    expect(usageCountBreed('test-breed')).toBe(0)
    deleteBreed('test-breed'); expect(getBreed('test-breed')).toBeNull()
  })
  it('create/update/archive/deprecate/delete (region)', () => {
    saveRegion({ code:'my-region', label:'Мій регіон', status:'active' })
    expect(listRegions().some(r => r.code==='my-region')).toBe(true)
    archiveRegion('my-region'); expect(listRegions().find(r=>r.code==='my-region')?.status).toBe('archived')
    deprecateRegion('my-region'); expect(listRegions().find(r=>r.code==='my-region')?.status).toBe('deprecated')
    expect(usageCountRegion('my-region')).toBe(0)
    deleteRegion('my-region'); expect(listRegions().some(r => r.code==='my-region')).toBe(false)
  })
  it('import CSV (merge)', () => {
    const csv = 'code,label,status\nnew1,New One,active\nnew2,New Two,archived\n'
    const res = importBreedsCSV(csv, 'merge')
    expect(res.added).toBe(2)
  })
  it('import CSV (replace)', () => {
    const csv = 'code,label,status\nonly1,Only One,active\n'
    const res = importRegionsCSV(csv, 'replace')
    expect(res.added).toBe(1)
    expect(listRegions().length).toBe(1)
  })
})

