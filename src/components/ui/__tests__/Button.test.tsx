import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
  it('renders children and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()

    await user.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables when loading', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByRole('button', { name: /loading/i })
    expect(btn).toBeDisabled()
  })
})

