import { render, screen, fireEvent } from '@testing-library/react'
import AdminReviews from '../AdminReviews'

describe('Pagination query sync', () => {
  beforeEach(() => localStorage.clear())
  it('updates window.location.search and range', () => {
    const now = new Date().toISOString()
    localStorage.setItem('hb.reviews.public', JSON.stringify(Array.from({ length: 35 }).map((_,i)=> ({ id:`R${i}`, breederId:'B1', author:{ name:'x' }, rating:5, text:`t${i}`, createdAt: now, status:'pending' }))))
    render(<AdminReviews />)
    const next = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(next)
        expect(screen.getByText(/Показано 21–35 з 35/)).toBeInTheDocument()
  })
})

