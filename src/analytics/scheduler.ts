import { deliver } from './transports'
import { type UserPrefs } from './subscriptions'
import type { DeliveryPayload } from './transports'

export type Schedule = { id: string; cron: string; title: string; enabled: boolean; payload: { kind: 'daily-summary'|'weekly-summary', scope: 'global'|'region'|'breeder', scopeId?: string } };

const LS_KEY = 'hb.schedules'

export async function listSchedules(): Promise<Schedule[]> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as Schedule[] } catch { return [] }
}

export async function addSchedule(s: Schedule): Promise<void> {
  const arr = await listSchedules()
  arr.push(s)
  localStorage.setItem(LS_KEY, JSON.stringify(arr))
}

export async function toggleSchedule(id: string, enabled: boolean): Promise<void> {
  const arr = await listSchedules()
  const idx = arr.findIndex(x=>x.id===id)
  if (idx>=0) { arr[idx].enabled = enabled; localStorage.setItem(LS_KEY, JSON.stringify(arr)) }
}

function summarize(kind: Schedule['payload']['kind']): { subject: string; body: string } {
  const today = new Date().toISOString().slice(0,10)
  if (kind==='daily-summary') return { subject: `HB summary ${today}`, body: 'Daily KPI summary (demo).'}
  return { subject: `HB weekly summary ${today}`, body: 'Weekly KPI summary (demo).'}
}

export async function runSchedules(now: Date = new Date()): Promise<void> {
  const arr = await listSchedules()
  const active = arr.filter(s=> s.enabled)
  for (const s of active) {
    const { subject, body } = summarize(s.payload.kind)
    await deliver({ channel:'console', payload: { ruleId:'schedule', title:`${s.title}: ${subject}`, message: body, level:'info', at: now.toISOString() } })
  }
}



export function isDue(lastRunISO: string | undefined, cadence: 'daily'|'weekly'|'monthly', now: Date = new Date()): boolean {
  if (!lastRunISO) return true
  const last = new Date(lastRunISO)
  if (cadence === 'daily') {
    return now.getDate() !== last.getDate() || now.getMonth()!=last.getMonth() || now.getFullYear()!=last.getFullYear()
  }
  if (cadence === 'weekly') {
    const isNewWeek = weekNum(now) !== weekNum(last) || now.getFullYear()!=last.getFullYear()
    return isNewWeek && now.getDay() === 1
  }
  return (now.getMonth() !== last.getMonth() || now.getFullYear()!=last.getFullYear()) && (now.getDate() === 1)
}

export function nextRunAt(_lastRunISO: string | undefined, cadence: 'daily'|'weekly'|'monthly', from: Date = new Date()): Date {
  const d = new Date(from)
  if (cadence === 'daily') { d.setDate(d.getDate() + 1); return d }
  if (cadence === 'weekly') { d.setDate(d.getDate() + 7); return d }
  d.setMonth(d.getMonth() + 1); return d
}

function weekNum(d: Date): number {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(),0,1))
  return Math.ceil((((dt.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
}

export function dueDigest(type: 'daily'|'weekly', prefs: UserPrefs, now: Date): boolean {
  const hour = prefs.digestHour ?? 9
  if (now.getHours() !== hour) return false
  if (type=='daily') return true
  const wday = prefs.digestWday ?? 1
  return now.getDay() === wday
}

export function buildDigestSignals(sinceISO: string): DeliveryPayload[] {
  return [{ ruleId:'digest', title:'Digest summary', message:'since '+sinceISO, level:'info', at: new Date().toISOString() }]
}
