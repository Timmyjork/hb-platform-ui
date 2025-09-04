import { describe, it, expect, beforeEach } from 'vitest'
import { addQuestion, addAnswer, listQuestions, listAnswers, updateQuestionStatus } from '../store'

describe('qa store', () => {
  beforeEach(() => { localStorage.clear() })
  it('creates question and answer, lists them', () => {
    const q = addQuestion({ context:'breeder', contextId:'B1', authorId:'U1', text:'Яка порода?' })
    const a = addAnswer({ questionId: q.id, authorId:'B1', text:'Карніка' })
    expect(listQuestions('breeder','B1').some(x=> x.id === q.id)).toBe(true)
    expect(listAnswers(q.id).some(x=> x.id === a.id)).toBe(true)
  })
  it('update status hides question', () => {
    const q = addQuestion({ context:'queen', contextId:'Q1', authorId:'U1', text:'?' })
    updateQuestionStatus(q.id, 'removed')
    expect(listQuestions('queen','Q1').length).toBe(0)
  })
})

