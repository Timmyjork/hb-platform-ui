import { stats as qStats } from './queue'

export type Health = { ok: boolean; queue: { pending: number; failed: number }; storage: { keys: number }; time: string }

export function getHealth(): Health {
  const qs = qStats()
  const keys = localStorage.length
  return { ok: true, queue: { pending: qs.pending, failed: qs.failed }, storage: { keys }, time: new Date().toISOString() }
}

