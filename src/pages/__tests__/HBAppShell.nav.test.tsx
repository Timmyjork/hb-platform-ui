import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import HBAppShell from '../../HBAppShell'

describe('HBAppShell navigation', () => {
  it('breeder sees key analytics pages and they render', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'breeder' } })
    const nav = screen.getByTestId('nav')
    within(nav).getByRole('button', { name: 'Спостереження (вуликова карта)' })
    within(nav).getByRole('button', { name: 'Рейтинги' })
    within(nav).getByRole('button', { name: 'Регіони' })
    fireEvent.click(within(nav).getByRole('button', { name: 'Спостереження (вуликова карта)' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Вуликова карта (спостереження)' })).toBeInTheDocument())
    const alertsBtn = within(nav).queryByRole('button', { name: 'Алерти' })
    if (alertsBtn) {
      fireEvent.click(alertsBtn)
      await waitFor(() => expect(screen.getByText('Правила')).toBeInTheDocument())
    }
  })

  it('buyer hides Alerts, keeps Observations', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'buyer' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Спостереження (вуликова карта)' })).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Алерти' })).not.toBeInTheDocument()
  })
})
