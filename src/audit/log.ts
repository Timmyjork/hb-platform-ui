export type AuditEvent =
  | { type:'order.created'; orderId:string; by?:string; at:string }
  | { type:'order.paid'; orderId:string; paymentId:string; at:string }
  | { type:'order.cancelled'; orderId:string; by?:string; at:string }
  | { type:'ownership.transfer.requested'; orderId:string; by?:string; at:string }
  | { type:'ownership.transfer.completed'; orderId:string; queenIds:string[]; to:string; at:string }
  | { type:'ownership.transfer.failed'; orderId:string; reason:string; at:string }
  | { type:'payment.status'; paymentId:string; status:string; at:string }
  | { type:'stock.reserve'; orderId:string; items:{listingId:string;qty:number}[]; ttlSec:number; at:string }
  | { type:'stock.release'; orderId:string; reason:'expired'|'cancelled'; at:string }

const LS = 'hb.audit.log'

export function append(event: AuditEvent): void {
  const rows = (()=>{ try { return JSON.parse(localStorage.getItem(LS)||'[]') as AuditEvent[] } catch { return [] } })()
  rows.push(event)
  localStorage.setItem(LS, JSON.stringify(rows))
}

export function list(filter?: Partial<{ orderId:string; paymentId:string }>): AuditEvent[] {
  const rows: AuditEvent[] = (()=>{ try { return JSON.parse(localStorage.getItem(LS)||'[]') as AuditEvent[] } catch { return [] } })()
  if (!filter) return rows
  return rows.filter(ev => (filter.orderId? (ev as any).orderId===filter.orderId: true) && (filter.paymentId? (ev as any).paymentId===filter.paymentId: true))
}

