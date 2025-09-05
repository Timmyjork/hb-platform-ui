export type Coupon = { code:string; percent?:number; amount?:number; active:boolean; maxRedemptions?:number; used?:number }

const LS = 'hb.coupons'
function read(): Coupon[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Coupon[]: [] } catch { return [] } }
function write(rows: Coupon[]): Coupon[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listCoupons(): Coupon[] { return read() }
export function addCoupon(c: Coupon): void { const rows = read(); const i = rows.findIndex(x => x.code.toUpperCase() === c.code.toUpperCase()); if (i>=0) rows[i]=c; else rows.unshift(c); write(rows) }
export function redeem(code: string, _orderId: string): { ok: boolean; coupon?: Coupon } {
  const rows = read(); const i = rows.findIndex(x => x.code.toUpperCase() === code.toUpperCase()); if (i===-1) return { ok:false }
  const c = rows[i]
  if (!c.active) return { ok:false }
  if (c.maxRedemptions && (c.used||0) >= c.maxRedemptions) { rows[i] = { ...c, active:false }; write(rows); return { ok:false } }
  rows[i] = { ...c, used: (c.used||0)+1, active: c.maxRedemptions ? ((c.used||0)+1) < c.maxRedemptions : c.active }
  write(rows)
  return { ok:true, coupon: rows[i] }
}

