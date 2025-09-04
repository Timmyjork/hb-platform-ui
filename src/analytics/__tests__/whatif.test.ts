import { describe, it, expect, beforeEach } from 'vitest'
import { listScenarios, saveScenario, removeScenario, duplicateScenario, type Scenario } from '../whatif'

beforeEach(() => {
  localStorage.clear()
})

describe('what-if scenarios storage', () => {
  it('create/update/delete/duplicate and read back', () => {
    const s: Scenario = {
      id: 'wf_1',
      name: 'Base',
      input: { honey_kg: 10 },
      params: { noise: 0.1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveScenario(s)
    let list = listScenarios()
    expect(list.length).toBe(1)
    expect(list[0].name).toBe('Base')

    saveScenario({ ...s, name: 'Updated' })
    list = listScenarios()
    expect(list[0].name).toBe('Updated')

    const newId = duplicateScenario('wf_1')
    expect(newId).not.toBe('')
    list = listScenarios()
    expect(list.length).toBe(2)

    removeScenario('wf_1')
    list = listScenarios()
    expect(list.length).toBe(1)
    expect(list[0].id).toBe(newId)
  })
})

