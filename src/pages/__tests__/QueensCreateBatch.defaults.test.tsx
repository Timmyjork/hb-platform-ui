import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import QueensCreateBatch from '../QueensCreateBatch'

describe('QueensCreateBatch defaults', () => {
  beforeEach(() => { localStorage.clear() })

  it('prefills country/breederNo/breed/region and enforces year for sale', () => {
    render(<QueensCreateBatch />)
    expect((screen.getByLabelText('country') as HTMLInputElement).value).toBe('UA')
    // breed and region selects exist
    expect(screen.getByLabelText('breed')).toBeInTheDocument()
    expect(screen.getByLabelText('region')).toBeInTheDocument()
    const year = Number((screen.getByLabelText('year') as HTMLInputElement).value)
    expect(year).toBe(new Date().getFullYear())
  })
})

