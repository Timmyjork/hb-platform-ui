import type { BreederId, QAQuestion, QuestionId } from '../types/breederProfile'

const LS = 'hb.qa'

function read(): QAQuestion[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as QAQuestion[]: seed() } catch { return seed() } }
function write(rows: QAQuestion[]): QAQuestion[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function listQuestions(breederId: BreederId): QAQuestion[] { return read().filter(q=> q.breederId === breederId) }
export function askQuestion(q: Omit<QAQuestion,'id'|'createdAt'|'answer'>): QAQuestion {
  const now = new Date().toISOString()
  const row: QAQuestion = { ...q, id: `Q_${Math.random().toString(36).slice(2,8)}`, createdAt: now }
  const rows = read(); rows.unshift(row); write(rows); return row
}
export function answerQuestion(breederId: BreederId, qid: QuestionId, answerText: string, authorBreederId: BreederId): void {
  const rows = read(); const i = rows.findIndex(q=> q.breederId===breederId && q.id===qid); if (i===-1) return
  rows[i] = { ...rows[i], answer: { text: answerText, authorBreederId, createdAt: new Date().toISOString() } }
  write(rows)
}

function seed(): QAQuestion[] {
  const now = new Date().toISOString()
  const rows: QAQuestion[] = [
    { id:'Q1', breederId:'B1', authorUserId:'U5', text:'Які строки доставки?', createdAt: now, answer:{ text:'1-2 тижні', authorBreederId:'B1', createdAt: now } },
    { id:'Q2', breederId:'B2', authorUserId:'U6', text:'Чи є сертифікати?', createdAt: now },
  ]
  return write(rows)
}
