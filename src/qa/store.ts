import type { Question, Answer } from './types'

const LS_QA = 'hb.qa'

type Row = Question | Answer

function read(): Row[] { try { const raw = localStorage.getItem(LS_QA); return raw? JSON.parse(raw) as Row[]: [] } catch { return [] } }
function write(rows: Row[]): Row[] { localStorage.setItem(LS_QA, JSON.stringify(rows)); return rows }

export function listQuestions(context: Question['context'], contextId: string): Question[] { return read().filter((r): r is Question => (r as Question).context !== undefined && (r as Question).context === context && (r as Question).contextId === contextId && (r as Question).status !== 'removed') }
export function listAnswers(questionId: string): Answer[] { return read().filter((r): r is Answer => (r as Answer).questionId === questionId) }

export function addQuestion(q: Omit<Question,'id'|'createdAt'|'status'>): Question { const now = new Date().toISOString(); const row: Question = { ...q, id: `Q${Date.now()}_${Math.random().toString(36).slice(2,6)}`, createdAt: now, status: 'published' }; const rows = read(); rows.unshift(row); write(rows); return row }
export function addAnswer(a: Omit<Answer,'id'|'createdAt'>): Answer { const now = new Date().toISOString(); const row: Answer = { ...a, id: `A${Date.now()}_${Math.random().toString(36).slice(2,6)}`, createdAt: now }; const rows = read(); rows.unshift(row); write(rows); return row }
export function updateQuestionStatus(id: string, status: Question['status']): void { const rows = read(); const idx = rows.findIndex(r => (r as Question).id === id && (r as Question).context !== undefined); if (idx>=0) { (rows[idx] as Question).status = status; write(rows) } }
export function removeQuestion(id: string) { updateQuestionStatus(id, 'removed') }
