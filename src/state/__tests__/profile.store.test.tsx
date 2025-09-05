import { describe, it, expect, beforeEach } from 'vitest'
import { getProfile } from '../profile.store'
import { render, screen } from '@testing-library/react'
import QueensCreateBatch from '../../pages/QueensCreateBatch'

describe('profile store and auto-prefill', () => {
  beforeEach(() => { localStorage.clear() })

  it('assigns breederNo incrementally on first access', () => {
    const p1 = getProfile('u1')
    const p2 = getProfile('u2')
    expect(p2.breederNo).toBe(p1.breederNo + 1)
  })

  it('QueensCreateBatch pre-fills from profile', () => {
    render(<QueensCreateBatch />)
    expect((screen.getByLabelText('country') as HTMLInputElement).value).toBe('UA')
    const breederNo = screen.getByLabelText('breederNo') as HTMLInputElement
    expect(Number(breederNo.value)).toBeGreaterThanOrEqual(1)
    const union = screen.getByLabelText('unionCode') as HTMLInputElement
    expect(Number(union.value)).toBeGreaterThanOrEqual(1)
  })
})
