export const DEV_CSP = "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
export function applyDevSecurity(): void {
  if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
    console.log('[SECURITY] CSP active (dev mock)')
  }
}
export const SAFE_HEADERS = { 'Referrer-Policy':'no-referrer', 'X-Content-Type-Options':'nosniff' }

