import { describe, it, expect } from 'vitest'
import { importQueensCSV } from '../csv'

const baseHeader = 'queenId,breed,breed_code,breedCode,region,region_code,unionCode,breederNo,queenNo,year,breederId\n'

describe('CSV breed/region matching', () => {
  it('normalizes breed to breed_code and lineage (numeric) and region to region_code', () => {
    const csv1 = baseHeader + [
      // breed by label, region by short
      [',Карніка,,,' , 'Київська', ',,1,2,2025,B1'].join(''),
    ].join('\n').replace(/,,/,',') // quick sanitize
    const res1 = importQueensCSV(csv1, { mode: 'skip' })
    expect(res1.rows[0].breedCode).toBe('1') // carnica -> 1
    expect(res1.rows[0].unionCode).toBe('32') // Kyivska -> UA-32 -> 32

    const csv2 = baseHeader + [
      // breed by slug, region by ISO
      [',,,buckfast',',','UA-32',',,1,3,2025,B2'].join(''),
    ].join('\n').replace(/,,/,',')
    const res2 = importQueensCSV(csv2, { mode: 'skip' })
    expect(res2.rows[0].breedCode).toBe('3')
    expect(res2.rows[0].unionCode).toBe('32')

    const csv3 = baseHeader + [
      // region by slug
      [',Карпатська,,', 'kyivska',',,,1,4,2025,B3'].join(''),
    ].join('\n').replace(/,,/,',')
    const res3 = importQueensCSV(csv3, { mode: 'skip' })
    expect(Number(res3.rows[0].unionCode)).toBe(32)
  })
})

