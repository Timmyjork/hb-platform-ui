import { render, screen } from '@testing-library/react'
import Phenotypes from '../Phenotypes'

describe('Phenotypes page', () => {
  it('renders heading "Фенотипи"', () => {
    render(<Phenotypes />)
    expect(screen.getByRole('heading', { name: 'Фенотипи' })).toBeInTheDocument()
  })
})

