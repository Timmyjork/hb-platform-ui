import type { Payments, PaymentIntent, Amount, Provider } from './types'

export class MockPayments implements Payments {
  getProvider(): Provider { return 'mock' }
  async createIntent(_orderId: string, _amount: Amount, _metadata?: Record<string,string>): Promise<PaymentIntent> {
    return { id: `pi_${Math.random().toString(36).slice(2,8)}`, clientSecret: `cs_${Math.random().toString(36).slice(2,8)}`, status: 'succeeded' }
  }
  async retrieveIntent(intentId: string): Promise<PaymentIntent> { return { id: intentId, status: 'succeeded' } }
  async refund(_intentId: string, _amount?: Amount): Promise<{ id: string; status: 'succeeded' | 'failed' }> { return { id: `re_${Math.random().toString(36).slice(2,8)}`, status: 'succeeded' } }
}
