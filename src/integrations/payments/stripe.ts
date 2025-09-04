import type { Payments, PaymentIntent, Amount, Provider } from './types'

export class StripePayments implements Payments {
  private secretKey: string
  constructor(secretKey: string) { this.secretKey = secretKey }
  getProvider(): Provider { return 'stripe' }
  async createIntent(_orderId: string, _amount: Amount, _metadata?: Record<string,string>): Promise<PaymentIntent> {
    const requiresAction = false; void this.secretKey
    return { id: `pi_${Math.random().toString(36).slice(2,8)}`, clientSecret: `cs_${Math.random().toString(36).slice(2,8)}`, status: requiresAction ? 'requires_action' : 'processing' }
  }
  async retrieveIntent(intentId: string): Promise<PaymentIntent> {
    return { id: intentId, status: 'succeeded' }
  }
  async refund(_intentId: string, _amount?: Amount): Promise<{ id: string; status: 'succeeded' | 'failed' }> {
    return { id: `re_${Math.random().toString(36).slice(2,8)}`, status: 'succeeded' }
  }
}

