import { supabaseAdmin } from '../../lib/supabase'
import { Resend } from 'resend'
import { announcementEmail } from '../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { action, babyName } = req.body

    if (action === 'set_name') {
      if (!babyName) return res.status(400).json({ error: 'Name required' })
      await supabaseAdmin
        .from('game_config')
        .update({ baby_name: babyName.trim().toUpperCase() })
        .eq('id', 1)
      return res.status(200).json({ ok: true })
    }

    if (action === 'reveal') {
      // Get name
      const { data: config } = await supabaseAdmin
        .from('game_config')
        .select('baby_name')
        .eq('id', 1)
        .single()

      if (!config?.baby_name) return res.status(400).json({ error: 'No name set' })

      // Mark as revealed
      await supabaseAdmin
        .from('game_config')
        .update({ is_revealed: true, revealed_at: new Date().toISOString() })
        .eq('id', 1)

      // Email everyone
      const { data: players } = await supabaseAdmin
        .from('players')
        .select('name, email, won')

      await Promise.allSettled(
        (players || []).map(player => {
          const email = announcementEmail(player.name, config.baby_name, player.won)
          return resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: player.email,
            subject: email.subject,
            html: email.html,
          })
        })
      )

      return res.status(200).json({ ok: true, name: config.baby_name })
    }

    if (action === 'add_player') {
      const { name, email } = req.body
      if (!name || !email) return res.status(400).json({ error: 'Name and email required' })
      const { error } = await supabaseAdmin
        .from('players')
        .insert({ name: name.trim(), email: email.trim().toLowerCase() })
      if (error) return res.status(409).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'remove_player') {
      const { playerId } = req.body
      await supabaseAdmin.from('players').delete().eq('id', playerId)
      return res.status(200).json({ ok: true })
    }
  }

  return res.status(405).end()
}
