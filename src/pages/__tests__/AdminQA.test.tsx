import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import AdminQA from '../AdminQA'
import { addQuestion } from '../../state/qa.public.store'

describe('AdminQA page', () => {
  beforeEach(() => { localStorage.clear(); addQuestion({ breederId:'B1', author:{ name:'Guest' }, text:'When?' }) })
  it('renders and publish + answer writes audit', async () => {
    render(<AdminQA />)
    const table = screen.getByRole('table')
    const firstRow = within(table).getAllByRole('checkbox')[1]
    fireEvent.click(firstRow)
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
    // open answer modal
    fireEvent.click(within(table).getByRole('button', { name: 'Answer…' }))
    const dialog = await screen.findByRole('dialog', { name: 'answer-modal' })
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Soon' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      const audit = localStorage.getItem('hb.audit') || '[]'
      expect(JSON.parse(audit).length).toBeGreaterThan(0)
    })
  })
})

