import { saveBreederPublic, validateSlugUnique, setPublished, searchBreeders } from '../breeders.public.store'

describe('breeders.public.store', () => {
  beforeEach(() => localStorage.clear())
  it('enforces unique slug and publish toggle', () => {
    const now = new Date().toISOString()
    saveBreederPublic({ breederId:'B1', slug:'ua-32-a', displayName:'A', regionCode:'UA-32', breedCodes:['carnica'], isPublished:true, createdAt: now, updatedAt: now })
    expect(() => validateSlugUnique('ua-32-a')).toThrowError()
    setPublished('B1', false)
    const onlyPub = searchBreeders({ onlyPublished:true })
    expect(onlyPub.total).toBe(0)
  })
})
