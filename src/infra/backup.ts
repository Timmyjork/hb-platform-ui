export function listKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('hb.')) keys.push(k)
  }
  return keys.sort()
}

export function snapshot(): Blob {
  const out: Record<string, unknown> = {}
  for (const k of listKeys()) {
    try { out[k] = JSON.parse(localStorage.getItem(k) || 'null') } catch { out[k] = localStorage.getItem(k) }
  }
  const json = JSON.stringify({ createdAt: new Date().toISOString(), data: out }, null, 2)
  return new Blob([json], { type: 'application/json' })
}

export async function restore(file: File | string): Promise<void> {
  let text = ''
  if (typeof file === 'string') text = file
  else text = await file.text()
  const parsed = JSON.parse(text) as { data?: Record<string, unknown> }
  const data = parsed.data || (JSON.parse(text) as Record<string, unknown>)
  for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v))
}
