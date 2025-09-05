import type { Question } from '../types/qa.v23'

const LS = 'hb.qa.public'

function read(): Question[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as Question[]: [] } catch { return [] } }
function write(rows: Question[]): Question[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listQuestions(breederId: string, filter?: { status?: 'published'|'pending' }): Question[] {
  let rows = read().filter(q => q.breederId === breederId)
  if (filter?.status) rows = rows.filter(q => q.status === filter.status)
  return rows
}
export function addQuestion(q: Omit<Question,'id'|'createdAt'|'status'>): Question { const now = new Date().toISOString(); const row: Question = { ...q, id: `Q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, createdAt: now, status: 'pending' }; const rows = read(); rows.unshift(row); write(rows); return row }
export function answerQuestion(id: string, text: string, authorId?: string): void { const rows = read(); const i = rows.findIndex(q => q.id===id); if (i>=0) { rows[i] = { ...rows[i], answer: { text, authorId, answeredAt: new Date().toISOString() }, status:'published' }; write(rows) } }
export function hideQuestion(id: string): void { const rows = read(); const i = rows.findIndex(q => q.id===id); if (i>=0) { rows[i] = { ...rows[i], status:'hidden' }; write(rows) } }

export function bulkPublish(ids: string[]): number { const rows = read(); let n=0; for (let i=0;i<rows.length;i++) if (ids.includes(rows[i].id)) { rows[i] = { ...rows[i], status:'published' }; n++ } write(rows); return n }
export function bulkHide(ids: string[]): number { const rows = read(); let n=0; for (let i=0;i<rows.length;i++) if (ids.includes(rows[i].id)) { rows[i] = { ...rows[i], status:'hidden' }; n++ } write(rows); return n }
export function listAll(filter?: { status?: 'published'|'pending'|'hidden'; breederId?: string; q?: string; limit?: number; offset?: number; sort?: 'date_desc'|'date_asc' }): { rows: Question[]; total: number } {
  let rows = read()
  if (filter?.breederId) rows = rows.filter(q => q.breederId === filter.breederId)
  if (filter?.status) rows = rows.filter(q => q.status === filter.status)
  if (filter?.q) { const s = filter.q.trim().toLowerCase(); rows = rows.filter(q => q.text.toLowerCase().includes(s) || (q.answer?.text||'').toLowerCase().includes(s)) }
  const sort = filter?.sort || 'date_desc'
  rows = [...rows].sort((a,b) => sort==='date_asc'? a.createdAt.localeCompare(b.createdAt): b.createdAt.localeCompare(a.createdAt))
  const total = rows.length
  const offset = filter?.offset || 0
  const limit = filter?.limit || 20
  return { rows: rows.slice(offset, offset + limit), total }
}
