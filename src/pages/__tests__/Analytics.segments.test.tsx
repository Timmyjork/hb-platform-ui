import { render, screen, fireEvent } from '@testing-library/react'
import Analytics from '../Analytics'

function setLocalData() {
  const phenos = [
    { id: 'p1', queenId: 'Q1', date: '2025-01-10', behavior: { hygienicPct: 80 }, productivity: { eggsPerDay: 1000 }, breed: 'A', status: 'Активна' },
    { id: 'p2', queenId: 'Q2', date: '2025-03-10', behavior: { hygienicPct: 90 }, productivity: { eggsPerDay: 1500 }, breed: 'B', status: 'Архів' },
  ]
  localStorage.setItem('phenotypes:data', JSON.stringify(phenos))
  const hives = [
    { id: 'h1', colonyId: 'C1', date: '2025-01-05', framesOccupied: 8, broodOpen: 2, broodCapped: 2, breed: 'A', status: 'Активна' },
  ]
  localStorage.setItem('hivecards:data', JSON.stringify(hives))
}

describe('Analytics segments and URL sync', () => {
  it('toggles sources and sets breeds/statuses and updates URL', () => {
    localStorage.clear()
    setLocalData()
    render(<Analytics />)

    // Uncheck hivecards source
    const hiveLabel = screen.getByLabelText('Вуликові карти') as HTMLInputElement
    fireEvent.click(hiveLabel)

    // Check breed A if present
    const breedLabel = screen.getByText('A')
    const breedCheckbox = breedLabel.closest('label')!.querySelector('input') as HTMLInputElement
    fireEvent.click(breedCheckbox)

    // URL should include sources and breeds
    expect(window.location.search).toMatch(/sources=/)
    expect(window.location.search).toMatch(/breeds=A/)
  })
})

