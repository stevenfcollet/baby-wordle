import { useState } from 'react'
import Head from 'next/head'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [players, setPlayers] = useState([])
  const [config, setConfig] = useState(null)
  const [babyName, setBabyName] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testType, setTestType] = useState('reminder')
  const [testLoading, setTestLoading] = useState(false)

  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password }

  const showMsg = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const load = async (pw) => {
    const res = await fetch('/api/admin-players', { headers: { 'x-admin-password': pw } })
    if (res.status === 401) { showMsg('Wrong password', 'warn'); return }
    const data = await res.json()
    setPlayers(data.players)
    setConfig(data.config)
    setBabyName(data.config?.baby_name || '')
    setAuthed(true)
  }

  const saveName = async () => {
    const res = await fetch('/api/admin-action', { method: 'POST', headers, body: JSON.stringify({ action: 'set_name', babyName }) })
    if (res.ok) showMsg('Name saved!', 'success')
    else showMsg('Failed to save', 'warn')
  }

  const reveal = async () => {
    if (!confirm(`Reveal the name "${babyName}" to all players and send announcement emails?`)) return
    setLoading(true)
    const res = await fetch('/api/admin-action', { method: 'POST', headers, body: JSON.stringify({ action: 'reveal' }) })
    setLoading(false)
    if (res.ok) { showMsg('Announced! Emails sent to all players.', 'success'); setConfig(c => ({ ...c, is_revealed: true })) }
    else showMsg('Something went wrong', 'warn')
  }

  const addPlayer = async () => {
    if (!inviteName || !inviteEmail) return
    const res = await fetch('/api/admin-action', { method: 'POST', headers, body: JSON.stringify({ action: 'add_player', name: inviteName, email: inviteEmail }) })
    if (res.ok) { setInviteName(''); setInviteEmail(''); load(password) }
    else showMsg('Could not add player', 'warn')
  }

  const removePlayer = async (id) => {
    await fetch('/api/admin-action', { method: 'POST', headers, body: JSON.stringify({ action: 'remove_player', playerId: id }) })
    load(password)
  }

  const sendTestEmail = async () => {
    if (!testEmail.trim()) { showMsg('Enter an email address to send the test to', 'warn'); return }
    setTestLoading(true)
    const res = await fetch(`/api/test-email?to=${encodeURIComponent(testEmail)}&type=${testType}`, {
      headers: { 'x-admin-password': password }
    })
    setTestLoading(false)
    if (res.ok) showMsg(`Test "${testType}" email sent to ${testEmail}!`, 'success')
    else showMsg('Failed to send test email — check your Resend API key', 'warn')
  }

  const s = { fontFamily: 'sans-serif', maxWidth: 640, margin: '0 auto', padding: '24px 16px' }
  const card = { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '20px', marginBottom: 16 }
  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }
  const b = (color = '#3B6D11', textC = '#EAF3DE') => ({ padding: '9px 18px', borderRadius: 8, border: 'none', background: color, color: textC, fontSize: 13, fontWeight: 600, cursor: 'pointer' })

  if (!authed) return (
    <main style={s}>
      <Head><title>Admin — Baby Wordle</title></Head>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Admin panel</h1>
      <div style={{ ...card, maxWidth: 320 }}>
        <input style={{ ...inp, width: '100%', marginBottom: 8 }} type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(password)} />
        <button style={{ ...b(), width: '100%' }} onClick={() => load(password)}>Sign in</button>
        {message && <Msg m={message} />}
      </div>
    </main>
  )

  const won = players.filter(p => p.won).length

  return (
    <main style={s}>
      <Head><title>Admin — Baby Wordle</title></Head>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Admin panel</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>{players.length} players · {won} guessed correctly</p>

      {message && <Msg m={message} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <p style={{ fontWeight: 600, fontSize: 14, marginTop: 0 }}>🔒 Baby's name</p>
          <input style={{ ...inp, width: '100%', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 600 }}
            value={babyName} onChange={e => setBabyName(e.target.value)} placeholder="e.g. CHARLOTTE" />
          <button style={b()} onClick={saveName}>Save name</button>
          <p style={{ fontSize: 12, color: '#aaa', margin: '8px 0 0' }}>Players only see the letter count.</p>
        </div>

        <div style={card}>
          <p style={{ fontWeight: 600, fontSize: 14, marginTop: 0 }}>🎉 Birth announcement</p>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Reveals the name to everyone and sends emails.</p>
          <button style={b('#27500A')} onClick={reveal} disabled={loading || config?.is_revealed}>
            {config?.is_revealed ? 'Already revealed' : loading ? 'Sending…' : 'Baby is born! Reveal name'}
          </button>
        </div>
      </div>

      {/* Test emails */}
      <div style={card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginTop: 0 }}>✉️ Test emails</p>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px' }}>Send a test email to yourself to preview how it looks.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            style={{ ...inp, flex: 2, minWidth: 180 }}
            type="email"
            placeholder="your@email.com"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
          />
          <select
            value={testType}
            onChange={e => setTestType(e.target.value)}
            style={{ ...inp, flex: 1, minWidth: 140, background: '#fff' }}
          >
            <option value="reminder">Daily reminder</option>
            <option value="win">Winner email</option>
            <option value="announcement">Birth announcement</option>
          </select>
          <button style={b('#185FA5', '#fff')} onClick={sendTestEmail} disabled={testLoading}>
            {testLoading ? 'Sending…' : 'Send test'}
          </button>
        </div>
      </div>

      {/* Players */}
      <div style={card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginTop: 0 }}>👥 Players</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Name" value={inviteName} onChange={e => setInviteName(e.target.value)} />
          <input style={{ ...inp, flex: 2 }} type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          <button style={b()} onClick={addPlayer}>Add</button>
        </div>
        <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 12px' }}>{players.length} player{players.length !== 1 ? 's' : ''} signed up</p>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#185FA5' }}>{p.name[0]}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{p.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{p.email}</p>
            </div>
            {p.won
              ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#EAF3DE', color: '#27500A' }}>Won</span>
              : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f5f5f5', color: '#888' }}>{p.last_guess_date ? 'Guessed today' : 'No guesses yet'}</span>
            }
            <button onClick={() => removePlayer(p.id)} style={{ background: 'none', border: 'none', color: '#e24b4a', cursor: 'pointer', fontSize: 13 }}>✕</button>
          </div>
        ))}
      </div>
    </main>
  )
}

function Msg({ m }) {
  const colors = { success: { bg: '#EAF3DE', color: '#27500A' }, info: { bg: '#E6F1FB', color: '#0C447C' }, warn: { bg: '#FAEEDA', color: '#633806' } }
  const c = colors[m.type] || colors.info
  return <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, margin: '10px 0', background: c.bg, color: c.color }}>{m.text}</div>
}
