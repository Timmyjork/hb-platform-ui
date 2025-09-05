type Mail = { to:string; subject:string; html:string; at:string }
type Sms = { to:string; text:string; at:string }
const LS_MAIL='hb.mailbox', LS_SMS='hb.smsbox'
function readM(): Mail[] { try { const raw = localStorage.getItem(LS_MAIL); return raw? JSON.parse(raw) as Mail[]: [] } catch { return [] } }
function writeM(rows: Mail[]) { localStorage.setItem(LS_MAIL, JSON.stringify(rows)) }
function readS(): Sms[] { try { const raw = localStorage.getItem(LS_SMS); return raw? JSON.parse(raw) as Sms[]: [] } catch { return [] } }
function writeS(rows: Sms[]) { localStorage.setItem(LS_SMS, JSON.stringify(rows)) }
export async function sendMail(to:string, subject:string, html:string):Promise<void> { console.info('[MAIL]', { to, subject }); const rows = readM(); rows.push({ to, subject, html, at: new Date().toISOString() }); writeM(rows) }
export async function sendSMS(to:string, text:string):Promise<void> { console.info('[SMS]', { to, text }); const rows = readS(); rows.push({ to, text, at: new Date().toISOString() }); writeS(rows) }

