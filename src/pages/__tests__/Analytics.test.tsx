import { render, screen } from '@testing-library/react'
import Analytics from '../Analytics'

describe('Analytics page', () => {
  it('shows empty state when no data', () => {
    // ensure no data
    localStorage.clear()
    render(<Analytics />)
    expect(screen.getByText(/Даних поки немає/i)).toBeInTheDocument()
  })
})

