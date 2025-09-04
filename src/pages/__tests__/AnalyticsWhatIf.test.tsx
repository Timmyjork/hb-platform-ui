import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalyticsWhatIf from '../AnalyticsWhatIf'
import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => { localStorage.clear() })

function getNumber(el: HTMLElement): number {
  const raw = el.getAttribute('data-value')
  const n = raw ? Number(raw) : Number(el.textContent ?? '0')
  return Number.isFinite(n) ? n : 0
}

describe('AnalyticsWhatIf page', () => {
  it('renders and updates forecast on input change', async () => {
    render(<AnalyticsWhatIf />)
    const si0 = getNumber(screen.getByTestId('si'))
    const sliders = screen.getAllByRole('slider') as HTMLInputElement[]
    const honeySlider = sliders[0]
    fireEvent.change(honeySlider, { target: { value: '20' } })
    await waitFor(() => {
      const si1 = getNumber(screen.getByTestId('si'))
      expect(si1).toBeGreaterThan(si0)
    })
  })

  it('weights/env/noise affect forecast', () => {
    render(<AnalyticsWhatIf />)
    const si0 = getNumber(screen.getByTestId('si'))
    // increase nectar_flow
    const nectar = screen.getByLabelText('nectar_flow (0.8..1.2)') as HTMLInputElement
    fireEvent.change(nectar, { target: { value: '1.2' } })
    const si1 = getNumber(screen.getByTestId('si'))
    expect(si1).toBeGreaterThanOrEqual(si0)
    // increase hygienic_pct weight and value
    const weightLabel = screen.getByText(/hygienic_pct/)
    const weightSlider = weightLabel.closest('div')!.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(weightSlider, { target: { value: '1' } })
    const hyg = screen.getByLabelText('Гігієна, %') as HTMLInputElement
    fireEvent.change(hyg, { target: { value: '95' } })
    const si2 = getNumber(screen.getByTestId('si'))
    expect(si2).toBeGreaterThan(si1)
  })

  it('save/duplicate/delete scenarios updates list', () => {
    render(<AnalyticsWhatIf />)
    const saveBtn = screen.getByText('Save')
    fireEvent.click(saveBtn)
    const select = screen.getByLabelText('Сценарій') as HTMLSelectElement
    expect(select.options.length).toBeGreaterThan(1)
    fireEvent.change(select, { target: { value: select.options[1].value } })
    const dup = screen.getByText('Duplicate')
    fireEvent.click(dup)
    expect((screen.getByLabelText('Сценарій') as HTMLSelectElement).options.length).toBeGreaterThan(2)
    const del = screen.getByText('Delete')
    fireEvent.click(del)
    expect((screen.getByLabelText('Сценарій') as HTMLSelectElement).options.length).toBeGreaterThan(1)
  })

  it('Export CSV triggers download', () => {
    render(<AnalyticsWhatIf />)
    if (typeof URL.createObjectURL !== 'function') {
      // @ts-expect-error polyfill
      URL.createObjectURL = (() => 'blob://test') as any
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      // @ts-expect-error polyfill
      URL.revokeObjectURL = (() => {}) as any
    }
    const createURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test')
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const append = vi.spyOn(document.body, 'appendChild')
    const a = document.createElement('a')
    const createEl = vi.spyOn(document, 'createElement').mockReturnValue(a as any)
    fireEvent.click(screen.getByText('Export CSV'))
    expect(createURL).toHaveBeenCalled()
    expect(revokeURL).toHaveBeenCalled()
    expect(append).toHaveBeenCalled()
    createURL.mockRestore(); revokeURL.mockRestore(); append.mockRestore(); createEl.mockRestore()
  })
})
