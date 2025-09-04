import type { SellerVerification } from './types'

const LS = 'hb.verifications'

function read(): SellerVerification[] { try { const raw = localStorage.getItem(LS); return raw? JSON.parse(raw) as SellerVerification[]: [] } catch { return [] } }
function write(rows: SellerVerification[]): SellerVerification[] { localStorage.setItem(LS, JSON.stringify(rows)); return rows }

export function get(breederId: string): SellerVerification { const rows = seedIfEmpty(read()); return rows.find(v=>v.breederId===breederId) || { breederId, status:'unverified', updatedAt: new Date().toISOString() } as SellerVerification }
export function submit(breederId: string, docs: string[]): SellerVerification { const rows = read(); const v: SellerVerification = { breederId, status: 'pending', docs, updatedAt: new Date().toISOString() }; const i = rows.findIndex(x=>x.breederId===breederId); if (i>=0) rows[i]=v; else rows.unshift(v); write(rows); return v }
export function approve(breederId: string): SellerVerification { const rows = read(); const i = rows.findIndex(x=>x.breederId===breederId); const v: SellerVerification = { breederId, status: 'verified', updatedAt: new Date().toISOString(), docs: rows[i]?.docs }; if (i>=0) rows[i]=v; else rows.unshift(v); write(rows); return v }
export function reject(breederId: string, note?: string): SellerVerification { const rows = read(); const i = rows.findIndex(x=>x.breederId===breederId); const v: SellerVerification = { breederId, status: 'unverified', note, updatedAt: new Date().toISOString(), docs: rows[i]?.docs }; if (i>=0) rows[i]=v; else rows.unshift(v); write(rows); return v }

function seedIfEmpty(rows: SellerVerification[]): SellerVerification[] { if (rows.length) return rows; const now = new Date().toISOString(); const seed: SellerVerification[] = [{ breederId:'B1', status:'verified', updatedAt: now }, { breederId:'B2', status:'pending', updatedAt: now }]; return write(seed) }
