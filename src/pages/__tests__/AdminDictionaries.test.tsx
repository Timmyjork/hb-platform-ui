import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminDictionaries from '../AdminDictionaries'

describe('AdminDictionaries', () => {
  beforeEach(() => { localStorage.clear() })
  it('renders tabs and can archive and deprecate a breed', () => {
    render(<AdminDictionaries />)
    // actions on first row
    fireEvent.click(screen.getAllByText('Archive')[0])
    fireEvent.click(screen.getAllByText('Deprecate')[0])
    // some row shows deprecated
    expect(screen.getAllByText('deprecated').length).toBeGreaterThan(0)
  })
  it('import CSV merge works', () => {
    render(<AdminDictionaries />)
    fireEvent.change(screen.getByPlaceholderText('code,label,status,synonyms'), { target: { value: 'code,label,status\nimp,Import,active' } })
    fireEvent.click(screen.getByText('Імпорт'))
    expect(screen.getByText('imp')).toBeInTheDocument()
  })
  it('regions tab renders and blocks delete when usage>0 (synthetic)', () => {
    // seed usage before render
    const listings = [{ listingId:'LX', sellerId:'S', stock:1, price:1, breedCode:'1', regionCode:'UA-32', year:2025, active:true, createdAt: new Date().toISOString() }]
    localStorage.setItem('hb.shop.listings', JSON.stringify(listings))
    render(<AdminDictionaries />)
    fireEvent.click(screen.getByText('Регіони'))
    const row = screen.getByText('Київська область').closest('tr') as HTMLElement
    const del = row.querySelector('button:nth-of-type(4)') as HTMLButtonElement
    expect(del.disabled).toBe(true)
  })
})
