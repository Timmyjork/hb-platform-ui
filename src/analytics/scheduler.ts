export type Schedule = {
  id: string
  presetId: string
  cron: 'daily'|'weekly'|'monthly'
  format: 'csv'|'xlsx'|'png'
  chart?: 'trend'|'bar'|'pie'
  lastRunAt?: string
  active: boolean
}

const LS_KEY = 'hb:schedules'

export function listSchedules(): Schedule[] {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? (JSON.parse(raw) as Schedule[]) : [] } catch { return [] }
}
export function saveSchedule(s: Omit<Schedule,'id'|'lastRunAt'>): Schedule {
  const id = `sc_${Math.random().toString(36).slice(2,8)}`
  const next: Schedule = { id, ...s }
  const all = listSchedules(); all.push(next)
  localStorage.setItem(LS_KEY, JSON.stringify(all)); return next
}
export function updateSchedule(id: string, patch: Partial<Schedule>): Schedule | undefined {
  const all = listSchedules(); const i = all.findIndex(x=>x.id===id); if (i<0) return undefined
  all[i] = { ...all[i], ...patch }; localStorage.setItem(LS_KEY, JSON.stringify(all)); return all[i]
}
export function deleteSchedule(id: string) { const all = listSchedules().filter(x=>x.id!==id); localStorage.setItem(LS_KEY, JSON.stringify(all)) }

export function isDue(lastRunAt: string|undefined, cron: Schedule['cron'], now: Date): boolean {
  const last = lastRunAt ? new Date(lastRunAt) : new Date(0)
  const hour = 9
  if (cron==='daily') {
    const since = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour)
    return last < since && now >= since
  }
  if (cron==='weekly') {
    // Monday 09:00
    const day = (now.getDay()+6)%7 // 0..6 Mon=0
    const monday = new Date(now);
    monday.setDate(now.getDate()-day)
    monday.setHours(hour,0,0,0)
    return last < monday && now >= monday
  }
  // monthly: 1st 09:00
  const first = new Date(now.getFullYear(), now.getMonth(), 1, hour)
  return last < first && now >= first
}

export function nextRunAt(lastRunAt: string|undefined, cron: Schedule['cron'], now: Date): Date {
  if (cron==='daily') return new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 9)
  if (cron==='weekly') return new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 9)
  return new Date(now.getFullYear(), now.getMonth()+1, 1, 9)
}

