import { sendMail as mockMail } from '../utils/mailer.mock'

export async function sendMail(to: string, subject: string, body: string, attachments?: Array<{name:string; url:string}>) {
  const env = (import.meta as any).env || {}
  const provider = env.MAIL_PROVIDER || 'mock'
  const apiKey = env.MAIL_API_KEY || ''
  if (provider === 'mock' || !apiKey) return mockMail(to, subject, body, attachments)
  return mockMail(to, subject, body, attachments)
}
