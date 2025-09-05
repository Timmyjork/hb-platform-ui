import { describe, it, expect, beforeEach } from 'vitest'
import { askQuestion, listQuestions, setQuestionStatus } from '../qa.store'

describe('state/qa.store', () => {
  beforeEach(() => { localStorage.clear() })
  it('new question is pending', () => {
    const q = askQuestion({ breederId:'B1', authorUserId:'U2', text:'?' })
    expect(q.status).toBe('pending')
    expect(listQuestions('B1','pending').some(x=> x.id===q.id)).toBe(true)
  })
  it('can approve/reject and filter', () => {
    const q = askQuestion({ breederId:'B1', authorUserId:'U2', text:'?' })
    setQuestionStatus('B1', q.id, 'approved')
    expect(listQuestions('B1','approved').some(x=> x.id===q.id)).toBe(true)
    expect(listQuestions('B1','pending').some(x=> x.id===q.id)).toBe(false)
  })
})

