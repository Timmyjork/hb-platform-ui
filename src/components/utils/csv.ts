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

// Simple CSV parser supporting separators and double-quote escaping
function parseLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let i = 0
  let inQuotes = false
  while (i < line.length) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        // lookahead for escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        cur += ch
        i++
        continue
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
        continue
      }
      if (ch === sep) {
        out.push(cur)
        cur = ''
        i++
        continue
      }
      cur += ch
      i++
    }
  }
  out.push(cur)
  return out
}

export function parseCSV(text: string, separator = ','): Record<string, string>[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.length > 0)
  if (lines.length === 0) return []
  const header = parseLine(lines[0], separator)
  const rows: Record<string, string>[] = []
  for (let li = 1; li < lines.length; li++) {
    const cols = parseLine(lines[li], separator)
    const obj: Record<string, string> = {}
    for (let ci = 0; ci < header.length; ci++) {
      obj[header[ci]] = cols[ci] ?? ''
    }
    rows.push(obj)
  }
  return rows
}
