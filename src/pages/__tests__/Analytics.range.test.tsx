import { render, screen, fireEvent } from '@testing-library/react'
import Analytics from '../Analytics'

function setLocalData() {
  const phenos = [
    { id: 'p1', queenId: 'Q1', date: '2025-01-10', behavior: { hygienicPct: 80 }, productivity: { eggsPerDay: 1000 } },
    { id: 'p2', queenId: 'Q2', date: '2025-03-10', behavior: { hygienicPct: 90 }, productivity: { eggsPerDay: 1500 } },
  ]
  localStorage.setItem('phenotypes:data', JSON.stringify(phenos))
  const hives = [
    { id: 'h1', colonyId: 'C1', date: '2025-01-05', framesOccupied: 8, broodOpen: 2, broodCapped: 2 },
    { id: 'h2', colonyId: 'C2', date: '2025-03-05', framesOccupied: 10, broodOpen: 3, broodCapped: 1 },
  ]
  localStorage.setItem('hivecards:data', JSON.stringify(hives))
}

describe('Analytics range filtering', () => {
  it('updates when date range changes', () => {
    localStorage.clear()
    setLocalData()
    render(<Analytics />)

    // Switch to phenotypes tab
    fireEvent.click(screen.getByRole('button', { name: 'Фенотипи' }))

    // Set range to only January 2025
    const from = screen.getByLabelText('Від місяця') as HTMLInputElement
    const to = screen.getByLabelText('До місяця') as HTMLInputElement
    fireEvent.change(from, { target: { value: '2025-01' } })
    fireEvent.change(to, { target: { value: '2025-01' } })

    // Expect no empty state (there is Jan data), and KPI cards present
    expect(screen.queryByText(/Немає записів за обраний період/)).toBeNull()

    // Set range to month with no data
    fireEvent.change(from, { target: { value: '2024-01' } })
    fireEvent.change(to, { target: { value: '2024-01' } })
    expect(screen.getByText(/Немає записів за обраний період/)).toBeInTheDocument()
  })
})

