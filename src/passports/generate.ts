import { listQueens } from '../state/queens.store'

export function generatePassportHTML(queenId: string): string {
  const q = listQueens().find(x => x.id === queenId)
  const title = `Паспорт: ${queenId}`
  const breed = q?.breedCode || ''
  const year = q?.year || ''
  const breeder = q?.breederId || ''
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1><p>Порода/лінія: ${breed}</p><p>Рік: ${year}</p><p>Маткар: ${breeder}</p></body></html>`
}

export async function downloadPassport(queenId: string): Promise<Blob> {
  const html = generatePassportHTML(queenId)
  const blob = new Blob([html], { type: 'text/html' })
  return blob
}

