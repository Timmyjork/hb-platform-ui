import type { Observation } from '../types/queen'

const LS_KEY = 'hb.observations'

function read(): Observation[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Observation[]) : []
  } catch {
    return []
  }
}

function write(rows: Observation[]): Observation[] {
  localStorage.setItem(LS_KEY, JSON.stringify(rows))
  return rows
}

export function listObservationsByQueen(queenId: string): Observation[] {
  return read().filter(o => o.queenId === queenId)
}

export function addObservation(obs: Observation): Observation {
  const rows = read()
  rows.push(obs)
  write(rows)
  return obs
}

