import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import ShopCatalog from '../ShopCatalog'

describe('Catalog filters', () => {
  beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/'); })
  it('updates URL query params when filters change', () => {
    render(<ShopCatalog />)
    fireEvent.change(screen.getByLabelText('filter-breed'), { target: { value: 'buckfast' } })
    fireEvent.change(screen.getByLabelText('filter-region'), { target: { value: 'UA-32' } })
    expect(window.location.search).toContain('breed=buckfast')
    expect(window.location.search).toContain('region=UA-32')
  })
})

