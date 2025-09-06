import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HBAppShell from './HBAppShell'

async function clickNav(label: string) {
  const btn = screen.getByRole('button', { name: label })
  fireEvent.click(btn)
  // wait a tick for state update/render to settle
  await waitFor(() => expect(btn).toBeInTheDocument())
}

describe('HBAppShell navigation', () => {
  it('breeder: Ratings/Regional/Alerts render expected UI', async () => {
    render(<HBAppShell />)
    const roleSelect = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSelect, { target: { value: 'breeder' } })
    // Ratings
    await clickNav('Рейтинги')
    await waitFor(() => expect(screen.getByText('Експорт CSV')).toBeInTheDocument())
    // Regional
    await clickNav('Регіони')
    await waitFor(() => expect(screen.getByPlaceholderText('Пошук регіону')).toBeInTheDocument())
    // Alerts
    await clickNav('Алерти')
    await waitFor(() => expect(screen.getByText('Правила')).toBeInTheDocument())
  })

  it('regional_admin: Ratings/Regional/Alerts render expected UI and no orphan analytics', async () => {
    render(<HBAppShell />)
    const roleSelect = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSelect, { target: { value: 'regional_admin' } })
    // wait for menu to re-render with regional items
    await waitFor(() => expect(screen.getByRole('button', { name: 'Регіони' })).toBeInTheDocument())
    // Ratings
    await clickNav('Рейтинги')
    await waitFor(() => expect(screen.getByText('Експорт CSV')).toBeInTheDocument())
    // Regional
    await clickNav('Регіони')
    await waitFor(() => expect(screen.getByPlaceholderText('Пошук регіону')).toBeInTheDocument())
    // Alerts
    await clickNav('Алерти')
    await waitFor(() => expect(screen.getByText('Правила')).toBeInTheDocument())
    // Ensure no top-level "Аналітика" orphan breaks active
    expect(screen.queryByRole('button', { name: 'Аналітика' })).not.toBeInTheDocument()
  })
})
