type Tx = { txId: string; amount: number; currency: 'UAH'|'EUR'; orderId: string; status: 'created'|'captured'|'refunded'|'failed' }
const LS = 'hb.payments.mock'
function read(): Tx[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Tx[]: [] } catch { return [] } }
function write(rows: Tx[]): Tx[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export async function createPayment(amount:number, currency:'UAH'|'EUR', orderId:string):Promise<{txId:string}> {
  const fail = typeof window !== 'undefined' && (window.location.search.includes('fail=1'))
  const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
  const rows = read(); rows.unshift({ txId, amount, currency, orderId, status: fail? 'failed': 'created' }); write(rows)
  if (fail) throw new Error('E_MOCKPAY_FAIL')
  return { txId }
}
export async function capturePayment(txId:string):Promise<{ok:true}> { const rows = read(); const i = rows.findIndex(t=>t.txId===txId); if (i>=0) { rows[i].status='captured'; write(rows) } return { ok: true } }
export async function refundPayment(txId:string):Promise<{ok:true}> { const rows = read(); const i = rows.findIndex(t=>t.txId===txId); if (i>=0) { rows[i].status='refunded'; write(rows) } return { ok: true } }

