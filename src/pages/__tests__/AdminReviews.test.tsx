import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import AdminReviews from '../AdminReviews'
import { addReview } from '../../state/reviews.public.store'

describe('AdminReviews page', () => {
  beforeEach(() => { localStorage.clear(); for (let i=0;i<3;i++) addReview({ breederId:'B1', author:{ name:'A' }, rating: 5, text:'t'+i }) })
  it('renders and bulk approves writes audit', async () => {
    render(<AdminReviews />)
    const table = screen.getByRole('table')
    const firstRow = within(table).getAllByRole('checkbox')[1]
    fireEvent.click(firstRow)
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    await waitFor(() => {
      const audit = localStorage.getItem('hb.audit') || '[]'
      expect(JSON.parse(audit).length).toBeGreaterThan(0)
    })
  })
})

