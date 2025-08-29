import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Phenotypes from '../Phenotypes'

describe('Phenotypes page', () => {
  it('renders heading "Фенотипи"', () => {
    render(<Phenotypes />)
    expect(screen.getByRole('heading', { name: 'Фенотипи' })).toBeInTheDocument()
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

    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeEnabled()
  })
})
