const KEY = 'hb.idempotency'

function load(): Record<string, string> { try { const raw = localStorage.getItem(KEY); return raw? JSON.parse(raw) as Record<string,string>: {} } catch { return {} } }
function save(map: Record<string,string>) { localStorage.setItem(KEY, JSON.stringify(map)) }

export async function withIdempotency<T>(key: string, fn: () => Promise<T> | T): Promise<{ reused: boolean; value: T | undefined }> {
  const map = load()
  if (map[key]) return { reused: true, value: undefined as any }
  const val = await fn()
  map[key] = new Date().toISOString()
  save(map)
  return { reused: false, value: val }
}
