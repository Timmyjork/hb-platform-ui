import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AnalyticsRegional from '../AnalyticsRegional'

vi.mock('../../analytics/adapters', () => ({
  fetchRegionalMeasures: async () => {
    const now = new Date().toISOString()
    const rows:any[] = []
    for (let i=0;i<6;i++) rows.push({ regionId: 'R1', beekeeperId: `K${i}`, date: now, si: 80, bv: 1 })
    for (let i=0;i<6;i++) rows.push({ regionId: 'R2', beekeeperId: `K${i}`, date: now, si: 70+(i%2), bv: 0.5 })
    return rows
  }
}))

describe('AnalyticsRegional page', () => {
  it('renders table with regions', async () => {
    render(<AnalyticsRegional />)
    await waitFor(()=> {
      expect(screen.getByText('Регіон')).toBeInTheDocument()
      expect(screen.getByText('R1')).toBeInTheDocument()
    })
  })

  it('changing benchmark updates deltas', async () => {
    render(<AnalyticsRegional />)
    await waitFor(()=> screen.getByText('R1'))
    const sel = screen.getByDisplayValue('Вся країна') as HTMLSelectElement
    fireEvent.change(sel, { target: { value: 'median' } })
    await waitFor(()=> {
      expect(screen.getByText('Δ vs Bench')).toBeInTheDocument()
    })
  })

  it('export CSV triggers blob', async () => {
    render(<AnalyticsRegional />)
    await waitFor(()=> screen.getByText('R1'))
    if (typeof URL.createObjectURL !== 'function') {
      // @ts-expect-error polyfill
      URL.createObjectURL = (()=> 'blob://x') as any
    }
    const createURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://x')
    const append = vi.spyOn(document.body, 'appendChild')
    fireEvent.click(screen.getByText('Експорт CSV'))
    expect(createURL).toHaveBeenCalled()
    expect(append).toHaveBeenCalled()
    createURL.mockRestore(); append.mockRestore()
  })
})

