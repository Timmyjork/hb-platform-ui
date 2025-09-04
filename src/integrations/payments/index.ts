import type { Payments } from './types'
import { MockPayments } from './mock'
import { StripePayments } from './stripe'

export function makePaymentsFromEnv(): Payments {
  const env = (import.meta as any).env || {}
  const provider = env.PAYMENTS_PROVIDER || 'stripe'
  const key = env.PAYMENTS_SECRET_KEY || ''
  if (!key) return new MockPayments()
  if (provider === 'stripe') return new StripePayments(key)
  return new MockPayments()
}
