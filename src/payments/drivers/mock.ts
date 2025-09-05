import type { PaymentDriver } from './base'

export const MockDriver: PaymentDriver = {
  async create(_amountUAH: number, _orderId: string) {
    const id = `pi_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
    const clientSecret = `secret_${id}`
    return { id, clientSecret }
  },
  async capture(_id: string) { return },
  async cancel(_id: string) { return },
}
