import { render, screen, within, fireEvent } from '@testing-library/react'
import AdminDictionaries from '../AdminDictionaries'

describe('Drag sort (dictionaries)', () => {
  beforeEach(() => localStorage.clear())
  it('reorders breeds and saves order', () => {
    render(<AdminDictionaries />)
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')
    expect(rows.length).toBeGreaterThan(2)
    const firstCode = within(rows[1]).getAllByRole('cell')[1].textContent as string
    const secondCode = within(rows[2]).getAllByRole('cell')[1].textContent as string
    const dstRow = rows[2]
    const dt: any = { getData: (t: string) => (t==='text/plain' ? firstCode : '') }
    fireEvent.drop(dstRow, { dataTransfer: dt })
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти порядок' }))
    const breedsRaw = localStorage.getItem('hb.dict.breeds') || '[]'
    const breeds = JSON.parse(breedsRaw) as Array<{ code:string; order?:number }>
    const iFirst = breeds.find(b => b.code===firstCode)?.order || 0
    const iSecond = breeds.find(b => b.code===secondCode)?.order || 0
    expect(iSecond).toBeLessThan(iFirst)
  })
})
