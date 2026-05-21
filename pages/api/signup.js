import { supabaseAdmin } from '../../lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email } = req.body
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' })

  const normalizedEmail = email.trim().toLowerCase()

  // Check if already registered
  const { data: existing } = await supabaseAdmin
    .from('players')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  if (existing) return res.status(409).json({ error: 'already_registered' })

  // Insert player
  const { error } = await supabaseAdmin
    .from('players')
    .insert({ name: name.trim(), email: normalizedEmail })

  if (error) return res.status(500).json({ error: error.message })

  // Send welcome email
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: normalizedEmail,
    subject: "You're in — start guessing the baby's name!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px">Welcome, ${name.trim()}!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          You've joined the baby name guessing game. You get one guess every 24 hours
          until the baby is born. Good luck!
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#3B6D11;color:#EAF3DE;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
          Make your first guess
        </a>
      </div>
    `
  })

  return res.status(200).json({ ok: true })
}
