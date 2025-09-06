import { render, screen, fireEvent } from '@testing-library/react'
import HBAppShell from '../../HBAppShell'

describe('Shop cart integration', () => {
  it('adds item to cart and updates badge', () => {
    localStorage.clear()
    render(<HBAppShell />)
    // Ensure we are on Shop by default and button exists
    const addBtns = screen.getAllByText('До кошика')
    expect(addBtns.length).toBeGreaterThan(0)
    // before add, badge is not 1
    fireEvent.click(addBtns[0])
    // Cart badge shows 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
