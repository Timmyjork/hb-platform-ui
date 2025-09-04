export type AlertChannel = 'email' | 'webhook'

export type Subscription = {
  id: string;
  ruleId: string;
  channels: AlertChannel[];
  email?: string;
  webhookUrl?: string;
  digest?: 'none' | 'daily' | 'weekly';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserPrefs = {
  defaultEmail?: string;
  defaultWebhookUrl?: string;
  timezone?: string;
  digestHour?: number; // 0..23
  digestWday?: number; // 0..6
};

export const SUBS_LS = 'hb.subscriptions';
export const PREFS_LS = 'hb.userprefs';

export function listSubscriptions(): Subscription[] {
  try { return JSON.parse(localStorage.getItem(SUBS_LS) || '[]') as Subscription[] } catch { return [] }
}

export function upsertSubscription(s: Omit<Subscription,'id'|'createdAt'|'updatedAt'> & { id?: string }): Subscription {
  const now = new Date().toISOString()
  const all = listSubscriptions()
  if (s.id) {
    const idx = all.findIndex(x=>x.id===s.id)
    if (idx>=0) {
      const next: Subscription = { ...all[idx], ...s, updatedAt: now }
      all[idx]=next; localStorage.setItem(SUBS_LS, JSON.stringify(all)); return next
    }
  }
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
  const created: Subscription = { ...(s as Omit<Subscription,'id'|'createdAt'|'updatedAt'>), id, createdAt: now, updatedAt: now }
  all.push(created); localStorage.setItem(SUBS_LS, JSON.stringify(all)); return created
}

export function removeSubscription(id: string): void {
  const next = listSubscriptions().filter(x=>x.id!==id)
  localStorage.setItem(SUBS_LS, JSON.stringify(next))
}

export function getUserPrefs(): UserPrefs {
  try { return JSON.parse(localStorage.getItem(PREFS_LS) || '{}') as UserPrefs } catch { return {} }
}

export function setUserPrefs(p: Partial<UserPrefs>): UserPrefs {
  const curr = getUserPrefs()
  const next = { ...curr, ...p }
  localStorage.setItem(PREFS_LS, JSON.stringify(next))
  return next
}

export function validateEmail(v?: string): boolean {
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function validateUrl(v?: string): boolean {
  if (!v) return false
  try { const u = new URL(v); return u.protocol==='http:'||u.protocol==='https:' } catch { return false }
}
