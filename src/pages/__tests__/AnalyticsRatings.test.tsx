import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalyticsRatings from '../AnalyticsRatings'

vi.mock('../../analytics/adapters', () => ({
  fetchBreederMeasures: async () => {
    const now = new Date().toISOString()
    const rows = [] as any[]
    for (let i=0;i<10;i++) rows.push({ breederId: 'A', beekeeperId: `K${i}`, date: now, si: 80, bv: 1 })
    for (let i=0;i<12;i++) rows.push({ breederId: 'B', beekeeperId: `K${i}`, date: now, si: 70 + (i%3), bv: 0.5 })
    return rows
  }
}))

describe('AnalyticsRatings page', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('renders table with rows', async () => {
    render(<AnalyticsRatings />)
    await waitFor(() => {
      expect(screen.getByText('Маткар')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    })
  })

  it('changing params reorders list', async () => {
    render(<AnalyticsRatings />)
    await waitFor(() => screen.getByText('A'))
    const before = screen.getAllByRole('row')[1].textContent || ''
    const slider = screen.getAllByRole('slider')[0] as HTMLInputElement
    fireEvent.change(slider, { target: { value: '1' } }) // increase bvWeight
    await waitFor(() => {
      const after = screen.getAllByRole('row')[1].textContent || ''
      expect(after).not.toBe(before)
    })
  })

  it('export CSV triggers blob', async () => {
    render(<AnalyticsRatings />)
    await waitFor(() => screen.getByText('A'))
    if (typeof URL.createObjectURL !== 'function') {
      // @ts-expect-error polyfill
      URL.createObjectURL = (()=> 'blob://x') as any
    }
    const createURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://x')
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const append = vi.spyOn(document.body, 'appendChild')
    fireEvent.click(screen.getByText('Експорт CSV'))
    expect(createURL).toHaveBeenCalled()
    expect(append).toHaveBeenCalled()
    createURL.mockRestore(); revokeURL.mockRestore(); append.mockRestore()
  })
})

