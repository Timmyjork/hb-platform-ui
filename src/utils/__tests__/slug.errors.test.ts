import { validateSlug, formatSlugError } from '../slug'
import { validateSlugUnique, saveBreederPublic } from '../../state/breeders.public.store'

describe('slug utils', () => {
  beforeEach(() => localStorage.clear())
  it('validates format', () => {
    expect(validateSlug('a')).toBe('E_SLUG_FORMAT')
    expect(validateSlug('aa')).toBe('E_SLUG_FORMAT')
    expect(validateSlug('-bad')).toBe('E_SLUG_FORMAT')
    expect(validateSlug('good-slug')).toBe(true)
  })
  it('formats E_SLUG_TAKEN nicely', () => {
    const now = new Date().toISOString()
    saveBreederPublic({ breederId:'B1', slug:'ua-32-a', displayName:'A', regionCode:'UA-32', breedCodes:['carnica'], createdAt: now, updatedAt: now })
    let err: any
    try { validateSlugUnique('ua-32-a') } catch (e) { err = e }
    expect(formatSlugError(err)).toMatch(/вже зайнятий|спробуйте інший/i)
  })
})

