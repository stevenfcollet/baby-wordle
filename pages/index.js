import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const TILE_COLORS = {
  correct: { bg: '#3B6D11', text: '#EAF3DE' },
  present: { bg: '#bda107', text: '#FAEEDA' },
  absent:  { bg: '#454544', text: '#F1EFE8' },
}

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

export default function Home() {
  const [screen, setScreen] = useState('auth') // auth | signup | welcome | play
  const [player, setPlayer] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [nameLength, setNameLength] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealedName, setRevealedName] = useState(null)
  const [currentInput, setCurrentInput] = useState([])
  const [keyColors, setKeyColors] = useState({})
  const [message, setMessage] = useState(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auth form
  const [loginEmail, setLoginEmail] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')

  const showMsg = (text, type = 'info') => {
  setMessage({ text, type })
  if (type === 'warn') setTimeout(() => setMessage(null), 4000)
}

  const today = () => new Date().toISOString().split('T')[0]

  const computeKeyColors = (gs) => {
    const colors = {}
    gs.forEach(g => {
      g.word.split('').forEach((l, i) => {
        const r = g.result[i]
        const cur = colors[l]
        if (r === 'correct' || (r === 'present' && cur !== 'correct') || (!cur && r === 'absent')) {
          colors[l] = r
        }
      })
    })
    return colors
  }

  const enterPlay = (playerData, gs, nLen, revealed, rName) => {
    setPlayer(playerData)
    setGuesses(gs)
    setNameLength(nLen)
    setIsRevealed(revealed)
    setRevealedName(rName)
    setKeyColors(computeKeyColors(gs))
    setCurrentInput([])
    setScreen('play')

    if (playerData.won) {
      showMsg('You already guessed it! Well done — now just wait for the big day.', 'success')
      setLocked(true)
    } else if (revealed) {
      showMsg(`The baby has arrived! The name is ${rName}. Congratulations!`, 'success')
      setLocked(true)
    } else if (playerData.lastGuessDate === today()) {
      showMsg("You've already guessed today. You'll get an email reminder tomorrow!", 'info')
      setLocked(true)
    } else {
      setLocked(false)
    }
  }

  const handleLogin = async () => {
    if (!loginEmail.trim()) return
    setLoading(true)
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail }),
    })
    setLoading(false)
    if (res.status === 404) { showMsg('No account found. Use "Sign up to play" below.', 'warn'); return }
    const data = await res.json()
    enterPlay(data.player, data.guesses, data.nameLength, data.isRevealed, data.revealedName)
  }

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmail.trim()) { showMsg('Please fill in both fields.', 'warn'); return }
    setLoading(true)
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: signupName, email: signupEmail }),
    })
    setLoading(false)
    if (res.status === 409) { showMsg('That email already has an account — sign in instead.', 'warn'); return }
    if (!res.ok) { showMsg('Something went wrong. Try again.', 'warn'); return }
    // Sign them in immediately
    const res2 = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail }),
    })
    const data = await res2.json()
    setPlayer(data.player)
    setNameLength(data.nameLength)
    setGuesses([])
    setScreen('welcome')
  }

  const handleKey = useCallback((k) => {
    if (locked || screen !== 'play') return
    if (k === '⌫') setCurrentInput(c => c.slice(0, -1))
    else if (k === 'ENTER') submitGuess()
    else if (currentInput.length < nameLength) setCurrentInput(c => [...c, k])
  }, [locked, screen, currentInput, nameLength])

  const submitGuess = async () => {
    if (currentInput.length !== nameLength) { showMsg(`Name must be ${nameLength} letters`, 'warn'); return }
    const word = currentInput.join('')
    setLoading(true)
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player.id, word }),
    })
    setLoading(false)

    if (res.status === 429) { showMsg("You've already guessed today!", 'warn'); setLocked(true); return }
    if (!res.ok) { showMsg('Something went wrong. Try again.', 'warn'); return }

    const { result, won } = await res.json()
    const newGuess = { word, result }
    const newGuesses = [...guesses, newGuess]
    setGuesses(newGuesses)
    setKeyColors(computeKeyColors(newGuesses))
    setCurrentInput([])

    if (won) {
      showMsg('You got it! Amazing! Keep the secret until the baby arrives.', 'success')
      setPlayer(p => ({ ...p, won: true }))
      setLocked(true)
    } else {
      showMsg("Nice try! You'll get an email reminder for your next guess tomorrow.", 'info')
      setLocked(true)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (screen !== 'play') return
      if (e.key === 'Enter') handleKey('ENTER')
      else if (e.key === 'Backspace') handleKey('⌫')
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen, handleKey])

  const totalRows = Math.max(8, guesses.length + (locked ? 0 : 1))

  return (
    <>
      <Head>
  <title>Guess the name of Thomas en Eline's second baby</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
</Head>

      <main style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
  <div style={{ textAlign: 'center', marginBottom: 24 }}>
    <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
      Guess the baby's name
      <br />
      By Thomas, Eline &amp; Marcel
    </h1>

    {nameLength > 0 && (
      <>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          The name has {nameLength} letters · one guess per day<br/>
          Created by <a href="https://www.linkedin.com/in/steven-collet/" target="_blank" rel="noopener noreferrer">Steven Collet</a>
        </p>

        <br /><br />

        <div style={{ textAlign: 'left' }}>
          <b>How to play</b><br />

          <ul>
            <li>Each guess must be a six-letter word.</li>

            <li>The color of a tile will change to show you how close your guess was.</li>

            <li>If the tile turns green, the letter is in the word, and it is in the correct spot.</li>

            <li>If the tile turns yellow, the letter is in the word, but it is not in the correct spot.</li>

            <li>If the tile turns gray, the letter is not in the word.</li>
            <li>Use the keyboard below to type the name and press enter to submit your guess</li>
            <li><i>You have one guess per day, you will get a reminder email tomorrow</i></li>
          </ul>
        </div>
      </>
    )}
  </div>


        {/* AUTH SCREEN */}
        {screen === 'auth' && (
          <div style={card}>
            <p style={label}>Sign in to play<br/>
            If this is your first time, click &apos;sign up&apos; below.

            </p>
            <input style={input} type="email" placeholder="Your email address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="email" />
            <button style={btn} onClick={handleLogin} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
            {message && <Msg m={message} />}
            <div style={divider}><span style={{ padding: '0 10px', background: '#fff', color: '#aaa', fontSize: 12 }}>or</span></div>
            <button style={{ ...btn, background: 'transparent', color: '#555', border: '1px solid #ddd' }} onClick={() => { setMessage(null); setScreen('signup') }}>
              Sign up to play
            </button>
           <p style={{ color: '#000', fontSize: 12, marginTop: 32, fontStyle: 'italic' }}>
  Experiencing issues? Contact <a href="mailto:steven.f.collet@gmail.com?subject=Baby%20Wordle%20Thomas%20and%20Eline" target="_blank" rel="noopener noreferrer">steven.f.collet@gmail.com</a>
  <br />Created by <a href="https://www.linkedin.com/in/steven-collet/" target="_blank" rel="noopener noreferrer">Steven Collet</a>
</p>
          </div>
        )}

        {/* SIGNUP SCREEN */}
        {screen === 'signup' && (
          <div style={card}>
            <button onClick={() => setScreen('auth')} style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', marginBottom: 12, padding: 0 }}>← Back</button>
            <p style={label}>Create your account</p>
            <input style={input} type="text" placeholder="Your name" value={signupName} onChange={e => setSignupName(e.target.value)} autoComplete="name" />
<input style={input} type="email" placeholder="Your email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} autoComplete="email" />
            <button style={btn} onClick={handleSignup} disabled={loading}>{loading ? 'Joining…' : 'Join the game'}</button>
            {message && <Msg m={message} />}
            <p style={{ color: '#000', fontSize: 12, marginTop: 32, fontStyle: 'italic' }}>
  Experiencing issues? Contact <a href="mailto:steven.f.collet@gmail.com?subject=Baby%20Wordle%20Thomas%20and%20Eline" target="_blank" rel="noopener noreferrer">steven.f.collet@gmail.com</a>
  <br />Created by <a href="https://www.linkedin.com/in/steven-collet/" target="_blank" rel="noopener noreferrer">Steven Collet</a>
</p>
          </div>
        )}

        {/* WELCOME SCREEN */}
        {screen === 'welcome' && (
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>You're in, {player?.name}!</p>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
              Welcome to the baby name guessing game. You get one guess every 24 hours. Good luck!
            </p>
            <button style={btn} onClick={() => { setScreen('play'); setLocked(false) }}>Make your first guess</button>
          </div>
        )}

        {/* PLAY SCREEN */}
        {screen === 'play' && (
          <>
            {message && <Msg m={message} />}

            {/* Board */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', margin: '16px 0' }}>
              {Array.from({ length: totalRows }, (_, r) => {
                const guess = guesses[r]
                const isActive = !locked && r === guesses.length
                return (
                  <div key={r} style={{ display: 'flex', gap: 6 }}>
                    {Array.from({ length: nameLength }, (_, c) => {
                      const letter = isActive ? currentInput[c] : guess?.word[c]
                      const result = guess?.result[c]
                      const style = result ? TILE_COLORS[result] : {}
                      return (
                        <div key={c} style={{
                          width: Math.min(52, Math.floor(320 / nameLength)),
                          height: Math.min(52, Math.floor(320 / nameLength)),
                          border: result ? 'none' : `2px solid ${letter ? '#888' : '#ddd'}`,
                          borderRadius: 6,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, fontWeight: 600, textTransform: 'uppercase',
                          background: style.bg || 'transparent',
                          color: style.text || '#000',
                        }}>
                          {letter || ''}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Keyboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', opacity: locked ? 0.4 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
              {KB_ROWS.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 4 }}>
                  {row.map(k => {
                    const c = keyColors[k]
                    const colors = c ? TILE_COLORS[c] : {}
                    return (
                      <button key={k} onClick={() => handleKey(k)} style={{
                        minWidth: k.length > 1 ? 52 : 36, height: 44,
                        padding: '0 6px', borderRadius: 6,
                        border: '1px solid #ddd',
                        background: colors.bg || '#f0f0f0',
                        color: colors.text || '#000',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        {k}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}

function Msg({ m }) {
  const colors = {
    success: { bg: '#EAF3DE', color: '#27500A' },
    info: { bg: '#E6F1FB', color: '#0C447C' },
    warn: { bg: '#FAEEDA', color: '#633806' },
  }
  const c = colors[m.type] || colors.info
  return <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, margin: '10px 0', background: c.bg, color: c.color }}>{m.text}</div>
}

const card = { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '24px 20px', maxWidth: 360, margin: '0 auto' }
const label = { fontSize: 15, fontWeight: 600, margin: '0 0 14px' }
const input = { display: 'block', width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }
const btn = { display: 'block', width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#3B6D11', color: '#EAF3DE', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const divider = { display: 'flex', alignItems: 'center', margin: '14px 0', borderTop: '1px solid #eee', position: 'relative', textAlign: 'center' }
