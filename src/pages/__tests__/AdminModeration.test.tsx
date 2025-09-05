import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminModeration from '../AdminModeration'
import { addReview } from '../../state/reviews.store'
import { askQuestion } from '../../state/qa.store'

describe('AdminModeration', () => {
  beforeEach(() => { localStorage.clear() })
  it('filters by status and supports approve bulk for reviews', () => {
    addReview({ breederId:'B1', authorUserId:'U1', rating:5, text:'ok' })
    render(<AdminModeration />)
    // Reviews tab default with pending filter
    expect(screen.getByText('Відгуки')).toBeInTheDocument()
    const approveBtn = screen.getAllByText('Approve')[0]
    // select all and bulk approve
    fireEvent.click(screen.getByLabelText('select-all'))
    fireEvent.click(approveBtn)
    // Change filter to approved
    const statusSel = screen.getAllByDisplayValue('pending')[0]
    fireEvent.change(statusSel, { target: { value: 'approved' } })
    expect(screen.getAllByText('approved').length).toBeGreaterThan(0)
  })
  it('QA tab bulk actions', () => {
    askQuestion({ breederId:'B1', authorUserId:'U2', text:'?' })
    render(<AdminModeration />)
    fireEvent.click(screen.getByText('Q&A'))
    fireEvent.click(screen.getByLabelText('select-all'))
    const approveBtns = screen.getAllByText('Approve')
    fireEvent.click(approveBtns[approveBtns.length - 1])
    // switch filter to approved
    const statusSel = screen.getAllByDisplayValue('pending')[0]
    fireEvent.change(statusSel, { target: { value: 'approved' } })
    // should still render table
    expect(screen.getByText('breederId')).toBeInTheDocument()
  })
})
