export type Amount = { currency: 'UAH'|'USD'|'EUR'; value: number }
export type PaymentIntent = { id: string; clientSecret?: string; status: 'requires_action'|'succeeded'|'processing'|'canceled'|'failed' }
export type Provider = 'mock'|'stripe'|'liqpay'|'fondy'

export interface Payments {
  createIntent(orderId: string, amount: Amount, metadata?: Record<string,string>): Promise<PaymentIntent>
  retrieveIntent(intentId: string): Promise<PaymentIntent>
  refund(intentId: string, amount?: Amount): Promise<{ id: string; status: 'succeeded'|'failed' }>
  getProvider(): Provider
}

