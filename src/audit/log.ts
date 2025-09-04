const KEY = 'hb.audit'

type Entry = { ts: string; event: string; payload?: unknown }

function read(): Entry[] { try { const raw = localStorage.getItem(KEY); return raw? JSON.parse(raw) as Entry[]: [] } catch { return [] } }
function write(rows: Entry[]) { localStorage.setItem(KEY, JSON.stringify(rows)) }

export function audit(event: string, payload?: unknown) { const rows = read(); rows.push({ ts: new Date().toISOString(), event, payload }); write(rows) }
