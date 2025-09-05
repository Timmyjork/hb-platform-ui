import { exportBreedersCSV, importBreedersCSV } from '../../utils/csv'
import { listBreedersPublic } from '../../../state/breeders.public.store'

describe('CSV breeders import/export', () => {
  beforeEach(() => localStorage.clear())
  it('exports then imports minimal fields with matching', () => {
    // seed minimal
    const now = new Date().toISOString()
    localStorage.setItem('hb.breeders.public', JSON.stringify([
      { breederId:'B10', slug:'ua-46-test', displayName:'Lviv Test', regionCode:'UA-46', breedCodes:['buckfast'], badges:['verified'], stats:{ sales:1, queens:1, years:1, rating:4.5 }, createdAt: now, updatedAt: now },
    ]))
    const csv = exportBreedersCSV()
    expect(csv).toContain('breederId')
    expect(csv).toContain('ua-46-test')
    // import with synonyms and short region
    const text = 'breederId,slug,displayName,region,breeds,badges\nB11,ua-32-new,Kyiv New,32,Карніка|carnica,verified\n'
    const res = importBreedersCSV(text)
    expect(res.added).toBe(1)
    const rows = listBreedersPublic()
    expect(rows.find(r => r.slug === 'ua-32-new')?.regionCode).toBe('UA-32')
    expect(rows.find(r => r.slug === 'ua-32-new')?.breedCodes.length).toBeGreaterThan(0)
  })
})

