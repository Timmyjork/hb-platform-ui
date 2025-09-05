import { addQuestion, listAll, bulkPublish, bulkHide, answerQuestion } from '../qa.public.store'

describe('qa.public.store moderation', () => {
  beforeEach(() => localStorage.clear())
  it('publishes/hides and answers', () => {
    const q = addQuestion({ breederId:'B1', author:{ name:'A' }, text:'Hi?' })
    expect(listAll({ status:'pending' }).total).toBe(1)
    bulkPublish([q.id])
    expect(listAll({ status:'published' }).total).toBe(1)
    answerQuestion(q.id, 'Yes', 'internal')
    expect(listAll({ q:'Yes' }).total).toBe(1)
    bulkHide([q.id])
    expect(listAll({ status:'hidden' }).total).toBe(1)
  })
})

