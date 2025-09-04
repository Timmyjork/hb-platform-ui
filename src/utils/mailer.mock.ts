export function sendMail(to: string, subject: string, body: string, attachments?: Array<{name:string; url:string}>) {
  console.log('[MAIL]', { to, subject, body, attachments })
}

