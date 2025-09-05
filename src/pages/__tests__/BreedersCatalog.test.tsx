import { render, screen, fireEvent } from '@testing-library/react'
import BreedersCatalog from '../BreedersCatalog'

describe('BreedersCatalog', () => {
  it('filters, searches and sorts', () => {
    render(<BreedersCatalog />)
    // seeded demo should have at least one row
    expect(screen.getByText('Каталог маткарів')).toBeInTheDocument()
    const search = screen.getByLabelText('search') as HTMLInputElement
    fireEvent.change(search, { target: { value: 'Breeder One' } })
    expect(screen.getByText('Breeder One')).toBeInTheDocument()
    // change sort
    const sort = screen.getByLabelText('sort') as HTMLSelectElement
    fireEvent.change(sort, { target: { value: 'sales' } })
    expect(sort.value).toBe('sales')
  })
})

