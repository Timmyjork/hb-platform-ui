import { getPending, markDone, markFailed } from './queue'

export async function drainOnce(): Promise<void> {
  const pending = getPending() as any[]
  for (const job of pending) {
    try {
      if (job.type === 'email') console.log('[EMAIL]', { to: job.to, subject: job.subject, body: job.body })
      else if (job.type === 'sms') console.log('[SMS]', { to: job.to, body: job.body })
      else if (job.type === 'webhook') console.log('[WEBHOOK]', { url: job.url, payload: job.payload })
      markDone(job.id)
    } catch (e: any) {
      markFailed(job.id, e?.message || String(e))
    }
  }
}

export function scheduleDrain(intervalMs = 5000): number {
  const id = (setInterval(() => { void drainOnce() }, intervalMs) as unknown) as number
  return id
}
export function stopDrain(id: number): void { clearInterval(id as unknown as any) }
