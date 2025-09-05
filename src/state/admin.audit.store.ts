export type AuditRow = { id: string; at: string; actorId: string; action: string; payload?: any }

const LS = 'hb.audit'

function read(): AuditRow[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as AuditRow[]: [] } catch { return [] } }
function write(rows: AuditRow[]): AuditRow[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function audit(action: string, payload?: any): void {
  const now = new Date().toISOString()
  const row: AuditRow = { id: `A_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, at: now, actorId: 'internal', action, payload }
  const rows = read(); rows.unshift(row); write(rows)
  // also log to console for dev
  // eslint-disable-next-line no-console
  console.log('[AUDIT]', action, payload)
}

export function listAudit(filter?: { q?: string; from?: string; to?: string; limit?: number; offset?: number }): { rows: AuditRow[]; total: number } {
  let rows = read()
  if (filter?.q) { const s = filter.q.trim().toLowerCase(); rows = rows.filter(r => r.action.toLowerCase().includes(s)) }
  if (filter?.from) rows = rows.filter(r => r.at >= filter.from!)
  if (filter?.to) rows = rows.filter(r => r.at <= filter.to!)
  const total = rows.length
  const offset = filter?.offset || 0
  const limit = filter?.limit || 50
  return { rows: rows.slice(offset, offset + limit), total }
}

