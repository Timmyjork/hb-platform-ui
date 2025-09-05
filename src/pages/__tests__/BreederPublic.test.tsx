import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BreederPublic from '../BreederPublic'
import { seedPublic } from '../../seed/public'
import { getBreederPublicBySlug } from '../../state/breeders.public.store'
import { listReviews } from '../../state/reviews.public.store'
import { listQuestions } from '../../state/qa.public.store'

describe('BreederPublic page', () => {
  beforeEach(() => { localStorage.clear(); seedPublic() })
  it('renders profile and allows adding review/question (pending)', async () => {
    const slug = getBreederPublicBySlug('ua-32-breeder-one') ? 'ua-32-breeder-one' : (getBreederPublicBySlug('ua-21-karpaty')?.slug || 'ua-21-karpaty')
    Object.defineProperty(window, 'location', { value: { pathname: `/breeder/${slug}` } as any, writable: true })
    render(<BreederPublic />)
    expect(screen.getByText(/публічний профіль|Регіон:/i)).toBeInTheDocument()
    // add review
    fireEvent.change(screen.getAllByLabelText('name')[0], { target: { value: 'Тест' } })
    fireEvent.change(screen.getByLabelText('rating'), { target: { value: '5' } })
    fireEvent.change(screen.getAllByLabelText('text')[0], { target: { value: 'Дуже добре' } })
    fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }))
    await waitFor(() => {
      const breeder = getBreederPublicBySlug(slug)!
      const pending = listReviews(breeder.breederId, { status: 'pending' })
      expect(pending.length).toBeGreaterThan(0)
    })
    // add question
    fireEvent.change(screen.getAllByLabelText('name')[1], { target: { value: 'Гість' } })
    fireEvent.change(screen.getAllByLabelText('text')[1], { target: { value: 'Коли доступні відправки?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Запитати' }))
    await waitFor(() => {
      const breeder = getBreederPublicBySlug(slug)!
      const pendingQ = listQuestions(breeder.breederId, { status: 'pending' })
      expect(pendingQ.length).toBeGreaterThan(0)
    })
  })
})
