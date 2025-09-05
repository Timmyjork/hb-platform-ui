export function validateSlug(s: string): true | 'E_SLUG_FORMAT' {
  const v = String(s || '').trim()
  if (v.length < 3 || v.length > 50) return 'E_SLUG_FORMAT'
  if (!/^[a-z0-9-]+$/.test(v)) return 'E_SLUG_FORMAT'
  if (/--/.test(v) || v.startsWith('-') || v.endsWith('-')) return 'E_SLUG_FORMAT'
  return true
}

export function formatSlugError(e: unknown): string {
  const msg = typeof e === 'string' ? e : (e as any)?.message
  if (msg?.includes?.('E_SLUG_TAKEN')) {
    return 'Такий слаг уже зайнятий, спробуйте інший.'
  }
  if (msg?.includes?.('E_SLUG_FORMAT')) {
    return 'Слаг має містити тільки [a–z0–9-], довжина 3–50, без подвійних дефісів.'
  }
  return 'Помилка збереження. Спробуйте ще раз.'
}

export function normalize(input: string): string {
  const s = String(input || '').trim().toLowerCase()
  let norm = s.replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
  norm = norm.replace(/^-+/, '').replace(/-+$/, '')
  return norm
}
