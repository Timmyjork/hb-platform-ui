import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminBreeders from '../AdminBreeders'
import { saveBreederPublic } from '../../state/breeders.public.store'

describe('AdminBreeders page', () => {
  beforeEach(() => { localStorage.clear(); const now = new Date().toISOString(); saveBreederPublic({ breederId:'B1', slug:'ua-32-a', displayName:'A', regionCode:'UA-32', breedCodes:['carnica'], isPublished:false, createdAt: now, updatedAt: now }) })
  it('toggles publish and opens edit drawer', async () => {
    // mock window.open
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null as any)
    render(<AdminBreeders />)
    const toggle = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(toggle)
    await waitFor(() => expect((JSON.parse(localStorage.getItem('hb.audit')||'[]') as any[]).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await screen.findByRole('dialog', { name: 'edit-breeder' })
    fireEvent.click(screen.getByRole('button', { name: 'Перейти' }))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

