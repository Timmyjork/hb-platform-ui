const store = new Map<string, { expireAt: number; value: unknown; hits: number }>()

export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T> | T): Promise<T> {
  const now = Date.now()
  const row = store.get(key)
  if (row && row.expireAt > now) { row.hits++; return row.value as T }
  const value = await fetcher()
  store.set(key, { expireAt: now + Math.max(0, ttlMs), value, hits: 0 })
  return value
}

export function cacheStats(key: string) { const r = store.get(key); return { hits: r?.hits || 0 } }

