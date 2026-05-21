import { supabaseAdmin } from '../../lib/supabase'
import { scoreGuess } from '../../lib/scoring'
import { Resend } from 'resend'
import { winEmail } from '../../lib/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { playerId, word } = req.body
  if (!playerId || !word) return res.status(400).json({ error: 'Missing fields' })

  // Get player
  const { data: player, error: playerError } = await supabaseAdmin
    .from('players')
    .select('id, name, email, won, last_guess_date')
    .eq('id', playerId)
    .single()

  if (playerError || !player) return res.status(404).json({ error: 'Player not found' })

  // Check they haven't already guessed today
  const today = new Date().toISOString().split('T')[0]
  if (player.last_guess_date === today) {
    return res.status(429).json({ error: 'already_guessed_today' })
  }

  // Get the baby name
  const { data: config } = await supabaseAdmin
    .from('game_config')
    .select('baby_name, is_revealed')
    .eq('id', 1)
    .single()

  if (!config?.baby_name) return res.status(400).json({ error: 'Game not configured yet' })
  if (config.is_revealed) return res.status(400).json({ error: 'Game is over' })

  const target = config.baby_name.toUpperCase()
  const guess = word.toUpperCase()

  if (guess.length !== target.length) {
    return res.status(400).json({ error: `Guess must be ${target.length} letters` })
  }

  const result = scoreGuess(guess, target)
  const won = guess === target

  // Save the guess
  await supabaseAdmin.from('guesses').insert({
    player_id: playerId,
    word: guess,
    result,
  })

  // Update player
  await supabaseAdmin
    .from('players')
    .update({ last_guess_date: today, won })
    .eq('id', playerId)

  // Send win email
  if (won) {
    const email = winEmail(player.name)
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: player.email,
      subject: email.subject,
      html: email.html,
    })
  }

  return res.status(200).json({ result, won })
}
