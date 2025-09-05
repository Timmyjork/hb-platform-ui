export function useRateLimit(key: string, maxPerMinute: number): { allowed: boolean; tryConsume(): boolean; resetAt: number } {
  const now = Date.now()
  const windowMs = 60_000
  const storageKey = `hb.ratelimit.${key}`
  let bucket: { start: number; count: number } = { start: now, count: 0 }
  try { const raw = localStorage.getItem(storageKey); if (raw) bucket = JSON.parse(raw) } catch (_e) { /* noop */ }
  const resetAt = bucket.start + windowMs
  const allowed = bucket.count < maxPerMinute || now > resetAt
  function tryConsume(): boolean {
    const t = Date.now()
    let b = bucket
    if (t > b.start + windowMs) b = { start: t, count: 0 }
    if (b.count >= maxPerMinute) { localStorage.setItem(storageKey, JSON.stringify(b)); return false }
    b.count += 1; bucket = b; localStorage.setItem(storageKey, JSON.stringify(b)); return true
  }
  return { allowed, tryConsume, resetAt }
}
