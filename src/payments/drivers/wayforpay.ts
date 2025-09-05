import type { PaymentDriver } from './base'

export const WayForPayDriver: PaymentDriver = {
  async create(_amountUAH: number, _orderId: string) { throw new Error('E_PAY_NOT_CONFIGURED') },
  async capture(_id: string) { throw new Error('E_PAY_NOT_CONFIGURED') },
  async cancel(_id: string) { throw new Error('E_PAY_NOT_CONFIGURED') },
}

