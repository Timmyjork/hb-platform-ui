export interface PaymentDriver {
  create(amountUAH: number, orderId: string): Promise<{ id: string; clientSecret?: string }>
  capture(id: string): Promise<void>
  cancel(id: string): Promise<void>
}

