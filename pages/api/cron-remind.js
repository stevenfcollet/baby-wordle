import { supabaseAdmin } from '../../lib/supabase'
import { Resend } from 'resend'
import { reminderEmail } from '../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Protect this route — only Vercel Cron or you can call it
  const auth = req.headers.authorization
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Check game is still active
  const { data: config } = await supabaseAdmin
    .from('game_config')
    .select('baby_name, is_revealed')
    .eq('id', 1)
    .single()

  if (!config?.baby_name || config.is_revealed) {
    return res.status(200).json({ skipped: true, reason: 'Game not active' })
  }

  const today = new Date().toISOString().split('T')[0]

  // Find players who haven't guessed today and haven't won
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, name, email, last_guess_date, won')
    .eq('won', false)

  const toRemind = players?.filter(p => p.last_guess_date !== today) || []

  const results = await Promise.allSettled(
    toRemind.map(player => {
      const email = reminderEmail(player.name)
      return resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: player.email,
        subject: email.subject,
        html: email.html,
      })
    })
  )

  return res.status(200).json({ sent: toRemind.length, results })
}
