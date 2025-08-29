function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function flattenRow(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (isObject(v)) {
      Object.assign(out, flattenRow(v, key))
    } else {
      out[key] = v as unknown
    }
  }
  return out
}

function csvEscape(val: unknown, sep: string): string {
  let s = val == null ? '' : String(val)
  const needsQuotes = s.includes(sep) || s.includes('"') || s.includes('\n')
  if (needsQuotes) {
    s = '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function toCSV(rows: Record<string, unknown>[], separator = ','): string {
  const flat = rows.map((r) => flattenRow(r))
  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r)))).sort()
  const lines = [headers.join(separator)]
  for (const r of flat) {
    lines.push(headers.map((h) => csvEscape(r[h], separator)).join(separator))
  }
  return lines.join('\n')
}

export { flattenRow }

