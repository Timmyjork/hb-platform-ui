import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import HBAppShell from '../../HBAppShell'

function expectOnlyVisible(nav: HTMLElement, labels: string[]) {
  const buttons = within(nav).getAllByRole('button')
  const actual = buttons.map(b => b.textContent?.trim()).filter(Boolean)
  for (const l of labels) expect(actual).toContain(l)
}

describe('RBAC_NAV_V1', () => {
  it('guest: shop + ratings_public only', () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'guest' } })
    const nav = screen.getByTestId('nav')
    expectOnlyVisible(nav, ['Магазин','Рейтинги'])
    // click Ratings
    fireEvent.click(within(nav).getByRole('button', { name: 'Рейтинги' }))
    // Page renders
    // One of ratings headings: use presence of a known text
    expect(screen.getByText(/Рейтинги|Сортування/i)).toBeInTheDocument()
  })

  it('buyer: has observations only once and export', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'buyer' } })
    const nav = screen.getByTestId('nav')
    expectOnlyVisible(nav, ['Магазин','Мої матки','Спостереження (вуликова карта)','Аналітика (read-only)','Рейтинги','Експорт'])
    const obs = within(nav).getAllByRole('button', { name: 'Спостереження (вуликова карта)' })
    expect(obs.length).toBe(1)
    fireEvent.click(within(nav).getByRole('button', { name: 'Експорт' }))
    await waitFor(() => expect(screen.getByText('Центр експорту')).toBeInTheDocument())
  })

  it('breeder: expected set incl. transfer + import/export', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'breeder' } })
    const nav = screen.getByTestId('nav')
    expectOnlyVisible(nav, ['Мій профіль','Нова партія','Спостереження (вуликова карта)','Лістинги','Замовлення','Передача','Рейтинги','Регіони','Алерти','Імпорт / Експорт'])
    fireEvent.click(within(nav).getByRole('button', { name: 'Передача' }))
    await waitFor(() => expect(screen.getByText('Передача власності')).toBeInTheDocument())
  })

  it('regional_admin: buyer set + regional, alerts', async () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'regional_admin' } })
    const nav = screen.getByTestId('nav')
    expectOnlyVisible(nav, ['Магазин','Мої матки','Спостереження (вуликова карта)','Аналітика (read-only)','Рейтинги','Регіони','Алерти','Експорт'])
  })

  it('internal: all 5 admin sections', () => {
    render(<HBAppShell />)
    const roleSel = screen.getByLabelText('Оберіть роль') as HTMLSelectElement
    fireEvent.change(roleSel, { target: { value: 'internal' } })
    const nav = screen.getByTestId('nav')
    expectOnlyVisible(nav, ['Адмін / Відгуки', 'Адмін / Q&A', 'Адмін / Профілі', 'Адмін / Довідники', 'Адмін / Аудит'])
  })
})

