import { parseCSV, toCSV } from '../../utils/csv'

describe('csv utils', () => {
  it('parses simple CSV with quotes and commas', () => {
    const text = 'a,b\n1,2\n"3,4",5\n"he""llo",world'
    const rows = parseCSV(text)
    expect(rows).toEqual([
      { a: '1', b: '2' },
      { a: '3,4', b: '5' },
      { a: 'he"llo', b: 'world' },
    ])
  })

  it('toCSV flattens and joins headers', () => {
    const csv = toCSV([{ a: 1, b: { c: 2 } }])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('a,b.c')
    expect(lines[1]).toBe('1,2')
  })
})

