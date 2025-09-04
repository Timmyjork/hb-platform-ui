type Event = { id: string; type: string; ts: string; payload?: unknown }
const LS = 'hb.analytics.events'

function read(): Event[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Event[]: [] } catch { return [] } }
function write(rows: Event[]) { localStorage.setItem(LS, JSON.stringify(rows)) }

export function track(type: 'view_listing'|'add_to_cart'|'begin_checkout'|'payment_succeeded'|'payment_failed'|'transfer_done', payload?: unknown) {
  const rows = read(); rows.push({ id:`E_${Math.random().toString(36).slice(2,8)}`, type, ts: new Date().toISOString(), payload }); write(rows)
}

export function funnel(days = 30) {
  const since = Date.now() - days*24*3600*1000
  const rows = read().filter(e => new Date(e.ts).getTime() >= since)
  const count = (t: string) => rows.filter(e=> e.type===t).length
  const view = count('view_listing'), add = count('add_to_cart'), checkout = count('begin_checkout'), paid = count('payment_succeeded')
  const ctr = view? (add/view): 0, co = add? (checkout/add): 0, pay = checkout? (paid/checkout): 0
  const avg = 0
  return { view, add, checkout, paid, ctr, checkoutRate: co, payRate: pay, avg }
}

export function lastEvents(n=20): Event[] { const rows = read(); return rows.slice(-n) }
