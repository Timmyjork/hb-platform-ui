export async function sendSMS(toPhoneE164: string, text: string) {
  const env = (import.meta as any).env || {}
  const provider = env.SMS_PROVIDER || 'mock'
  const apiKey = env.SMS_API_KEY || ''
  if (provider === 'mock' || !apiKey) {
    console.log('[SMS]', { to: toPhoneE164, text })
    return { ok: true }
  }
  console.log('[SMS]', { to: toPhoneE164, text })
  return { ok: true }
}
