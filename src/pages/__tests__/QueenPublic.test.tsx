import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QueenPublic from '../QueenPublic'

describe('QueenPublic page', () => {
  it('renders passport, generates QR, copies link', async () => {
    Object.defineProperty(window, 'location', { value: { pathname: '/q/UA.7.45.1.25.2025', href: 'https://example.com/q/UA.7.45.1.25.2025' } as any, writable: true })
    // stub clipboard
    ;(navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    render(<QueenPublic />)
    // passport fields
    expect(screen.getByText('Паспорт UA.7.45.1.25.2025')).toBeInTheDocument()
    expect(screen.getByText('Порода: 7')).toBeInTheDocument()
    // share button copies
    fireEvent.click(screen.getByRole('button', { name: 'Поділитися' }))
    await waitFor(() => expect((navigator as any).clipboard.writeText).toHaveBeenCalled())
    // qr download link is present (dataURL)
    await waitFor(() => expect(screen.getByRole('link', { name: 'Завантажити QR' })).toBeInTheDocument())
    const href = (screen.getByRole('link', { name: 'Завантажити QR' }) as HTMLAnchorElement).getAttribute('href')
    expect(href).toMatch(/^data:image\/png;base64,/)
  })
})

