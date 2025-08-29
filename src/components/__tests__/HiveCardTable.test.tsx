import { render, screen } from '@testing-library/react'
import HiveCardTable from '../HiveCardTable'

describe('HiveCardTable', () => {
  it('renders heading', () => {
    render(<HiveCardTable />)
    expect(screen.getByRole('heading', { name: 'Вуликова карта' })).toBeInTheDocument()
  })
})

