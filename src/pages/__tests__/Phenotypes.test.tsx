import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Phenotypes from '../Phenotypes'
import { toCSV } from '../../components/utils/csv'

describe('Phenotypes page', () => {
  it('renders heading "Вуликова карта (спостереження)"', () => {
    render(<Phenotypes />)
    expect(screen.getByRole('heading', { name: 'Вуликова карта (спостереження)' })).toBeInTheDocument()
  })

  it('enables save when form is valid', async () => {
    const user = userEvent.setup()
    render(<Phenotypes />)

    // Fill minimal required fields
    await user.selectOptions(screen.getByLabelText('Колір'), 'light')
    await user.type(screen.getByLabelText('Довжина тіла (мм)'), '5.5')
    await user.selectOptions(screen.getByLabelText('Агресивність (1–5)'), '3')
    await user.type(screen.getByLabelText('Гігієнічність (%)'), '80')
    await user.type(screen.getByLabelText('Яєць на добу'), '1200')

    expect(screen.getByRole('button', { name: 'Зберегти запис' })).toBeEnabled()
  })

  it('shows saved tab empty state', async () => {
    const user = userEvent.setup()
    render(<Phenotypes />)
    await user.click(screen.getByRole('button', { name: 'Збережені записи' }))
    expect(screen.getByText('Немає збережених записів')).toBeInTheDocument()
  })

  it('toCSV flattens nested objects', () => {
    const csv = toCSV([{ a: 1, b: { c: 2 } }])
    expect(csv.split('\n')[0]).toBe('a,b.c')
    expect(csv.split('\n')[1]).toBe('1,2')
  })
})
