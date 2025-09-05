import type { BreederId, QAQuestion, QuestionId } from '../types/breederProfile'

const LS = 'hb.qa'

function read(): QAQuestion[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as QAQuestion[]: seed() } catch { return seed() } }
function write(rows: QAQuestion[]): QAQuestion[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listQuestions(breederId: BreederId, status?: QAQuestion['status']): QAQuestion[] {
  const rows = read().filter(q=> q.breederId === breederId)
  return status ? rows.filter(q => q.status === status) : rows
}
export function askQuestion(q: Omit<QAQuestion,'id'|'createdAt'|'answer'|'status'>): QAQuestion {
  const now = new Date().toISOString()
  const row: QAQuestion = { ...q, id: `Q_${Math.random().toString(36).slice(2,8)}`, createdAt: now, status:'pending' }
  const rows = read(); rows.unshift(row); write(rows); return row
}
export function answerQuestion(breederId: BreederId, qid: QuestionId, answerText: string, authorBreederId: BreederId): void {
  const rows = read(); const i = rows.findIndex(q=> q.breederId===breederId && q.id===qid); if (i===-1) return
  rows[i] = { ...rows[i], answer: { text: answerText, authorBreederId, createdAt: new Date().toISOString() } }
  write(rows)
}
export function setQuestionStatus(breederId: BreederId, qid: QuestionId, status: QAQuestion['status']): void {
  const rows = read(); const i = rows.findIndex(q=> q.breederId===breederId && q.id===qid); if (i===-1) return
  rows[i] = { ...rows[i], status }
  write(rows)
}

function seed(): QAQuestion[] {
  const now = new Date().toISOString()
  const rows: QAQuestion[] = [
    { id:'Q1', breederId:'B1', authorUserId:'U5', text:'Які строки доставки?', createdAt: now, status:'approved', answer:{ text:'1-2 тижні', authorBreederId:'B1', createdAt: now } },
    { id:'Q2', breederId:'B2', authorUserId:'U6', text:'Чи є сертифікати?', createdAt: now, status:'pending' },
  ]
  return write(rows)
}
