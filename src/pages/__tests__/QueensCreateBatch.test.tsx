import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import QueensCreateBatch from '../QueensCreateBatch'
import { listQueens } from '../../state/queens.store'

describe('QueensCreateBatch page', () => {
  beforeEach(() => { localStorage.clear() })

  it('creates N queens from form', () => {
    render(<QueensCreateBatch />)
    fireEvent.change(screen.getByLabelText('count'), { target: { value: '5' } })
    const btn = screen.getByRole('button', { name: /Створити 5 маток/ })
    fireEvent.click(btn)
    const rows = listQueens()
    expect(rows.length).toBe(5)
  })
})

