import { Resend } from 'resend'
import { reminderEmail, winEmail, announcementEmail } from '../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Admin only
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { to, type = 'all' } = req.query

  if (!to) {
    return res.status(400).json({ error: 'Missing ?to=email@example.com parameter' })
  }

  const types = type === 'all' ? ['reminder', 'win', 'announcement'] : [type]
  const results = []

  for (const t of types) {
    let email
    if (t === 'reminder') email = reminderEmail('Test Player')
    else if (t === 'win') email = winEmail('Test Player')
    else if (t === 'announcement') email = announcementEmail('Test Player', 'CHARLOTTE', false)
    else continue

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: `[TEST] ${email.subject}`,
      html: email.html,
    })

    results.push({ type: t, result })
  }

  return res.status(200).json({ sent: results.length, results })
}
