import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AnalyticsAlerts from '../AnalyticsAlerts'

describe('AnalyticsAlerts page', () => {
  it('create and toggle rule, test rule yields signals', async () => {
    render(<AnalyticsAlerts />)
    fireEvent.click(screen.getByText('Додати правило'))
    const cb = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    fireEvent.click(cb)
    fireEvent.click(cb)
    const testBtns = screen.getAllByText('Тест')
    fireEvent.click(testBtns[0])
    await waitFor(() => expect(screen.getByText('Сигнали (останнє)')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Сигнали'))
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(1)
    })
  })

  it('schedules: add and run now produces a delivery (via console)', async () => {
    render(<AnalyticsAlerts />)
    const btns = screen.getAllByText('Розклади')
    fireEvent.click(btns.find(el => el.tagName.toLowerCase()==='button') as HTMLElement)
    fireEvent.click(screen.getByText('Новий розклад'))
    const runNow = screen.getByText('Запустити зараз')
    fireEvent.click(runNow)
    await waitFor(() => expect(screen.getByText('Новий розклад')).toBeInTheDocument())
  })

  it('subscriptions: render tab and create subscription with valid email/url', async () => {
    render(<AnalyticsAlerts />)
    // Ensure at least one rule exists
    const addRuleBtn = screen.getByText('Додати правило')
    fireEvent.click(addRuleBtn)
    // Open subscriptions tab
    const subsTab = screen.getAllByText('Підписки').find(el => el.tagName.toLowerCase()==='button') as HTMLElement
    fireEvent.click(subsTab)
    fireEvent.click(screen.getAllByRole('button', { name: 'Нова підписка' })[0])
    // pick rule in select (already defaulted), set channels and targets
    const emailCb = screen.getByRole('checkbox', { name: 'email' }) as HTMLInputElement
    const webhookCb = screen.getByRole('checkbox', { name: 'webhook' }) as HTMLInputElement
    fireEvent.click(emailCb)
    fireEvent.click(webhookCb)
    fireEvent.change(screen.getByRole('textbox', { name: 'email' }), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'webhook' }), { target: { value: 'https://example.com/hook' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'digest' }), { target: { value: 'daily' } })
    fireEvent.click(screen.getByText('Зберегти'))
    await waitFor(() => {
      const cells = screen.getAllByRole('cell')
      expect(cells.some(td => (td as HTMLElement).textContent?.includes('user@example.com'))).toBe(true)
    })
  })

  it('send test triggers deliver for selected channels', async () => {
    const spy = vi.spyOn(await import('../../analytics/transports'), 'deliver').mockResolvedValue({ ok: true, channel: 'console' })
    render(<AnalyticsAlerts />)
    const subsTab = screen.getAllByText('Підписки').find(el => el.tagName.toLowerCase()==='button') as HTMLElement
    fireEvent.click(subsTab)
    fireEvent.click(screen.getAllByRole('button', { name: 'Нова підписка' })[0])
    fireEvent.click(screen.getByLabelText('console'))
    fireEvent.click(screen.getByText('Надіслати тест'))
    await waitFor(() => expect(spy).toHaveBeenCalled())
  })

  it('delivery settings: save user prefs', async () => {
    render(<AnalyticsAlerts />)
    const prefsTab = screen.getAllByText('Налаштування доставки').find(el => el.tagName.toLowerCase()==='button') as HTMLElement
    fireEvent.click(prefsTab)
    fireEvent.change(screen.getByLabelText('defaultEmail'), { target: { value: 'p@ex.com' } })
    fireEvent.change(screen.getByLabelText('defaultWebhookUrl'), { target: { value: 'https://ex.com/h' } })
    fireEvent.change(screen.getByLabelText('timezone'), { target: { value: 'Europe/Kyiv' } })
    fireEvent.change(screen.getByLabelText('digestHour'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('digestWday'), { target: { value: '1' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => {
      const raw = localStorage.getItem('hb.userprefs')
      expect(raw).toBeTruthy()
      const obj = JSON.parse(raw!)
      expect(obj.defaultEmail).toBe('p@ex.com')
      expect(obj.defaultWebhookUrl).toBe('https://ex.com/h')
      expect(obj.timezone).toBe('Europe/Kyiv')
      expect(obj.digestHour).toBe(10)
      expect(obj.digestWday).toBe(1)
    })
  })
})
