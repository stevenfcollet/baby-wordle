import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const { data: player, error } = await supabaseAdmin
    .from('players')
    .select('id, name, email, won, last_guess_date')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (error || !player) return res.status(404).json({ error: 'not_found' })

  // Fetch their guesses
  const { data: guesses } = await supabaseAdmin
    .from('guesses')
    .select('word, result, guessed_at')
    .eq('player_id', player.id)
    .order('guessed_at', { ascending: true })

  // Fetch game config (name length only — never expose the name itself)
  const { data: config } = await supabaseAdmin
    .from('game_config')
    .select('baby_name, is_revealed')
    .eq('id', 1)
    .single()

  const nameLength = config?.baby_name?.length || 0
  const isRevealed = config?.is_revealed || false
  const revealedName = isRevealed ? config.baby_name : null

  return res.status(200).json({
    player: {
      id: player.id,
      name: player.name,
      email: player.email,
      won: player.won,
      lastGuessDate: player.last_guess_date,
    },
    guesses: guesses || [],
    nameLength,
    isRevealed,
    revealedName,
  })
}
