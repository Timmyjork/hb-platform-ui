export type Job =
  | { type: 'email'; to: string; subject: string; body: string }
  | { type: 'sms'; to: string; body: string }
  | { type: 'webhook'; url: string; payload: any }

type Row = Job & { id: string; status: 'pending' | 'done' | 'failed'; error?: string; createdAt: string; updatedAt: string }

const LS = 'hb.queue.v1'

function read(): Row[] { try { const raw = localStorage.getItem(LS); return raw ? (JSON.parse(raw) as Row[]) : [] } catch { return [] } }
function write(rows: Row[]): void { localStorage.setItem(LS, JSON.stringify(rows)) }

export function enqueue(job: Job): string {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  const row: Row = { ...job, id, status: 'pending', createdAt: now, updatedAt: now }
  const rows = read(); rows.push(row); write(rows)
  return id
}

export function getPending(): Row[] { return read().filter((r) => r.status === 'pending') }

export function markDone(jobId: string): void {
  const rows = read(); const i = rows.findIndex((r) => r.id === jobId); if (i === -1) return
  rows[i] = { ...rows[i], status: 'done', error: undefined, updatedAt: new Date().toISOString() }
  write(rows)
}

export function markFailed(jobId: string, err: string): void {
  const rows = read(); const i = rows.findIndex((r) => r.id === jobId); if (i === -1) return
  rows[i] = { ...rows[i], status: 'failed', error: err, updatedAt: new Date().toISOString() }
  write(rows)
}

export function stats(): { pending: number; done: number; failed: number } {
  const rows = read()
  return {
    pending: rows.filter((r) => r.status === 'pending').length,
    done: rows.filter((r) => r.status === 'done').length,
    failed: rows.filter((r) => r.status === 'failed').length,
  }
}

