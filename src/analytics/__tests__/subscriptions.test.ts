import { describe, it, expect, beforeEach } from 'vitest'
import { listSubscriptions, upsertSubscription, removeSubscription, getUserPrefs, setUserPrefs, validateEmail, validateUrl } from '../subscriptions'

beforeEach(()=> { localStorage.clear() })

describe('subscriptions model', () => {
  it('CRUD and list', () => {
    expect(listSubscriptions().length).toBe(0)
    const s = upsertSubscription({ ruleId:'r1', channels:['email'], email:'a@b.com', enabled:true, digest:'none' })
    expect(listSubscriptions().length).toBe(1)
    const s2 = upsertSubscription({ ...s, webhookUrl:'https://example.com' })
    expect(s2.webhookUrl).toBe('https://example.com')
    removeSubscription(s2.id)
    expect(listSubscriptions().length).toBe(0)
  })
  it('prefs update', () => {
    expect(getUserPrefs().defaultEmail).toBeUndefined()
    const p = setUserPrefs({ defaultEmail:'x@y.z' })
    expect(p.defaultEmail).toBe('x@y.z')
    expect(getUserPrefs().defaultEmail).toBe('x@y.z')
  })
  it('validators', () => {
    expect(validateEmail('a@b.com')).toBe(true)
    expect(validateEmail('bad')).toBe(false)
    expect(validateUrl('https://example.com')).toBe(true)
    expect(validateUrl('ftp://x')).toBe(false)
  })
})

