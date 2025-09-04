export type Transport = 'email'|'webhook'|'console';
export type Delivery = { id: string; createdAt: string; channel: Transport; ok: boolean; error?: string; details?: unknown };
export type DeliveryPayload = { ruleId: string; title: string; message: string; level: 'info'|'warning'|'critical'; at: string };
export type DeliveryRequest = { channel: Transport; target?: string; payload: DeliveryPayload };
export type DeliveryResult = { ok: boolean; channel: string; error?: string };

const LS_KEY = 'hb.deliveries';

function pushDelivery(d: Delivery) {
  try { const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]') as Delivery[]; arr.push(d); localStorage.setItem(LS_KEY, JSON.stringify(arr)) } catch { /* noop */ }
}

function isEmail(v?: string) { return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isUrl(v?: string) { if (!v) return false; try { const u = new URL(v); return u.protocol==='http:'||u.protocol==='https:' } catch { return false } }

export async function deliver(req: DeliveryRequest): Promise<DeliveryResult> {
  const id = `d_${Math.random().toString(36).slice(2,8)}`
  const createdAt = new Date().toISOString()
  if (req.channel==='console') {
    console.log('[console]', req.payload)
    pushDelivery({ id, createdAt, channel:'console', ok:true, details:req })
    return { ok:true, channel:'console' }
  }
  if (req.channel==='email') {
    if (!isEmail(req.target)) { pushDelivery({ id, createdAt, channel:'email', ok:false, error:'Invalid email', details:req }); return { ok:false, channel:'email', error:'Invalid email' } }
    console.log('[email]', req.target, req.payload)
    pushDelivery({ id, createdAt, channel:'email', ok:true, details:req })
    return { ok:true, channel:'email' }
  }
  if (!isUrl(req.target)) { pushDelivery({ id, createdAt, channel:'webhook', ok:false, error:'Invalid url', details:req }); return { ok:false, channel:'webhook', error:'Invalid url' } }
  try {
    // fetch guard
    const hasFetch = typeof (globalThis as Record<string, unknown>).fetch === 'function';
    const res = hasFetch
      ? await fetch(req.target!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.payload),
        })
      : ({ ok: false } as Response);
    const r = res as Response | { ok?: boolean; status?: number };
    const rr = r as { ok?: boolean; status?: number };
    const ok = (rr.ok === true) || (typeof rr.status === 'number' && rr.status >= 200 && rr.status < 300)
    pushDelivery({ id, createdAt, channel:'webhook', ok, details:req, error: ok? undefined : 'HTTP error' })
    return { ok, channel:'webhook', error: ok? undefined : 'HTTP error' }
  } catch (_e) {
    // noop: swallow network error in tests
    pushDelivery({ id, createdAt, channel:'webhook', ok:false, error:'Network error', details:req })
    return { ok:false, channel:'webhook', error:'Network error' }
  }
}

// Transfer email stub
export async function sendTransferEmail(to: string, payload: { queenId: string; seller: string; buyer: string }) {
  console.log('[MAIL] transfer', to, payload)
  return { ok: true, to, payload }
}
