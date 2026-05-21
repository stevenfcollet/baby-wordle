import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, name, email, won, last_guess_date, created_at')
    .order('created_at', { ascending: true })

  const { data: config } = await supabaseAdmin
    .from('game_config')
    .select('baby_name, is_revealed')
    .eq('id', 1)
    .single()

  return res.status(200).json({ players: players || [], config })
}
