import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import HBAppShell from '../../HBAppShell'

describe('Public nav (guest)', () => {
  it('shows Вибір маток and Рейтинги, ratings renders', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'guest' } })
    const nav = screen.getByTestId('nav')
    within(nav).getByRole('button', { name: 'Вибір маток' })
    const ratingsBtn = within(nav).getByRole('button', { name: 'Рейтинги' })
    fireEvent.click(ratingsBtn)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Експорт CSV' })).toBeInTheDocument())
  })
})
