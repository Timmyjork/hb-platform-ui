import { render, screen, fireEvent } from '@testing-library/react'
import Cart from '../Cart'
import { cart } from '../../shop/cart.store'
import { AuthProvider } from '../../auth/useAuth'

function wrap(ui: React.ReactNode) {
  return <AuthProvider>{ui}</AuthProvider>
}

describe('Cart page', () => {
  it('renders items and updates qty/delete/clear; checkout disabled for guest', () => {
    localStorage.clear()
    cart.add({ listingId: 'L1', title: 'A', priceUAH: 100, sellerId: 'B1', max: 5 }, 1)
    cart.add({ listingId: 'L2', title: 'B', priceUAH: 50, sellerId: 'B1', max: 5 }, 2)
    render(wrap(<Cart />))
    expect(screen.getByText((t)=> t.includes('Разом'))).toBeInTheDocument()
    const qty = screen.getByLabelText('qty-L2') as HTMLInputElement
    fireEvent.change(qty, { target: { value: '3' } })
    expect((screen.getByLabelText('qty-L2') as HTMLInputElement).value).toBe('3')
    fireEvent.click(screen.getAllByText('Видалити')[0])
    fireEvent.click(screen.getByText('Очистити кошик'))
    expect(screen.getByText('Порожньо')).toBeInTheDocument()
    const btn = screen.getByText('Оформити замовлення') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
